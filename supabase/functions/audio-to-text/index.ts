
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🎤 Audio-to-text function called (AssemblyAI)');
    
    const { audioData, isSpeech, timestamp } = await req.json()

    console.log('📥 Request payload:', {
      hasAudioData: !!audioData,
      audioDataLength: audioData?.length || 0,
      isSpeech,
      timestamp: timestamp ? new Date(timestamp).toISOString() : 'undefined'
    });

    if (!audioData) {
      console.error('❌ No audio data provided');
      throw new Error('No audio data provided')
    }

    // Only process speech chunks
    if (!isSpeech) {
      console.log('⏭️ Skipping non-speech chunk');
      return new Response(
        JSON.stringify({ 
          transcript: '', 
          isFinal: false, 
          confidence: 0,
          isSpeech: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔊 Processing speech chunk with AssemblyAI...');

    // Convert base64 to binary
    const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
    console.log('✅ Base64 converted to binary, size:', binaryAudio.length, 'bytes');

    // Check if audio is too small
    if (binaryAudio.length < 1000) {
      console.log('⚠️ Audio chunk too small, skipping');
      return new Response(
        JSON.stringify({ 
          transcript: '', 
          isFinal: false, 
          confidence: 0,
          isSpeech: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const assemblyApiKey = Deno.env.get('ASSEMBLYAI_API_KEY');
    if (!assemblyApiKey) {
      console.error('❌ ASSEMBLYAI_API_KEY not found in environment');
      throw new Error('AssemblyAI API key not configured');
    }

    console.log('✅ AssemblyAI API key found, making request...');

    // Prepare form data for AssemblyAI
    const formData = new FormData()
    const audioBlob = new Blob([binaryAudio], { type: 'audio/raw' })
    formData.append('audio', audioBlob, 'audio.raw')

    const assemblyStartTime = Date.now();

    // Use AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      console.log('📡 Sending request to AssemblyAI API...');

      // Send to AssemblyAI with raw PCM format
      const assemblyResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          'Authorization': assemblyApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: `data:audio/raw;base64,${audioData}`,
          speech_model: 'best',
          language_detection: true,
          punctuate: true,
          format_text: true,
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId);
      const assemblyTime = Date.now() - assemblyStartTime;
      console.log('📡 AssemblyAI response received in', assemblyTime, 'ms, status:', assemblyResponse.status);

      if (!assemblyResponse.ok) {
        const errorText = await assemblyResponse.text()
        console.error('❌ AssemblyAI API error:', {
          status: assemblyResponse.status,
          statusText: assemblyResponse.statusText,
          errorText
        });
        
        // Return empty result instead of throwing error
        return new Response(
          JSON.stringify({ 
            transcript: '', 
            isFinal: false, 
            confidence: 0,
            isSpeech: false,
            error: `AssemblyAI error: ${assemblyResponse.status}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const result = await assemblyResponse.json()
      console.log('✅ AssemblyAI JSON parsed:', {
        hasId: !!result.id,
        status: result.status,
        hasText: !!result.text
      });

      // For real-time, we need to poll for the result if it's still processing
      let transcript = '';
      let confidence = 0;
      
      if (result.status === 'completed') {
        transcript = result.text || '';
        confidence = result.confidence || 0.8;
      } else if (result.id) {
        // Poll for result if still processing
        const pollResult = await pollForTranscript(result.id, assemblyApiKey);
        transcript = pollResult.text || '';
        confidence = pollResult.confidence || 0.8;
      }

      console.log('📝 Extracted transcript:', {
        transcript: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
        confidence,
        hasContent: transcript.length > 0,
        fullLength: transcript.length
      });

      const responseData = { 
        transcript,
        isFinal: true,
        confidence,
        isSpeech: true,
        timestamp
      };

      console.log('📤 Returning response:', responseData);

      return new Response(
        JSON.stringify(responseData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ AssemblyAI request timed out after 8 seconds');
        return new Response(
          JSON.stringify({ 
            transcript: '', 
            isFinal: false, 
            confidence: 0,
            isSpeech: false,
            error: 'AssemblyAI timeout'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('❌ Error in audio-to-text function:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Return empty result instead of 500 error to prevent breaking the flow
    return new Response(
      JSON.stringify({ 
        transcript: '', 
        isFinal: false, 
        confidence: 0,
        isSpeech: false,
        error: error.message
      }),
      {
        status: 200, // Changed from 500 to 200 to prevent breaking the flow
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Helper function to poll for transcript result
async function pollForTranscript(transcriptId: string, apiKey: string, maxAttempts = 10): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`🔄 Polling AssemblyAI transcript ${transcriptId}, attempt ${attempt + 1}`);
    
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      console.error('❌ Error polling transcript:', response.status);
      break;
    }

    const result = await response.json();
    
    if (result.status === 'completed') {
      console.log('✅ Transcript completed');
      return result;
    } else if (result.status === 'error') {
      console.error('❌ Transcript failed:', result.error);
      break;
    }

    // Wait before next poll (shorter interval for real-time feel)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return { text: '', confidence: 0 };
}

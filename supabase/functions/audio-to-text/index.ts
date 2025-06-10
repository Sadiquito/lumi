
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
    console.log('🎤 Audio-to-text function called');
    
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

    console.log('🔊 Processing speech chunk, converting base64 to binary...');

    // Convert base64 to binary
    const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
    console.log('✅ Base64 converted to binary, size:', binaryAudio.length, 'bytes');

    // Check if audio is too small or too large
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

    if (binaryAudio.length > 25000000) { // 25MB limit
      console.log('⚠️ Audio chunk too large, truncating');
      const truncatedAudio = binaryAudio.slice(0, 25000000);
      console.log('✂️ Truncated audio to:', truncatedAudio.length, 'bytes');
    }

    // Prepare form data for Deepgram - send raw PCM data
    const formData = new FormData()
    const audioBlob = new Blob([binaryAudio], { type: 'audio/raw' })
    formData.append('audio', audioBlob, 'audio.raw')

    console.log('📡 Sending request to Deepgram API...');

    const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY');
    if (!deepgramApiKey) {
      console.error('❌ DEEPGRAM_API_KEY not found in environment');
      throw new Error('Deepgram API key not configured');
    }

    console.log('✅ Deepgram API key found, making request...');

    const deepgramStartTime = Date.now();

    // Use AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      // Send to Deepgram with raw PCM format and shorter timeout
      const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en-US&smart_format=true&punctuate=true&diarize=false&encoding=linear16&sample_rate=24000&channels=1', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${deepgramApiKey}`,
        },
        body: formData,
        signal: controller.signal
      })

      clearTimeout(timeoutId);
      const deepgramTime = Date.now() - deepgramStartTime;
      console.log('📡 Deepgram response received in', deepgramTime, 'ms, status:', deepgramResponse.status);

      if (!deepgramResponse.ok) {
        const errorText = await deepgramResponse.text()
        console.error('❌ Deepgram API error:', {
          status: deepgramResponse.status,
          statusText: deepgramResponse.statusText,
          errorText
        });
        
        // Return empty result instead of throwing error
        return new Response(
          JSON.stringify({ 
            transcript: '', 
            isFinal: false, 
            confidence: 0,
            isSpeech: false,
            error: `Deepgram error: ${deepgramResponse.status}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const result = await deepgramResponse.json()
      console.log('✅ Deepgram JSON parsed:', {
        hasResults: !!result.results,
        channelsCount: result.results?.channels?.length || 0,
        alternativesCount: result.results?.channels?.[0]?.alternatives?.length || 0
      });

      // Extract transcript from Deepgram response
      const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
      const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0

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
        console.error('❌ Deepgram request timed out after 8 seconds');
        return new Response(
          JSON.stringify({ 
            transcript: '', 
            isFinal: false, 
            confidence: 0,
            isSpeech: false,
            error: 'Deepgram timeout'
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

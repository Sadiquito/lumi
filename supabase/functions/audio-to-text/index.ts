
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

    console.log('Processing audio chunk:', {
      audioLength: audioData.length,
      isSpeech,
      timestamp: new Date(timestamp).toISOString()
    })

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

    // Prepare form data for Deepgram
    const formData = new FormData()
    const audioBlob = new Blob([binaryAudio], { type: 'audio/wav' })
    formData.append('audio', audioBlob)

    console.log('📡 Sending request to Deepgram API...');

    const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY');
    if (!deepgramApiKey) {
      console.error('❌ DEEPGRAM_API_KEY not found in environment');
      throw new Error('Deepgram API key not configured');
    }

    console.log('✅ Deepgram API key found, making request with timeout...');

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      // Send to Deepgram with timeout
      const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${deepgramApiKey}`,
        },
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId);
      console.log('📡 Deepgram response status:', deepgramResponse.status);

      if (!deepgramResponse.ok) {
        const errorText = await deepgramResponse.text()
        console.error('❌ Deepgram API error:', {
          status: deepgramResponse.status,
          statusText: deepgramResponse.statusText,
          errorText
        });
        throw new Error(`Deepgram API error: ${deepgramResponse.status} ${errorText}`)
      }

      const result = await deepgramResponse.json()
      console.log('✅ Deepgram response received:', {
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

      return new Response(
        JSON.stringify({ 
          transcript,
          isFinal: true,
          confidence,
          isSpeech: true,
          timestamp
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('❌ Deepgram request timed out after 15 seconds');
        throw new Error('Speech recognition request timed out. Please try speaking more clearly or check your connection.');
      }
      
      console.error('❌ Fetch error:', fetchError);
      throw fetchError;
    }

  } catch (error) {
    console.error('❌ Error in audio-to-text function:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.name || 'UnknownError'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

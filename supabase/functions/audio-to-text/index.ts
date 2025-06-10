
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

    // Send to Deepgram
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
      },
      body: formData,
    })

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
    console.log('✅ Deepgram response:', result)

    // Extract transcript from Deepgram response
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0

    console.log('📝 Extracted transcript:', {
      transcript,
      confidence,
      hasContent: transcript.length > 0
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

  } catch (error) {
    console.error('❌ Error in audio-to-text function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

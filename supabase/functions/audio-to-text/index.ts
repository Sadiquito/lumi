
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
    const { audioData, isSpeech, timestamp } = await req.json()

    if (!audioData) {
      throw new Error('No audio data provided')
    }

    console.log('Processing audio chunk:', {
      audioLength: audioData.length,
      isSpeech,
      timestamp: new Date(timestamp).toISOString()
    })

    // Only process speech chunks
    if (!isSpeech) {
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

    // Convert base64 to binary
    const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))

    // Prepare form data for Deepgram
    const formData = new FormData()
    const audioBlob = new Blob([binaryAudio], { type: 'audio/wav' })
    formData.append('audio', audioBlob)

    // Send to Deepgram
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${Deno.env.get('DEEPGRAM_API_KEY')}`,
      },
      body: formData,
    })

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text()
      console.error('Deepgram API error:', errorText)
      throw new Error(`Deepgram API error: ${deepgramResponse.status} ${errorText}`)
    }

    const result = await deepgramResponse.json()
    console.log('Deepgram response:', result)

    // Extract transcript from Deepgram response
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0

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
    console.error('Error in audio-to-text function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

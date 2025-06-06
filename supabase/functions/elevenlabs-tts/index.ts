
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    // Create Supabase client for user verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { text, voice_id = '9BWtsMINqrJLrRacOk9x', model_id = 'eleven_multilingual_v2', voice_settings } = await req.json()

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get ElevenLabs API key
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      console.error('ElevenLabs API key not configured')
      return new Response(
        JSON.stringify({ error: 'TTS service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Default voice settings for warm, humanlike female voice
    const defaultVoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    }

    const finalVoiceSettings = { ...defaultVoiceSettings, ...voice_settings }

    console.log('Generating TTS with ElevenLabs:', { 
      voice_id, 
      model_id, 
      textLength: text.length,
      settings: finalVoiceSettings
    })

    // Call ElevenLabs API
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id,
          voice_settings: finalVoiceSettings,
        }),
      }
    )

    if (!elevenLabsResponse.ok) {
      const errorData = await elevenLabsResponse.text()
      console.error('ElevenLabs API error:', errorData)
      return new Response(
        JSON.stringify({ 
          error: `TTS generation failed: ${elevenLabsResponse.status}`,
          details: errorData
        }),
        { 
          status: elevenLabsResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get the audio data
    const audioBuffer = await elevenLabsResponse.arrayBuffer()
    
    // Convert to base64 for transport
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))
    
    // Create a data URL for the audio
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`

    console.log('TTS generation successful, audio size:', audioBuffer.byteLength)

    return new Response(
      JSON.stringify({ 
        audio_url: audioDataUrl,
        audio_size: audioBuffer.byteLength,
        voice_id,
        model_id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

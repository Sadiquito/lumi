
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
    // Validate ElevenLabs API key first
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      console.error('ElevenLabs API key not configured')
      return new Response(
        JSON.stringify({ 
          error: 'Voice generation service is temporarily unavailable. The text response is available above.' 
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client for user verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the user from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Please sign in again to continue' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { text, voice_id = '9BWtsMINqrJLrRacOk9x', model_id = 'eleven_multilingual_v2', voice_settings } = await req.json()

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required for voice generation' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate text length
    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Text is too long for voice generation. Please use shorter responses.' }),
        { 
          status: 400, 
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

    // Call ElevenLabs API with retry logic
    let elevenLabsResponse: Response;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        elevenLabsResponse = await fetch(
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

        if (elevenLabsResponse.ok) {
          break; // Success, exit retry loop
        }

        // Handle specific ElevenLabs errors
        if (elevenLabsResponse.status === 401) {
          console.error('ElevenLabs API key is invalid')
          return new Response(
            JSON.stringify({ error: 'Voice service authentication failed. Please try text mode.' }),
            { 
              status: 503, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else if (elevenLabsResponse.status === 429) {
          // Rate limited, try again after delay
          retryCount++
          if (retryCount < maxRetries) {
            console.log(`Rate limited, retrying in ${retryCount * 2} seconds...`)
            await new Promise(resolve => setTimeout(resolve, retryCount * 2000))
            continue
          } else {
            return new Response(
              JSON.stringify({ error: 'Voice service is busy. Please try again in a moment.' }),
              { 
                status: 429, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        } else if (elevenLabsResponse.status >= 500) {
          // Server error, retry
          retryCount++
          if (retryCount < maxRetries) {
            console.log(`Server error ${elevenLabsResponse.status}, retrying...`)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            continue
          }
        }

        // If we get here, it's a non-retryable error
        const errorData = await elevenLabsResponse.text()
        console.error('ElevenLabs API error:', errorData)
        throw new Error(`Voice generation failed: ${elevenLabsResponse.status}`)

      } catch (error) {
        retryCount++
        if (retryCount >= maxRetries) {
          console.error('All ElevenLabs retry attempts failed:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Voice generation service is temporarily unavailable. The text response is available above.'
            }),
            { 
              status: 503, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        console.log(`Attempt ${retryCount} failed, retrying...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
      }
    }

    // Get the audio data
    const audioBuffer = await elevenLabsResponse.arrayBuffer()
    
    if (audioBuffer.byteLength === 0) {
      throw new Error('Received empty audio response')
    }
    
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
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    let userMessage = 'Voice generation failed. The text response is available above.'
    
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      userMessage = 'Network issue detected. Voice generation is temporarily unavailable.'
    } else if (errorMessage.includes('Rate limit') || errorMessage.includes('busy')) {
      userMessage = 'Voice service is busy. Please try again in a moment.'
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

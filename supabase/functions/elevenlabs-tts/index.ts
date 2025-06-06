import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Health logging helper
const logHealthMetric = async (supabase: any, metric: string, value: number, metadata: any = {}) => {
  try {
    await supabase.from('system_health').insert({
      metric_name: metric,
      metric_value: value,
      metric_date: new Date().toISOString().split('T')[0],
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  } catch (error) {
    console.error('Failed to log health metric:', error);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const requestStartTime = Date.now();
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  )

  try {
    // Validate ElevenLabs API key first
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      console.error('[TTS] ElevenLabs API key not configured')
      await logHealthMetric(supabaseClient, 'tts_config_error', 1, {
        error: 'ElevenLabs API key not configured'
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'TTS_SERVICE_UNAVAILABLE',
          fallback_message: 'Voice generation is temporarily unavailable. Text response is available above.',
          should_fallback_to_text: true
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client for user verification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'TTS_AUTH_REQUIRED',
          fallback_message: 'Please sign in to use voice features.',
          should_fallback_to_text: true
        }),
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
        JSON.stringify({ 
          error: 'TTS_AUTH_INVALID',
          fallback_message: 'Please sign in again to use voice features.',
          should_fallback_to_text: true
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { text, voice_id = '9BWtsMINqrJLrRacOk9x', model_id = 'eleven_multilingual_v2', voice_settings } = await req.json()

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'TTS_NO_TEXT',
          fallback_message: 'No text provided for voice generation.',
          should_fallback_to_text: true
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate text length
    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ 
          error: 'TTS_TEXT_TOO_LONG',
          fallback_message: 'Text is too long for voice generation. Please use shorter responses.',
          should_fallback_to_text: true
        }),
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

    console.log('[TTS] Generating TTS with ElevenLabs:', { 
      voice_id, 
      model_id, 
      textLength: text.length,
      settings: finalVoiceSettings
    })

    // Call ElevenLabs API with retry logic
    let elevenLabsResponse: Response;
    let retryCount = 0;
    const maxRetries = 2;
    const startTime = Date.now();

    while (retryCount <= maxRetries) {
      try {
        console.log(`[TTS] Attempt ${retryCount + 1}/${maxRetries + 1} started`);
        
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

        const responseTime = Date.now() - startTime;

        if (elevenLabsResponse.ok) {
          // Log successful attempt
          await logHealthMetric(supabaseClient, 'tts_success', 1, {
            attempt: retryCount + 1,
            response_time: responseTime,
            text_length: text.length,
            voice_id,
            model_id
          });
          
          console.log(`[TTS] Success on attempt ${retryCount + 1}, response time: ${responseTime}ms`);
          break; // Success, exit retry loop
        }

        // Log failed attempt
        await logHealthMetric(supabaseClient, 'tts_attempt_failed', 1, {
          attempt: retryCount + 1,
          status: elevenLabsResponse.status,
          response_time: responseTime
        });

        // Handle specific ElevenLabs errors
        if (elevenLabsResponse.status === 401) {
          console.error('[TTS] ElevenLabs API key is invalid')
          return new Response(
            JSON.stringify({ 
              error: 'TTS_AUTH_ERROR',
              fallback_message: 'Voice service authentication failed. Text response is available above.',
              should_fallback_to_text: true
            }),
            { 
              status: 503, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        } else if (elevenLabsResponse.status === 429) {
          // Rate limited, try again after delay
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount + 1) * 1000; // Exponential backoff
            console.log(`Rate limited, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            retryCount++
            continue
          } else {
            return new Response(
              JSON.stringify({ 
                error: 'TTS_RATE_LIMIT',
                fallback_message: 'Voice service is busy. Text response is available above.',
                should_fallback_to_text: true
              }),
              { 
                status: 429, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        } else if (elevenLabsResponse.status >= 500) {
          // Server error, retry
          if (retryCount < maxRetries) {
            console.log(`Server error ${elevenLabsResponse.status}, retrying...`)
            await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000))
            retryCount++
            continue
          } else {
            return new Response(
              JSON.stringify({ 
                error: 'TTS_SERVER_ERROR',
                fallback_message: 'Voice service is temporarily unavailable. Text response is available above.',
                should_fallback_to_text: true
              }),
              { 
                status: 503, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        }

        // If we get here, it's a non-retryable error
        const errorData = await elevenLabsResponse.text()
        console.error('ElevenLabs API error:', errorData)
        throw new Error(`TTS_API_ERROR: ${elevenLabsResponse.status}`)

      } catch (error) {
        console.error(`[TTS] Attempt ${retryCount + 1} failed:`, error)
        
        if (retryCount >= maxRetries) {
          await logHealthMetric(supabaseClient, 'tts_final_failure', 1, {
            error: error.toString(),
            total_attempts: maxRetries + 1,
            response_time: Date.now() - startTime
          });
          
          return new Response(
            JSON.stringify({ 
              error: 'TTS_ALL_ATTEMPTS_FAILED',
              fallback_message: 'Voice generation failed after multiple attempts. Text response is available above.',
              should_fallback_to_text: true
            }),
            { 
              status: 503, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        
        // Exponential backoff for network errors
        const delay = Math.pow(2, retryCount + 1) * 1000
        console.log(`Network error, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        retryCount++
      }
    }

    // Get the audio data
    const audioBuffer = await elevenLabsResponse.arrayBuffer()
    
    if (audioBuffer.byteLength === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'TTS_EMPTY_RESPONSE',
          fallback_message: 'Voice generation returned empty audio. Text response is available above.',
          should_fallback_to_text: true
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    // Convert to base64 for transport
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)))
    
    // Create a data URL for the audio
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`

    const totalResponseTime = Date.now() - requestStartTime;
    console.log(`[TTS] Request completed successfully in ${totalResponseTime}ms, audio size: ${audioBuffer.byteLength}`);

    await logHealthMetric(supabaseClient, 'tts_request_success', 1, {
      total_response_time: totalResponseTime,
      audio_size: audioBuffer.byteLength,
      text_length: text.length
    });

    return new Response(
      JSON.stringify({ 
        audio_url: audioDataUrl,
        audio_size: audioBuffer.byteLength,
        voice_id,
        model_id,
        fallback: false
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    const totalResponseTime = Date.now() - requestStartTime;
    console.error('[TTS] Request failed:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'TTS_UNKNOWN_ERROR'
    
    await logHealthMetric(supabaseClient, 'tts_request_failure', 1, {
      error: errorMessage,
      total_response_time: totalResponseTime
    });
    
    let fallbackMessage = 'Voice generation failed. Text response is available above.'
    
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      fallbackMessage = 'Network issue detected. Voice generation is temporarily unavailable.'
    } else if (errorMessage.includes('TTS_RATE_LIMIT') || errorMessage.includes('busy')) {
      fallbackMessage = 'Voice service is busy. Please try again in a moment.'
    } else if (errorMessage.includes('TTS_AUTH_ERROR')) {
      fallbackMessage = 'Voice service authentication failed. Please contact support if this persists.'
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        fallback_message: fallbackMessage,
        should_fallback_to_text: true
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscriptionRequest {
  audio: string; // base64 encoded audio
  language?: string;
  prompt?: string;
}

interface TranscriptionResponse {
  text: string;
  confidence?: number;
  duration?: number;
  language?: string;
}

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Health logging helper
const logHealthMetric = async (metric: string, value: number, metadata: any = {}) => {
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

// Process base64 audio in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

async function trackTranscriptionUsage(userId: string, audioLength: number) {
  try {
    const { error } = await supabase
      .from('transcription_usage')
      .insert({
        user_id: userId,
        audio_duration: audioLength,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to track usage:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Usage tracking error:', error);
    return false;
  }
}

async function checkUsageLimits(userId: string): Promise<boolean> {
  try {
    // Check if user has premium access
    const { data: hasPremium, error: premiumError } = await supabase
      .rpc('has_premium_access', { user_id: userId });

    if (premiumError) {
      console.error('Error checking premium access:', premiumError);
      return true; // Allow on error (graceful degradation)
    }

    if (hasPremium) {
      return true; // Premium users have unlimited access
    }

    // Check daily usage for trial users
    const today = new Date().toISOString().split('T')[0];
    const { data: usage, error: usageError } = await supabase
      .from('transcription_usage')
      .select('audio_duration')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (usageError) {
      console.error('Error checking usage:', usageError);
      return true; // Allow on error
    }

    const totalDuration = usage?.reduce((sum, record) => sum + (record.audio_duration || 0), 0) || 0;
    const dailyLimit = 300; // 5 minutes per day for trial users

    return totalDuration < dailyLimit;
  } catch (error) {
    console.error('Usage limit check error:', error);
    return true; // Allow on error
  }
}

async function transcribeWithRetry(formData: FormData, maxRetries = 2): Promise<any> {
  let lastError: Error | null = null;
  const startTime = Date.now();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[TRANSCRIPTION] Attempt ${attempt}/${maxRetries} started`);
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: formData,
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        
        // Log failed attempt
        await logHealthMetric('transcription_attempt_failed', 1, {
          attempt,
          status: response.status,
          error: errorText,
          response_time: responseTime
        });
        
        // Handle specific OpenAI errors
        if (response.status === 401) {
          throw new Error('TRANSCRIPTION_AUTH_ERROR');
        } else if (response.status === 429) {
          // Rate limited, retry with exponential backoff
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            console.log(`Rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            throw new Error('TRANSCRIPTION_RATE_LIMIT');
          }
        } else if (response.status === 413) {
          throw new Error('TRANSCRIPTION_FILE_TOO_LARGE');
        } else if (response.status >= 500) {
          // Server error, retry
          if (attempt < maxRetries) {
            console.log(`Server error ${response.status}, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          } else {
            throw new Error('TRANSCRIPTION_SERVER_ERROR');
          }
        }
        
        throw new Error(`TRANSCRIPTION_API_ERROR: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.text || result.text.trim().length === 0) {
        throw new Error('TRANSCRIPTION_NO_SPEECH');
      }

      // Log successful transcription
      await logHealthMetric('transcription_success', 1, {
        attempt,
        response_time: responseTime,
        text_length: result.text.length,
        confidence: result.confidence || 0
      });

      console.log(`[TRANSCRIPTION] Success on attempt ${attempt}, response time: ${responseTime}ms`);

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`[TRANSCRIPTION] Attempt ${attempt} failed:`, error);
      
      // Don't retry for certain errors
      if (error.message.includes('TRANSCRIPTION_AUTH_ERROR') || 
          error.message.includes('TRANSCRIPTION_FILE_TOO_LARGE') ||
          error.message.includes('TRANSCRIPTION_NO_SPEECH')) {
        break;
      }
      
      if (attempt < maxRetries) {
        // Exponential backoff for retryable errors
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Log final failure
  await logHealthMetric('transcription_final_failure', 1, {
    error: lastError?.message || 'Unknown error',
    total_attempts: maxRetries,
    response_time: Date.now() - startTime
  });

  throw lastError || new Error('TRANSCRIPTION_UNKNOWN_ERROR');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const requestStartTime = Date.now();

  try {
    // Validate OpenAI API key
    if (!Deno.env.get('OPENAI_API_KEY')) {
      console.error('[TRANSCRIPTION] OpenAI API key not configured');
      await logHealthMetric('transcription_config_error', 1, {
        error: 'OpenAI API key not configured'
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'TRANSCRIPTION_SERVICE_UNAVAILABLE',
          fallback_message: 'Voice transcription is temporarily unavailable. Please use text input.'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get user ID from JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          error: 'TRANSCRIPTION_AUTH_REQUIRED',
          fallback_message: 'Please sign in to use voice features.'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'TRANSCRIPTION_AUTH_INVALID',
          fallback_message: 'Please sign in again to use voice features.'
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check usage limits
    const canUse = await checkUsageLimits(user.id);
    if (!canUse) {
      return new Response(
        JSON.stringify({ 
          error: 'TRANSCRIPTION_LIMIT_REACHED',
          fallback_message: 'Daily transcription limit reached. Please use text input or upgrade for unlimited access.'
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestData: TranscriptionRequest = await req.json();
    
    if (!requestData.audio) {
      await logHealthMetric('transcription_invalid_request', 1, {
        error: 'No audio data provided'
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'TRANSCRIPTION_NO_AUDIO',
          fallback_message: 'No audio data provided. Please try recording again.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('[TRANSCRIPTION] Processing audio transcription request...');

    // Process audio in chunks to prevent memory issues
    let binaryAudio: Uint8Array;
    let audioLength: number;
    
    try {
      binaryAudio = processBase64Chunks(requestData.audio);
      audioLength = binaryAudio.length / (16000 * 2); // Estimate duration in seconds
    } catch (error) {
      console.error('Audio processing error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'TRANSCRIPTION_INVALID_AUDIO',
          fallback_message: 'Invalid audio format. Please try recording again.'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Validate audio size
    if (binaryAudio.length > 25 * 1024 * 1024) { // 25MB limit
      return new Response(
        JSON.stringify({ 
          error: 'TRANSCRIPTION_FILE_TOO_LARGE',
          fallback_message: 'Audio file is too large. Please record shorter messages or use text input.'
        }),
        { 
          status: 413, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Prepare form data for OpenAI
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'verbose_json');
    
    if (requestData.language) {
      formData.append('language', requestData.language);
    }
    
    if (requestData.prompt) {
      formData.append('prompt', requestData.prompt);
    }

    // Transcribe with retry logic
    const result = await transcribeWithRetry(formData);

    // Track usage after successful transcription
    await trackTranscriptionUsage(user.id, audioLength);

    const totalResponseTime = Date.now() - requestStartTime;
    console.log(`[TRANSCRIPTION] Request completed successfully in ${totalResponseTime}ms`);

    await logHealthMetric('transcription_request_success', 1, {
      total_response_time: totalResponseTime,
      user_id: user.id,
      audio_size: binaryAudio.length
    });

    const response: TranscriptionResponse = {
      text: result.text || '',
      confidence: result.confidence || 0,
      duration: result.duration || audioLength,
      language: result.language || 'unknown'
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const totalResponseTime = Date.now() - requestStartTime;
    console.error('[TRANSCRIPTION] Request failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'TRANSCRIPTION_UNKNOWN_ERROR';
    
    await logHealthMetric('transcription_request_failure', 1, {
      error: errorMessage,
      total_response_time: totalResponseTime
    });
    
    // Map specific errors to user-friendly messages
    let fallbackMessage = 'Voice transcription failed. Please use text input.';
    let statusCode = 500;
    
    if (errorMessage.includes('TRANSCRIPTION_RATE_LIMIT')) {
      fallbackMessage = 'Voice service is busy. Please wait a moment and try again, or use text input.';
      statusCode = 429;
    } else if (errorMessage.includes('TRANSCRIPTION_SERVER_ERROR')) {
      fallbackMessage = 'Voice service is temporarily unavailable. Please use text input.';
      statusCode = 503;
    } else if (errorMessage.includes('TRANSCRIPTION_NO_SPEECH')) {
      fallbackMessage = 'No speech detected in audio. Please speak clearly and try again, or use text input.';
      statusCode = 400;
    } else if (errorMessage.includes('TRANSCRIPTION_AUTH_ERROR')) {
      fallbackMessage = 'Voice service authentication failed. Please use text input.';
      statusCode = 401;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        fallback_message: fallbackMessage,
        should_fallback_to_text: true
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

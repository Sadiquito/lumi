
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

async function transcribeWithRetry(formData: FormData, maxRetries = 3): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Transcription attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff: wait 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('All transcription attempts failed');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user ID from JWT
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check usage limits
    const canUse = await checkUsageLimits(user.id);
    if (!canUse) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily transcription limit reached. Upgrade for unlimited access.' 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const requestData: TranscriptionRequest = await req.json();
    
    if (!requestData.audio) {
      throw new Error('No audio data provided');
    }

    console.log('Processing audio transcription request...');

    // Process audio in chunks to prevent memory issues
    const binaryAudio = processBase64Chunks(requestData.audio);
    const audioLength = binaryAudio.length / (16000 * 2); // Estimate duration in seconds
    
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

    console.log('Transcription completed successfully');

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
    console.error('Transcription error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

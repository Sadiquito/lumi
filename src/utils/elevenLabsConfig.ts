
import { supabase } from '@/integrations/supabase/client';

export interface ElevenLabsConfig {
  apiKey: string | null;
  isConfigured: boolean;
}

/**
 * Retrieves ElevenLabs API key from Supabase secrets
 * This will be called from an edge function to keep the API key secure
 */
export const getElevenLabsConfig = async (): Promise<ElevenLabsConfig> => {
  try {
    // Call edge function to get API key securely
    const { data, error } = await supabase.functions.invoke('get-elevenlabs-config');
    
    if (error) {
      console.error('Error fetching ElevenLabs config:', error);
      return { apiKey: null, isConfigured: false };
    }
    
    return {
      apiKey: data?.apiKey || null,
      isConfigured: !!data?.apiKey
    };
  } catch (error) {
    console.error('Unexpected error fetching ElevenLabs config:', error);
    return { apiKey: null, isConfigured: false };
  }
};

/**
 * ElevenLabs voice configuration
 * Using Aria as the default recommended voice for warm, calm feel
 */
export const ELEVENLABS_VOICES = {
  aria: '9BWtsMINqrJLrRacOk9x',
  sarah: 'EXAVITQu4vr4xnSDxMaL',
  charlotte: 'XB0fDUnXU5powFXDhCwa',
  alice: 'Xb7hH8MSUJpSbSDYk0k2'
} as const;

export const DEFAULT_VOICE_ID = ELEVENLABS_VOICES.aria;

/**
 * ElevenLabs model configuration
 * Using Eleven Multilingual v2 for quality
 */
export const ELEVENLABS_MODEL = 'eleven_multilingual_v2';

/**
 * Default voice settings for optimal quality
 */
export const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true
};


/**
 * Audio synthesis interface and implementation with ElevenLabs integration
 */

export interface AudioSynthesisConfig {
  apiKey?: string;
  voiceId?: string;
  model?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface AudioSynthesisResult {
  audioUrl: string;
  audioBlob: Blob;
  duration?: number;
  voiceId: string;
  characterCount: number;
}

export interface AudioSynthesisProvider {
  synthesize(text: string, config?: AudioSynthesisConfig): Promise<AudioSynthesisResult>;
  isConfigured(): boolean;
  getAvailableVoices?(): Promise<Array<{ id: string; name: string; }>>;
}

// ElevenLabs implementation using Supabase Edge Function
class ElevenLabsSynthesisProvider implements AudioSynthesisProvider {
  private config: AudioSynthesisConfig;

  constructor(config: AudioSynthesisConfig = {}) {
    this.config = config;
  }

  async synthesize(text: string, overrideConfig?: AudioSynthesisConfig): Promise<AudioSynthesisResult> {
    const finalConfig = { ...this.config, ...overrideConfig };
    
    console.log('Synthesizing audio with ElevenLabs:', {
      textLength: text.length,
      config: finalConfig
    });

    // Call Supabase Edge Function
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
      body: {
        text: text.trim(),
        voice_id: finalConfig.voiceId || '9BWtsMINqrJLrRacOk9x', // Aria - warm female voice
        model_id: finalConfig.model || 'eleven_multilingual_v2',
        voice_settings: {
          stability: finalConfig.stability || 0.5,
          similarity_boost: finalConfig.similarityBoost || 0.75,
          style: finalConfig.style || 0.0,
          use_speaker_boost: finalConfig.useSpeakerBoost !== false
        }
      }
    });

    if (error) {
      console.error('ElevenLabs synthesis error:', error);
      throw new Error(`Synthesis failed: ${error.message}`);
    }

    if (!data || !data.audio_url) {
      throw new Error('No audio data received');
    }

    // Convert data URL to blob
    const response = await fetch(data.audio_url);
    const audioBlob = await response.blob();

    return {
      audioUrl: data.audio_url,
      audioBlob,
      duration: data.duration || 0,
      voiceId: data.voice_id,
      characterCount: text.length
    };
  }

  async getAvailableVoices() {
    // ElevenLabs voices for Lumi
    return [
      { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (Warm Female)' },
      { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Gentle Female)' },
      { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte (Calm Female)' },
      { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice (Friendly Female)' }
    ];
  }

  isConfigured(): boolean {
    // Since we're using Supabase Edge Function, check if it's available
    return true;
  }
}

// Dependency injection container
let synthesisProvider: AudioSynthesisProvider = new ElevenLabsSynthesisProvider();

export const setSynthesisProvider = (provider: AudioSynthesisProvider) => {
  synthesisProvider = provider;
};

export const getSynthesisProvider = (): AudioSynthesisProvider => {
  return synthesisProvider;
};

// Main synthesis function with dependency injection
export const synthesizeAudio = async (
  text: string, 
  config?: AudioSynthesisConfig
): Promise<AudioSynthesisResult> => {
  const provider = getSynthesisProvider();
  
  if (!provider.isConfigured()) {
    throw new Error('Audio synthesis provider is not configured');
  }

  if (!text.trim()) {
    throw new Error('Text is required for audio synthesis');
  }

  try {
    return await provider.synthesize(text, config);
  } catch (error) {
    console.error('Audio synthesis failed:', error);
    throw new Error(`Synthesis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Utility function to get available voices
export const getAvailableVoices = async () => {
  const provider = getSynthesisProvider();
  
  if (provider.getAvailableVoices) {
    return await provider.getAvailableVoices();
  }
  
  return [];
};

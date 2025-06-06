
/**
 * Audio transcription interface and implementation with Whisper integration
 */

export interface AudioTranscriptionConfig {
  apiKey?: string;
  model?: string;
  language?: string;
  temperature?: number;
}

export interface AudioTranscriptionResult {
  text: string;
  confidence?: number;
  duration?: number;
  language?: string;
}

export interface AudioTranscriptionProvider {
  transcribe(audioBlob: Blob, config?: AudioTranscriptionConfig): Promise<AudioTranscriptionResult>;
  isConfigured(): boolean;
}

// Whisper implementation using Supabase Edge Function
class WhisperTranscriptionProvider implements AudioTranscriptionProvider {
  private config: AudioTranscriptionConfig;

  constructor(config: AudioTranscriptionConfig = {}) {
    this.config = config;
  }

  async transcribe(audioBlob: Blob, overrideConfig?: AudioTranscriptionConfig): Promise<AudioTranscriptionResult> {
    const finalConfig = { ...this.config, ...overrideConfig };
    
    console.log('Transcribing audio with Whisper:', {
      audioSize: audioBlob.size,
      config: finalConfig
    });

    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Call Supabase Edge Function
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { data, error } = await supabase.functions.invoke('whisper-transcription', {
      body: {
        audio: base64Audio,
        language: finalConfig.language || 'en',
        prompt: 'Please transcribe this audio clearly and accurately.'
      }
    });

    if (error) {
      console.error('Whisper transcription error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }

    if (!data || !data.text) {
      throw new Error('No transcription text received');
    }

    return {
      text: data.text,
      confidence: data.confidence || 0.95,
      duration: data.duration || 0,
      language: data.language || finalConfig.language || 'en'
    };
  }

  isConfigured(): boolean {
    // Since we're using Supabase Edge Function, no local API key needed
    return true;
  }
}

// Dependency injection container
let transcriptionProvider: AudioTranscriptionProvider = new WhisperTranscriptionProvider();

export const setTranscriptionProvider = (provider: AudioTranscriptionProvider) => {
  transcriptionProvider = provider;
};

export const getTranscriptionProvider = (): AudioTranscriptionProvider => {
  return transcriptionProvider;
};

// Main transcription function with dependency injection
export const transcribeAudio = async (
  audioBlob: Blob, 
  config?: AudioTranscriptionConfig
): Promise<AudioTranscriptionResult> => {
  const provider = getTranscriptionProvider();
  
  if (!provider.isConfigured()) {
    throw new Error('Audio transcription provider is not configured');
  }

  try {
    return await provider.transcribe(audioBlob, config);
  } catch (error) {
    console.error('Audio transcription failed:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

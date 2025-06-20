
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini';
export type OpenAIVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';

export interface RealtimeEvent {
  type: string;
  [key: string]: any;
}

export interface SessionConfig {
  modalities: string[];
  instructions: string;
  voice: OpenAIVoice;
  input_audio_format: string;
  output_audio_format: string;
  input_audio_transcription: {
    model: string;
  };
}

export interface EphemeralTokenRequest {
  model: string;
  voice: OpenAIVoice;
}

export interface EphemeralTokenResponse {
  client_secret: {
    value: string;
  };
}

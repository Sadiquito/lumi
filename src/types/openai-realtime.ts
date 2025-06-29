export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini';
export type OpenAIVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';

export interface TurnDetection {
  type: 'server_vad';
  threshold?: number;
  prefix_padding_ms?: number;
  silence_duration_ms?: number;
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
  turn_detection?: TurnDetection;
  temperature?: number;
  max_response_output_tokens?: string | number;
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

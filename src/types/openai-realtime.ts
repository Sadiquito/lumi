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

// Base interface for all realtime events
export interface BaseRealtimeEvent {
  type: string;
  event_id?: string;
}

// Specific event types
export interface AudioDeltaEvent extends BaseRealtimeEvent {
  type: 'response.audio.delta';
  delta: string;
}

export interface AudioDoneEvent extends BaseRealtimeEvent {
  type: 'response.audio.done';
}

export interface TextDeltaEvent extends BaseRealtimeEvent {
  type: 'response.text.delta';
  delta: string;
}

export interface TextDoneEvent extends BaseRealtimeEvent {
  type: 'response.text.done';
  text: string;
}

export interface ConversationItemCreatedEvent extends BaseRealtimeEvent {
  type: 'conversation.item.created';
  item: {
    id: string;
    type: string;
    content?: any[];
  };
}

export interface SpeechStartedEvent extends BaseRealtimeEvent {
  type: 'input_audio_buffer.speech_started';
}

export interface SpeechStoppedEvent extends BaseRealtimeEvent {
  type: 'input_audio_buffer.speech_stopped';
}

export interface ErrorEvent extends BaseRealtimeEvent {
  type: 'error';
  error: {
    message: string;
    code?: string;
  };
}

// Union type for all possible realtime events
export type RealtimeEvent = 
  | AudioDeltaEvent
  | AudioDoneEvent  
  | TextDeltaEvent
  | TextDoneEvent
  | ConversationItemCreatedEvent
  | SpeechStartedEvent
  | SpeechStoppedEvent
  | ErrorEvent
  | BaseRealtimeEvent; // fallback for unknown events

// Outgoing message types
export interface SessionUpdateMessage {
  type: 'session.update';
  session: SessionConfig;
}

export interface ResponseCreateMessage {
  type: 'response.create';
  response?: {
    modalities?: string[];
    instructions?: string;
  };
}

export interface ConversationItemCreateMessage {
  type: 'conversation.item.create';
  item: {
    type: string;
    content: any[];
  };
}

// Union type for all possible outgoing messages  
export type RealtimeMessage = 
  | SessionUpdateMessage
  | ResponseCreateMessage
  | ConversationItemCreateMessage
  | { type: string; [key: string]: any }; // fallback for other message types

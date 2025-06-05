
export interface ConversationMessage {
  id: string;
  content: string;
  timestamp: Date;
  speaker: 'user' | 'ai';
  type: 'text' | 'audio';
  metadata?: {
    duration?: number;
    confidence?: number;
    audioUrl?: string;
  };
}

export interface ConversationContext {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  totalDuration: number;
  topics: string[];
}

// Import the enhanced conversation state types
export type ConversationState = 
  | 'idle' 
  | 'listening' 
  | 'processing' 
  | 'speaking'
  | 'waiting_for_user'
  | 'waiting_for_ai';

export interface ConversationStateData {
  currentState: ConversationState;
  previousState: ConversationState | null;
  stateStartTime: Date;
  canTransitionTo: ConversationState[];
  timeoutMs?: number;
  error?: string;
}

export interface StateTransition {
  from: ConversationState;
  to: ConversationState;
  timestamp: Date;
  duration: number;
  reason?: string;
  turnOwner: 'user' | 'ai' | 'none';
  isValid: boolean;
}

export interface ConversationConfig {
  timeouts: {
    listening: number;
    processing: number;
    speaking: number;
    idle: number;
    waiting_for_user: number;
    waiting_for_ai: number;
  };
  maxHistorySize: number;
  autoTransitions: boolean;
}

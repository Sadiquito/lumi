
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
  turnOwner: 'user' | 'ai' | 'none';
  stateHistory: StateTransition[];
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
  strictTurnEnforcement: boolean;
}

export interface UseConversationStateProps {
  config?: Partial<ConversationConfig>;
  onStateChange?: (state: ConversationState, previous: ConversationState | null) => void;
  onTimeout?: (state: ConversationState) => void;
  onError?: (error: string) => void;
  onTurnViolation?: (attemptedState: ConversationState, currentTurn: 'user' | 'ai' | 'none') => void;
}

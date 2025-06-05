
export type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface ConversationStateData {
  currentState: ConversationState;
  previousState: ConversationState | null;
  stateStartTime: Date;
  canTransitionTo: ConversationState[];
  timeoutMs?: number;
  error?: string;
}

export interface ConversationConfig {
  timeouts: {
    listening: number;
    processing: number;
    speaking: number;
    idle: number;
  };
  maxHistorySize: number;
  autoTransitions: boolean;
}

export interface UseConversationStateProps {
  config?: Partial<ConversationConfig>;
  onStateChange?: (state: ConversationState, previous: ConversationState | null) => void;
  onTimeout?: (state: ConversationState) => void;
  onError?: (error: string) => void;
}

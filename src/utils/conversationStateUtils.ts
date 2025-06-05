
import { ConversationState, StateTransition, ConversationConfig } from '@/types/conversation';

export const DEFAULT_CONVERSATION_CONFIG: ConversationConfig = {
  timeouts: {
    listening: 10000, // 10 seconds
    processing: 30000, // 30 seconds
    speaking: 60000, // 1 minute
    idle: 300000, // 5 minutes
  },
  maxHistorySize: 100,
  autoTransitions: true,
};

export const STATE_TRANSITIONS: Record<ConversationState, ConversationState[]> = {
  idle: ['listening'],
  listening: ['processing', 'idle'],
  processing: ['speaking', 'idle'],
  speaking: ['listening', 'idle'],
};

export function canTransition(from: ConversationState, to: ConversationState): boolean {
  return STATE_TRANSITIONS[from].includes(to);
}

export function validateStateTransition(
  from: ConversationState,
  to: ConversationState
): { valid: boolean; error?: string } {
  if (!canTransition(from, to)) {
    return {
      valid: false,
      error: `Invalid transition from "${from}" to "${to}". Allowed transitions: ${STATE_TRANSITIONS[from].join(', ')}`,
    };
  }
  return { valid: true };
}

export function calculateStateDuration(startTime: Date, endTime: Date): number {
  return endTime.getTime() - startTime.getTime();
}

export function shouldTimeout(
  currentState: ConversationState,
  stateStartTime: Date,
  config: ConversationConfig
): boolean {
  const now = new Date();
  const duration = calculateStateDuration(stateStartTime, now);
  const timeout = config.timeouts[currentState];
  return timeout > 0 && duration >= timeout;
}

export function getNextStateOnTimeout(currentState: ConversationState): ConversationState {
  // Most states timeout to idle, except speaking which can go to listening
  switch (currentState) {
    case 'speaking':
      return 'listening';
    default:
      return 'idle';
  }
}

export function generateSessionId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

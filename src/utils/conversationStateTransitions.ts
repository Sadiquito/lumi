
import { ConversationState } from '@/types/conversationState';

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

export function getNextStateOnTimeout(currentState: ConversationState): ConversationState {
  switch (currentState) {
    case 'speaking':
      return 'listening';
    default:
      return 'idle';
  }
}

export function getAllowedTransitions(state: ConversationState): ConversationState[] {
  return STATE_TRANSITIONS[state] || [];
}

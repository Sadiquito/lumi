
import { ConversationState } from '@/types/conversationState';

export const STATE_TRANSITIONS: Record<ConversationState, ConversationState[]> = {
  idle: ['listening', 'waiting_for_user'],
  listening: ['processing', 'idle'],
  processing: ['speaking', 'waiting_for_ai', 'idle'],
  speaking: ['waiting_for_user', 'idle'],
  waiting_for_user: ['listening', 'idle'],
  waiting_for_ai: ['speaking', 'processing', 'idle'],
};

export const TURN_OWNERSHIP: Record<ConversationState, 'user' | 'ai' | 'none'> = {
  idle: 'none',
  listening: 'user',
  processing: 'ai',
  speaking: 'ai',
  waiting_for_user: 'user',
  waiting_for_ai: 'ai',
};

export function canTransition(from: ConversationState, to: ConversationState): boolean {
  return STATE_TRANSITIONS[from].includes(to);
}

export function validateStateTransition(
  from: ConversationState,
  to: ConversationState,
  strictTurnEnforcement: boolean = true
): { valid: boolean; error?: string; turnViolation?: boolean } {
  
  // Check basic transition validity
  if (!canTransition(from, to)) {
    return {
      valid: false,
      error: `Invalid transition from "${from}" to "${to}". Allowed transitions: ${STATE_TRANSITIONS[from].join(', ')}`,
    };
  }

  // Check turn ownership violations if strict enforcement is enabled
  if (strictTurnEnforcement) {
    const fromOwner = TURN_OWNERSHIP[from];
    const toOwner = TURN_OWNERSHIP[to];
    
    // Detect overlapping ownership (both user and AI active)
    if (fromOwner !== 'none' && toOwner !== 'none' && fromOwner !== toOwner) {
      // Only allow certain cross-ownership transitions
      const allowedCrossOwnership = [
        ['listening', 'processing'], // User speech -> AI processing
        ['speaking', 'waiting_for_user'], // AI speaking -> Wait for user
        ['waiting_for_user', 'listening'], // Wait for user -> User starts speaking
        ['waiting_for_ai', 'processing'], // Wait for AI -> AI starts processing
        ['waiting_for_ai', 'speaking'], // Wait for AI -> AI starts speaking
      ];
      
      const isAllowed = allowedCrossOwnership.some(
        ([allowedFrom, allowedTo]) => allowedFrom === from && allowedTo === to
      );
      
      if (!isAllowed) {
        return {
          valid: false,
          error: `Turn violation: Cannot transition from ${from} (${fromOwner}) to ${to} (${toOwner}) - overlapping ownership not allowed`,
          turnViolation: true,
        };
      }
    }
  }

  return { valid: true };
}

export function getNextStateOnTimeout(currentState: ConversationState): ConversationState {
  switch (currentState) {
    case 'speaking':
      return 'waiting_for_user';
    case 'listening':
      return 'waiting_for_ai';
    case 'processing':
      return 'waiting_for_user';
    case 'waiting_for_user':
      return 'idle';
    case 'waiting_for_ai':
      return 'idle';
    default:
      return 'idle';
  }
}

export function getAllowedTransitions(state: ConversationState): ConversationState[] {
  return STATE_TRANSITIONS[state] || [];
}

export function getTurnOwner(state: ConversationState): 'user' | 'ai' | 'none' {
  return TURN_OWNERSHIP[state];
}

export function isUserTurn(state: ConversationState): boolean {
  return TURN_OWNERSHIP[state] === 'user';
}

export function isAITurn(state: ConversationState): boolean {
  return TURN_OWNERSHIP[state] === 'ai';
}

export function canUserAct(state: ConversationState): boolean {
  return ['idle', 'waiting_for_user'].includes(state);
}

export function canAIAct(state: ConversationState): boolean {
  return ['idle', 'waiting_for_ai', 'processing'].includes(state);
}


import { ConversationConfig } from '@/types/conversationState';

export const DEFAULT_CONVERSATION_CONFIG: ConversationConfig = {
  timeouts: {
    listening: 30000, // 30 seconds
    processing: 15000, // 15 seconds
    speaking: 0, // No timeout - determined by speech length
    idle: 0, // No timeout
    waiting_for_user: 60000, // 1 minute
    waiting_for_ai: 10000, // 10 seconds
  },
  maxHistorySize: 50,
  autoTransitions: true,
  strictTurnEnforcement: true,
};

export { canTransition } from './conversationStateTransitions';

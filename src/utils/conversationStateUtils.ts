
import { ConversationConfig } from '@/types/conversationState';

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

export function generateSessionId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Re-export from transitions for backward compatibility
export { canTransition } from './conversationStateTransitions';


import { ConversationState, ConversationConfig } from '@/types/conversationState';

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


import { useEffect, useRef } from 'react';
import { ConversationState, ConversationConfig } from '@/types/conversationState';
import { shouldTimeout } from '@/utils/conversationStateTimeouts';
import { getNextStateOnTimeout } from '@/utils/conversationStateTransitions';

interface UseConversationStateTimeoutsProps {
  currentState: ConversationState;
  config: ConversationConfig;
  stateStartTimeRef: React.MutableRefObject<Date>;
  onTimeout?: (state: ConversationState) => void;
  transitionTo: (newState: ConversationState, reason?: string) => boolean;
}

export const useConversationStateTimeouts = ({
  currentState,
  config,
  stateStartTimeRef,
  onTimeout,
  transitionTo,
}: UseConversationStateTimeoutsProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const timeoutMs = config.timeouts[currentState];
    if (timeoutMs > 0 && config.autoTransitions) {
      timeoutRef.current = setTimeout(() => {
        if (shouldTimeout(currentState, stateStartTimeRef.current, config)) {
          const nextState = getNextStateOnTimeout(currentState);
          console.log(`State timeout: ${currentState} -> ${nextState}`);
          
          if (onTimeout) {
            onTimeout(currentState);
          }
          
          transitionTo(nextState, 'timeout');
        }
      }, timeoutMs);
    }
  }, [currentState, config, onTimeout, transitionTo, stateStartTimeRef]);
};

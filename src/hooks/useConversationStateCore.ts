
import { useState, useCallback, useRef } from 'react';
import { ConversationState, ConversationStateData, ConversationConfig } from '@/types/conversationState';
import { StateTransition } from '@/types/conversation';
import { validateStateTransition, getAllowedTransitions } from '@/utils/conversationStateTransitions';
import { calculateStateDuration } from '@/utils/conversationStateTimeouts';
import { DEFAULT_CONVERSATION_CONFIG } from '@/utils/conversationStateUtils';

interface UseConversationStateCoreProps {
  config: ConversationConfig;
  onStateChange?: (state: ConversationState, previous: ConversationState | null) => void;
  onError?: (error: string) => void;
}

export const useConversationStateCore = ({
  config,
  onStateChange,
  onError,
}: UseConversationStateCoreProps) => {
  const [stateData, setStateData] = useState<ConversationStateData>({
    currentState: 'idle',
    previousState: null,
    stateStartTime: new Date(),
    canTransitionTo: ['listening'],
    timeoutMs: config.timeouts.idle,
  });

  const [stateHistory, setStateHistory] = useState<StateTransition[]>([]);
  const stateStartTimeRef = useRef<Date>(new Date());

  const transitionTo = useCallback((
    newState: ConversationState,
    reason?: string
  ): boolean => {
    const validation = validateStateTransition(stateData.currentState, newState);
    
    if (!validation.valid) {
      const error = validation.error || 'Invalid state transition';
      console.error(error);
      if (onError) {
        onError(error);
      }
      setStateData(prev => ({ ...prev, error }));
      return false;
    }

    const now = new Date();
    const duration = calculateStateDuration(stateStartTimeRef.current, now);
    
    // Record state transition
    const transition: StateTransition = {
      from: stateData.currentState,
      to: newState,
      timestamp: now,
      duration,
      reason,
    };

    setStateHistory(prev => [...prev.slice(-19), transition]);
    
    // Update state data
    setStateData(prev => ({
      currentState: newState,
      previousState: prev.currentState,
      stateStartTime: now,
      canTransitionTo: getAllowedTransitions(newState),
      timeoutMs: config.timeouts[newState],
      error: undefined,
    }));

    stateStartTimeRef.current = now;

    if (onStateChange) {
      onStateChange(newState, stateData.currentState);
    }

    console.log(`State transition: ${stateData.currentState} -> ${newState}${reason ? ` (${reason})` : ''}`);
    return true;
  }, [stateData.currentState, config, onStateChange, onError]);

  const getStateDuration = useCallback((): number => {
    return calculateStateDuration(stateStartTimeRef.current, new Date());
  }, []);

  return {
    stateData,
    stateHistory,
    transitionTo,
    getStateDuration,
    stateStartTimeRef,
    setStateHistory,
  };
};

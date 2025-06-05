
import { useState, useCallback, useRef } from 'react';
import { ConversationState, ConversationStateData, ConversationConfig } from '@/types/conversationState';
import { StateTransition } from '@/types/conversation';
import { validateStateTransition, getAllowedTransitions, getTurnOwner } from '@/utils/conversationStateTransitions';
import { calculateStateDuration } from '@/utils/conversationStateTimeouts';

interface UseConversationStateCoreProps {
  config: ConversationConfig;
  onStateChange?: (state: ConversationState, previous: ConversationState | null) => void;
  onError?: (error: string) => void;
  onTurnViolation?: (attemptedState: ConversationState, currentTurn: 'user' | 'ai' | 'none') => void;
}

export const useConversationStateCore = ({
  config,
  onStateChange,
  onError,
  onTurnViolation,
}: UseConversationStateCoreProps) => {
  const [stateData, setStateData] = useState<ConversationStateData>({
    currentState: 'idle',
    previousState: null,
    stateStartTime: new Date(),
    canTransitionTo: ['listening', 'waiting_for_user'],
    timeoutMs: config.timeouts.idle,
    turnOwner: 'none',
    stateHistory: [],
  });

  const stateStartTimeRef = useRef<Date>(new Date());

  const transitionTo = useCallback((
    newState: ConversationState,
    reason?: string
  ): boolean => {
    const validation = validateStateTransition(
      stateData.currentState, 
      newState, 
      config.strictTurnEnforcement
    );
    
    if (!validation.valid) {
      const error = validation.error || 'Invalid state transition';
      console.error(error);
      
      if (validation.turnViolation && onTurnViolation) {
        onTurnViolation(newState, getTurnOwner(stateData.currentState));
      }
      
      if (onError) {
        onError(error);
      }
      
      setStateData(prev => ({ ...prev, error }));
      return false;
    }

    const now = new Date();
    const duration = calculateStateDuration(stateStartTimeRef.current, now);
    const newTurnOwner = getTurnOwner(newState);
    
    // Record state transition with enhanced metadata
    const transition: StateTransition = {
      from: stateData.currentState,
      to: newState,
      timestamp: now,
      duration,
      reason,
      turnOwner: newTurnOwner,
      isValid: true,
    };

    // Update state data with enhanced turn management
    setStateData(prev => {
      const newHistory = [...prev.stateHistory.slice(-19), transition];
      
      return {
        currentState: newState,
        previousState: prev.currentState,
        stateStartTime: now,
        canTransitionTo: getAllowedTransitions(newState),
        timeoutMs: config.timeouts[newState],
        error: undefined,
        turnOwner: newTurnOwner,
        stateHistory: newHistory,
      };
    });

    stateStartTimeRef.current = now;

    if (onStateChange) {
      onStateChange(newState, stateData.currentState);
    }

    console.log(`State transition: ${stateData.currentState} -> ${newState} [${getTurnOwner(stateData.currentState)} -> ${newTurnOwner}]${reason ? ` (${reason})` : ''}`);
    return true;
  }, [stateData.currentState, config, onStateChange, onError, onTurnViolation]);

  const getStateDuration = useCallback((): number => {
    return calculateStateDuration(stateStartTimeRef.current, new Date());
  }, []);

  // Enhanced methods for turn management
  const canUserStartTurn = useCallback((): boolean => {
    return ['idle', 'waiting_for_user'].includes(stateData.currentState);
  }, [stateData.currentState]);

  const canAIStartTurn = useCallback((): boolean => {
    return ['idle', 'waiting_for_ai', 'processing'].includes(stateData.currentState);
  }, [stateData.currentState]);

  const getCurrentTurnOwner = useCallback((): 'user' | 'ai' | 'none' => {
    return stateData.turnOwner;
  }, [stateData.turnOwner]);

  return {
    stateData,
    transitionTo,
    getStateDuration,
    stateStartTimeRef,
    canUserStartTurn,
    canAIStartTurn,
    getCurrentTurnOwner,
  };
};


import { useCallback } from 'react';
import { useConversationState } from './useConversationState';
import { useTurnAudioCues } from './useTurnAudioCues';
import { ConversationState, UseConversationStateProps } from '@/types/conversationState';

interface UseEnhancedConversationStateProps extends UseConversationStateProps {
  enableAudioCues?: boolean;
  enableTurnValidation?: boolean;
}

export const useEnhancedConversationState = ({
  enableAudioCues = false,
  enableTurnValidation = true,
  ...conversationProps
}: UseEnhancedConversationStateProps = {}) => {
  
  const { playTurnTransitionCue } = useTurnAudioCues({ enableAudioCues });

  const enhancedOnStateChange = useCallback((
    newState: ConversationState, 
    previousState: ConversationState | null
  ) => {
    // Play audio cue for turn transitions
    if (enableAudioCues && previousState) {
      playTurnTransitionCue(newState, previousState);
    }

    // Call original callback if provided
    conversationProps.onStateChange?.(newState, previousState);
  }, [enableAudioCues, playTurnTransitionCue, conversationProps]);

  const conversationState = useConversationState({
    ...conversationProps,
    config: {
      strictTurnEnforcement: enableTurnValidation,
      ...conversationProps.config,
    },
    onStateChange: enhancedOnStateChange,
  });

  const enhancedStartListening = useCallback(() => {
    if (enableTurnValidation && !conversationState.canUserStartTurn()) {
      console.warn('Cannot start listening - not user\'s turn');
      return false;
    }
    return conversationState.startListening();
  }, [conversationState, enableTurnValidation]);

  const enhancedStartProcessing = useCallback(() => {
    if (enableTurnValidation && !conversationState.canAIStartTurn()) {
      console.warn('Cannot start processing - not AI\'s turn');
      return false;
    }
    return conversationState.startProcessing();
  }, [conversationState, enableTurnValidation]);

  return {
    ...conversationState,
    startListening: enhancedStartListening,
    startProcessing: enhancedStartProcessing,
    // Additional turn management helpers
    turnOwner: conversationState.getCurrentTurnOwner(),
    isUserTurn: conversationState.getCurrentTurnOwner() === 'user',
    isAITurn: conversationState.getCurrentTurnOwner() === 'ai',
    hasActiveTimeout: conversationState.stateData.timeoutMs && conversationState.stateData.timeoutMs > 0,
  };
};

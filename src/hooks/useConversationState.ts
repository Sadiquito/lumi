
import { useCallback } from 'react';
import { ConversationState, ConversationConfig, UseConversationStateProps } from '@/types/conversationState';
import { DEFAULT_CONVERSATION_CONFIG } from '@/utils/conversationStateUtils';
import { useConversationStateCore } from './useConversationStateCore';
import { useConversationStateTimeouts } from './useConversationStateTimeouts';
import { useConversationMessages } from './useConversationMessages';
import { useConversationAnalysis } from './useConversationAnalysis';

export const useConversationState = ({
  config: customConfig,
  onStateChange,
  onTimeout,
  onError,
  onTurnViolation,
}: UseConversationStateProps = {}) => {
  const config: ConversationConfig = { ...DEFAULT_CONVERSATION_CONFIG, ...customConfig };
  
  const {
    stateData,
    transitionTo,
    getStateDuration,
    stateStartTimeRef,
    canUserStartTurn,
    canAIStartTurn,
    getCurrentTurnOwner,
  } = useConversationStateCore({
    config,
    onStateChange,
    onError,
    onTurnViolation,
  });

  const {
    messages,
    context,
    addMessage,
    clearHistory,
    setContext,
  } = useConversationMessages({
    maxHistorySize: config.maxHistorySize,
  });

  const { triggerAnalysis } = useConversationAnalysis();

  useConversationStateTimeouts({
    currentState: stateData.currentState,
    config,
    stateStartTimeRef,
    onTimeout,
    transitionTo,
  });

  // Enhanced addMessage to trigger analysis when AI responds
  const addMessageWithAnalysis = useCallback((message: Omit<any, 'id' | 'timestamp'>) => {
    const newMessage = addMessage(message);
    
    // If this is an AI message and we have a previous user message, trigger analysis
    if (message.speaker === 'ai' && messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.speaker === 'user');
      if (lastUserMessage) {
        const conversationId = context.sessionId;
        console.log('Triggering analysis for conversation:', conversationId);
        
        // Trigger analysis in background
        setTimeout(() => {
          triggerAnalysis(conversationId, lastUserMessage.content, message.content);
        }, 100);
      }
    }
    
    return newMessage;
  }, [addMessage, messages, context.sessionId, triggerAnalysis]);

  // Enhanced state transition methods with turn validation
  const startListening = useCallback(() => {
    if (!canUserStartTurn()) {
      console.warn('Cannot start listening - not user\'s turn');
      return false;
    }
    return transitionTo('listening', 'user_initiated');
  }, [transitionTo, canUserStartTurn]);

  const startProcessing = useCallback(() => {
    if (!canAIStartTurn()) {
      console.warn('Cannot start processing - not AI\'s turn');
      return false;
    }
    return transitionTo('processing', 'audio_received');
  }, [transitionTo, canAIStartTurn]);

  const startSpeaking = useCallback(() => {
    if (!canAIStartTurn()) {
      console.warn('Cannot start speaking - not AI\'s turn');
      return false;
    }
    return transitionTo('speaking', 'response_ready');
  }, [transitionTo, canAIStartTurn]);

  const waitForUser = useCallback(() => {
    return transitionTo('waiting_for_user', 'awaiting_user_input');
  }, [transitionTo]);

  const waitForAI = useCallback(() => {
    return transitionTo('waiting_for_ai', 'awaiting_ai_response');
  }, [transitionTo]);

  const goIdle = useCallback(() => {
    return transitionTo('idle', 'manual');
  }, [transitionTo]);

  const isTransitionAllowed = useCallback((toState: ConversationState): boolean => {
    return stateData.canTransitionTo.includes(toState);
  }, [stateData.canTransitionTo]);

  const clearHistoryWithContext = useCallback(() => {
    clearHistory();
    setContext(prev => ({
      ...prev,
      totalDuration: 0,
    }));
  }, [clearHistory, setContext]);

  return {
    // Current state
    state: stateData.currentState,
    stateData,
    
    // History and context
    messages,
    context,
    
    // State transitions
    transitionTo,
    startListening,
    startProcessing,
    startSpeaking,
    waitForUser,
    waitForAI,
    goIdle,
    
    // Message management with analysis integration
    addMessage: addMessageWithAnalysis,
    clearHistory: clearHistoryWithContext,
    
    // Turn management
    canUserStartTurn,
    canAIStartTurn,
    getCurrentTurnOwner,
    
    // Utilities
    getStateDuration,
    isTransitionAllowed,
    
    // Status checks
    isIdle: stateData.currentState === 'idle',
    isListening: stateData.currentState === 'listening',
    isProcessing: stateData.currentState === 'processing',
    isSpeaking: stateData.currentState === 'speaking',
    isWaitingForUser: stateData.currentState === 'waiting_for_user',
    isWaitingForAI: stateData.currentState === 'waiting_for_ai',
  };
};

export default useConversationState;

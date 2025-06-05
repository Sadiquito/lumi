
import { useCallback } from 'react';
import { ConversationState, ConversationConfig, UseConversationStateProps } from '@/types/conversationState';
import { DEFAULT_CONVERSATION_CONFIG, canTransition } from '@/utils/conversationStateUtils';
import { useConversationStateCore } from './useConversationStateCore';
import { useConversationStateTimeouts } from './useConversationStateTimeouts';
import { useConversationMessages } from './useConversationMessages';
import { useConversationAnalysis } from './useConversationAnalysis';

export const useConversationState = ({
  config: customConfig,
  onStateChange,
  onTimeout,
  onError,
}: UseConversationStateProps = {}) => {
  const config: ConversationConfig = { ...DEFAULT_CONVERSATION_CONFIG, ...customConfig };
  
  const {
    stateData,
    stateHistory,
    transitionTo,
    getStateDuration,
    stateStartTimeRef,
    setStateHistory,
  } = useConversationStateCore({
    config,
    onStateChange,
    onError,
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

  // State transition methods
  const startListening = useCallback(() => {
    return transitionTo('listening', 'user_initiated');
  }, [transitionTo]);

  const startProcessing = useCallback(() => {
    return transitionTo('processing', 'audio_received');
  }, [transitionTo]);

  const startSpeaking = useCallback(() => {
    return transitionTo('speaking', 'response_ready');
  }, [transitionTo]);

  const goIdle = useCallback(() => {
    return transitionTo('idle', 'manual');
  }, [transitionTo]);

  const isTransitionAllowed = useCallback((toState: ConversationState): boolean => {
    return canTransition(stateData.currentState, toState);
  }, [stateData.currentState]);

  const clearHistoryWithContext = useCallback(() => {
    clearHistory();
    setStateHistory([]);
    setContext(prev => ({
      ...prev,
      totalDuration: 0,
    }));
  }, [clearHistory, setStateHistory, setContext]);

  return {
    // Current state
    state: stateData.currentState,
    stateData,
    
    // History and context
    messages,
    stateHistory,
    context,
    
    // State transitions
    transitionTo,
    startListening,
    startProcessing,
    startSpeaking,
    goIdle,
    
    // Message management with analysis integration
    addMessage: addMessageWithAnalysis,
    clearHistory: clearHistoryWithContext,
    
    // Utilities
    getStateDuration,
    isTransitionAllowed,
    
    // Status checks
    isIdle: stateData.currentState === 'idle',
    isListening: stateData.currentState === 'listening',
    isProcessing: stateData.currentState === 'processing',
    isSpeaking: stateData.currentState === 'speaking',
  };
};

export default useConversationState;


import { useState, useCallback } from 'react';

export type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking' | 'waiting_for_user' | 'waiting_for_ai';

export const useConversationFlowState = () => {
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const [stateStartTime, setStateStartTime] = useState<Date>(new Date());

  const getStateDuration = (): number => {
    const now = new Date();
    return (now.getTime() - stateStartTime.getTime()) / 1000;
  };

  const goIdle = useCallback(() => {
    setConversationState('idle');
    setStateStartTime(new Date());
  }, []);

  const startListening = useCallback(() => {
    setConversationState('listening');
    setStateStartTime(new Date());
  }, []);

  const startProcessing = useCallback(() => {
    setConversationState('processing');
    setStateStartTime(new Date());
  }, []);

  const goToSpeaking = useCallback(() => {
    setConversationState('speaking');
    setStateStartTime(new Date());
  }, []);

  const isIdle = conversationState === 'idle';
  const isListening = conversationState === 'listening';
  const isProcessing = conversationState === 'processing';
  const isSpeaking = conversationState === 'speaking';
  const isWaitingForUser = conversationState === 'waiting_for_user';
  const isWaitingForAI = conversationState === 'waiting_for_ai';

  return {
    conversationState,
    isTranscribing,
    setIsTranscribing,
    aiResponse,
    setAiResponse,
    transcriptionProgress,
    setTranscriptionProgress,
    thinkingProgress,
    setThinkingProgress,
    getStateDuration,
    goIdle,
    startListening,
    startProcessing,
    goToSpeaking,
    isIdle,
    isListening,
    isProcessing,
    isSpeaking,
    isWaitingForUser,
    isWaitingForAI,
  };
};

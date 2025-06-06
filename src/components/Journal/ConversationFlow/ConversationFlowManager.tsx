
import React, { useState, useEffect } from 'react';
import { useConversationContext } from '@/hooks/useConversationContext';
import { useAudioRecordingFeature } from '@/hooks/useAudioRecordingFeature';

interface ConversationEntry {
  speaker: 'lumi' | 'user';
  message: string;
  timestamp: Date;
}

type ConversationFlow = 'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing';

interface ConversationFlowManagerProps {
  onUserResponse?: (transcript: string) => void;
  onConversationEnd?: () => void;
  onStateChange?: (state: ConversationFlow) => void;
}

export const useConversationFlowManager = ({
  onUserResponse,
  onConversationEnd,
  onStateChange
}: ConversationFlowManagerProps) => {
  const [flowState, setFlowState] = useState<ConversationFlow>('ready');
  const [currentLumiMessage, setCurrentLumiMessage] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);

  // Initialize conversation context with persona state
  const {
    context,
    addMessage,
    updatePersonaFromConversation,
    isPersonaLoading,
    hasPersonaData,
  } = useConversationContext();

  // Initialize audio recording with integrated transcription
  const {
    conversationState,
    isSessionActive,
    startSession,
    handleStartRecording,
    handleStopRecording,
    state: audioState,
    isListening,
    isProcessing,
  } = useAudioRecordingFeature({
    onTranscriptionComplete: (transcript: string) => {
      console.log('Transcription completed:', transcript);
      handleUserResponse(transcript);
    },
    onAIResponse: (response: string) => {
      console.log('AI response received:', response);
      handleLumiResponse(response);
    },
    onFallbackToText: () => {
      console.log('Falling back to text input');
    }
  });

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(flowState);
  }, [flowState, onStateChange]);

  // Sync audio conversation state with flow state
  useEffect(() => {
    if (isListening && flowState !== 'user_recording') {
      setFlowState('user_recording');
    } else if (isProcessing && flowState !== 'processing') {
      setFlowState('processing');
    }
  }, [isListening, isProcessing, flowState]);

  // Log persona state when available
  useEffect(() => {
    if (context.personaState) {
      console.log('Conversation context with persona state:', {
        sessionId: context.sessionId,
        messageCount: context.messageCount,
        personaState: context.personaState,
        hasPersonaData,
      });
    }
  }, [context, hasPersonaData]);

  // Mock Lumi opening prompts - these will be replaced with persona-aware AI-generated content
  const getOpeningPrompts = () => {
    const basePrompts = [
      "Hello! I'm Lumi. I'm here to listen and understand you better. What's been on your mind lately?",
      "Hi there! I sense you might have something you'd like to explore today. What would you like to talk about?",
      "Welcome back! I've been thinking about our previous conversations. How are you feeling right now?",
      "Good to see you again! I'm curious - what's the most important thing happening in your life today?"
    ];

    // TODO: Use persona state to customize prompts
    if (hasPersonaData) {
      console.log('Using persona-aware prompt selection (placeholder)');
    }

    return basePrompts;
  };

  const handleStartConversation = async () => {
    // Start audio session
    await startSession();
    
    setFlowState('lumi_speaking');
    
    // Select an opening prompt - in production this would come from persona-aware AI
    const prompts = getOpeningPrompts();
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentLumiMessage(prompt);
    
    // Add to conversation history and context
    setConversationHistory([{
      speaker: 'lumi',
      message: prompt,
      timestamp: new Date()
    }]);

    // Add to conversation context
    addMessage('assistant', prompt);
  };

  const handleLumiFinishedSpeaking = () => {
    setFlowState('waiting_for_user');
  };

  const handleUserStartRecording = async () => {
    if (!isSessionActive) {
      await startSession();
    }
    await handleStartRecording();
  };

  const handleUserStopRecording = () => {
    handleStopRecording();
  };

  const handleUserResponse = (transcript: string) => {
    console.log('User response received:', transcript);
    
    // Add user response to history and context
    setConversationHistory(prev => [...prev, {
      speaker: 'user',
      message: transcript,
      timestamp: new Date()
    }]);

    // Add to conversation context
    addMessage('user', transcript);
    onUserResponse?.(transcript);
  };

  const handleLumiResponse = async (aiResponse: string) => {
    console.log('Lumi response received:', aiResponse);
    
    setCurrentLumiMessage(aiResponse);
    
    setConversationHistory(prev => [...prev, {
      speaker: 'lumi',
      message: aiResponse,
      timestamp: new Date()
    }]);

    // Add AI response to context
    addMessage('assistant', aiResponse);

    // Update persona state from conversation
    const mockInsights = {
      lastInteraction: new Date().toISOString(),
      totalConversations: (context.personaState?.totalConversations || 0) + 1,
    };

    await updatePersonaFromConversation(mockInsights);
    
    setFlowState('lumi_speaking');
  };

  return {
    flowState,
    currentLumiMessage,
    conversationHistory,
    context,
    isPersonaLoading,
    hasPersonaData,
    conversationState,
    isSessionActive,
    audioState,
    isListening,
    isProcessing,
    handleStartConversation,
    handleLumiFinishedSpeaking,
    handleUserStartRecording,
    handleUserStopRecording,
  };
};

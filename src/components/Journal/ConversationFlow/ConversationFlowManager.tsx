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
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      console.log('Transcription completed in flow manager:', transcript);
      handleUserResponse(transcript);
    },
    onAIResponse: (response: string) => {
      console.log('AI response received in flow manager:', response);
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
    if (isTransitioning) return;
    
    try {
      setIsTransitioning(true);
      console.log('Starting conversation...');
      
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

      // Add to conversation context - this will NOT trigger persona update (only assistant messages)
      console.log('Adding Lumi opening message to context');
      addMessage('assistant', prompt);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setFlowState('ready');
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleLumiFinishedSpeaking = () => {
    if (isTransitioning) return;
    
    console.log('Lumi finished speaking, waiting for user...');
    setFlowState('waiting_for_user');
  };

  const handleUserStartRecording = async () => {
    if (isTransitioning) return;
    
    console.log('User starting recording...');
    try {
      setIsTransitioning(true);
      // Always ensure session is started first
      if (!isSessionActive) {
        console.log('Starting new session before recording...');
        await startSession();
        // Add a small delay to ensure session is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Now start recording
      console.log('Starting recording...');
      await handleStartRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      // Reset flow state on error
      setFlowState('ready');
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleUserStopRecording = () => {
    if (isTransitioning) return;
    
    console.log('User stopping recording...');
    handleStopRecording();
  };

  const handleUserResponse = (transcript: string) => {
    console.log('Processing user response in flow manager:', transcript);
    
    // Add user response to history
    setConversationHistory(prev => [...prev, {
      speaker: 'user',
      message: transcript,
      timestamp: new Date()
    }]);

    // Add to conversation context - this WILL trigger persona update when followed by assistant message
    console.log('Adding user message to conversation context');
    addMessage('user', transcript);
    
    // Notify parent component
    onUserResponse?.(transcript);
  };

  const handleLumiResponse = async (aiResponse: string) => {
    console.log('Processing Lumi response in flow manager:', aiResponse);
    
    setCurrentLumiMessage(aiResponse);
    
    setConversationHistory(prev => [...prev, {
      speaker: 'lumi',
      message: aiResponse,
      timestamp: new Date()
    }]);

    // Add AI response to context - this WILL trigger persona update if preceded by user message
    console.log('Adding Lumi response to conversation context');
    addMessage('assistant', aiResponse);

    // Manual persona update with basic insights (will be replaced by AI-generated insights)
    const mockInsights = {
      lastInteraction: new Date().toISOString(),
      totalConversations: (context.personaState?.totalConversations || 0) + 1,
    };

    console.log('Applying manual persona insights:', mockInsights);
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

import React, { useState, useEffect, useCallback } from 'react';
import { useConversationContext } from '@/hooks/useConversationContext';
import { useAudioRecordingFeature } from '@/hooks/useAudioRecordingFeature';
import { useToast } from '@/hooks/use-toast';

interface ConversationEntry {
  speaker: 'lumi' | 'user';
  message: string;
  timestamp: Date;
}

interface ConversationFlowManagerProps {
  onUserResponse?: (transcript: string) => void;
  onConversationEnd?: () => void;
  onStateChange?: (state: 'idle' | 'lumi_speaking' | 'user_speaking') => void;
  autoStart?: boolean;
}

export const useConversationFlowManager = ({
  onUserResponse,
  onConversationEnd,
  onStateChange,
  autoStart = false
}: ConversationFlowManagerProps) => {
  const [flowState, setFlowState] = useState<'idle' | 'lumi_speaking' | 'user_speaking'>('idle');
  const [currentLumiMessage, setCurrentLumiMessage] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

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
    handleStartRecording: startRecording,
    handleStopRecording: stopRecording,
    state: audioState,
    isListening,
    isProcessing,
    isSpeaking,
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
      setError('Voice input is unavailable. Please use text input instead.');
    }
  });

  // Generate initial Lumi response
  const generateInitialResponse = async (): Promise<string> => {
    // TODO: Replace with actual AI generation
    return "Hello! I'm Lumi. How are you feeling today?";
  };

  // Generate Lumi's response to user input
  const generateLumiResponse = async (userInput: string): Promise<string> => {
    // TODO: Replace with actual AI generation
    return `I understand you said: "${userInput}". Let me think about that...`;
  };

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(flowState);
  }, [flowState, onStateChange]);

  // Auto-start conversation if enabled
  useEffect(() => {
    if (autoStart && !isSessionActive && !isTransitioning) {
      handleStartConversation();
    }
  }, [autoStart, isSessionActive, isTransitioning]);

  // Handle barge-in detection
  useEffect(() => {
    if (isListening && flowState === 'lumi_speaking') {
      console.log('Barge-in detected - stopping Lumi and switching to user speaking');
      // Stop Lumi's speech and switch to user speaking state
      setFlowState('user_speaking');
    }
  }, [isListening, flowState]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Conversation flow error:', error);
      // Reset to idle state on error
      setFlowState('idle');
      setError(null);
    }
  }, [error]);

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

  const handleStartConversation = async () => {
    if (isTransitioning) return;
    
    console.log('Starting conversation...');
    try {
      setIsTransitioning(true);
      setError(null);
      
      // Start session if not active
      if (!isSessionActive) {
        await startSession();
      }
      
      // Generate initial Lumi response
      const initialResponse = await generateInitialResponse();
      handleLumiResponse(initialResponse);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      setFlowState('idle');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleLumiResponse = async (response: string) => {
    setCurrentLumiMessage(response);
    setFlowState('lumi_speaking');
    
    // Add Lumi's response to history
    setConversationHistory(prev => [...prev, {
      speaker: 'lumi',
      message: response,
      timestamp: new Date()
    }]);

    // Add to conversation context
    addMessage('assistant', response);
    
    // Update persona state
    await updatePersonaFromConversation();
    
    // Automatically transition to user speaking after Lumi finishes
    setTimeout(() => {
      if (flowState === 'lumi_speaking') {
        handleStartRecording();
      }
    }, 1000); // Small delay to ensure smooth transition
  };

  const handleUserResponse = (transcript: string) => {
    console.log('Processing user response:', transcript);
    
    // Add user response to history
    setConversationHistory(prev => [...prev, {
      speaker: 'user',
      message: transcript,
      timestamp: new Date()
    }]);

    // Add to conversation context
    addMessage('user', transcript);
    
    // Notify parent component
    onUserResponse?.(transcript);
    
    // Generate Lumi's response
    generateLumiResponse(transcript).then(handleLumiResponse);
  };

  const handleStartRecording = async () => {
    if (isTransitioning) return;
    
    try {
      setIsTransitioning(true);
      setError(null);
      
      await startRecording();
      setFlowState('user_speaking');
    } catch (error) {
      console.error('Error starting recording:', error);
      setError(error instanceof Error ? error.message : 'Failed to start recording');
      setFlowState('idle');
    } finally {
      setIsTransitioning(false);
    }
  };

  const handleStopRecording = () => {
    if (isTransitioning) return;
    
    try {
      stopRecording();
      setFlowState('idle');
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError(error instanceof Error ? error.message : 'Failed to stop recording');
    }
  };

  const handleEndConversation = () => {
    if (isTransitioning) return;
    
    try {
      if (isListening) {
        stopRecording();
      }
      setFlowState('idle');
      onConversationEnd?.();
    } catch (error) {
      console.error('Error ending conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to end conversation');
    }
  };

  return {
    flowState,
    currentLumiMessage,
    conversationHistory,
    isTransitioning,
    error,
    isPersonaLoading,
    hasPersonaData,
    handleStartConversation,
    handleEndConversation,
    handleStartRecording,
    handleStopRecording
  };
};

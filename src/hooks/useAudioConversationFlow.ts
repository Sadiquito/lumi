import { useState, useCallback, useEffect } from 'react';
import { useConversationState } from '@/hooks/useConversationState';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { useAIResponse } from '@/hooks/useAIResponse';
import { useAudioRecordingHandlers } from '@/hooks/useAudioRecordingHandlers';
import { useToast } from '@/hooks/use-toast';
import { ConversationData, AudioQualityMetadata, UseAudioRecordingFeatureProps } from '@/types/audioRecording';

export const useAudioConversationFlow = ({
  onTranscriptionComplete,
  onAIResponse,
  onFallbackToText
}: Pick<UseAudioRecordingFeatureProps, 'onTranscriptionComplete' | 'onAIResponse' | 'onFallbackToText'>) => {
  const { toast } = useToast();
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [thinkingProgress, setThinkingProgress] = useState(0);

  const {
    handleTimeoutError,
    handleConversationError,
    storeConversation,
  } = useAudioRecordingHandlers(() => {}, onFallbackToText);

  const { transcribeAudio } = useAudioTranscription();
  const { generateAIResponse } = useAIResponse();

  const {
    state: conversationState,
    startListening,
    startProcessing,
    startSpeaking,
    goIdle,
    addMessage,
    getStateDuration,
    isIdle,
    isListening,
    isProcessing,
    isSpeaking
  } = useConversationState({
    onStateChange: (newState, previousState) => {
      console.log(`Conversation state: ${previousState} → ${newState}`);
    },
    onTimeout: handleTimeoutError,
    onError: handleConversationError
  });

  const handleTranscription = useCallback(async (audioBlob: Blob, duration: number, audioQuality: string, networkStatus: string, isSessionActive: boolean, updateActivity: () => void, retryCount: number, setRetryCount: (fn: (prev: number) => number) => void) => {
    if (networkStatus === 'offline') {
      toast({
        title: "No internet connection",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      goIdle();
      return;
    }

    if (!isSessionActive) {
      toast({
        title: "No active session",
        description: "Please start a conversation session first.",
        variant: "destructive",
      });
      goIdle();
      return;
    }

    setIsTranscribing(true);
    setTranscriptionProgress(0);
    setRetryCount(() => 0);
    
    try {
      const transcript = await transcribeAudio(
        audioBlob,
        retryCount,
        setTranscriptionProgress,
        onFallbackToText
      );
      
      // Add user message to conversation
      addMessage({
        content: transcript,
        speaker: 'user',
        type: 'audio',
        metadata: {
          duration: duration,
          audioUrl: URL.createObjectURL(audioBlob),
          confidence: 0.8,
          audioQuality
        } as AudioQualityMetadata
      });

      // Update session activity
      updateActivity();

      onTranscriptionComplete?.(transcript);
      
      // Start AI thinking process
      await handleAIThinking(transcript, updateActivity);
      
    } catch (error) {
      if (error instanceof Error && error.message === 'RETRY_NEEDED') {
        setRetryCount(prev => prev + 1);
        setTimeout(() => handleTranscription(audioBlob, duration, audioQuality, networkStatus, isSessionActive, updateActivity, retryCount, setRetryCount), 1000 * (retryCount + 1));
        toast({
          title: "Retrying transcription",
          description: `Attempt ${retryCount + 2} of 3...`,
        });
        return;
      }
      
      goIdle();
    } finally {
      setIsTranscribing(false);
      setTranscriptionProgress(0);
    }
  }, [transcribeAudio, onTranscriptionComplete, onFallbackToText, addMessage, goIdle, toast]);

  const handleAIThinking = useCallback(async (userInput: string, updateActivity: () => void) => {
    try {
      const response = await generateAIResponse(userInput, setThinkingProgress);
      
      setAiResponse(response);
      
      // Store conversation in database
      const storedConversation = await storeConversation(userInput, response);
      if (storedConversation) {
        setConversationData(storedConversation);
      }
      
      // Add AI message to conversation
      addMessage({
        content: response,
        speaker: 'ai',
        type: 'text'
      });

      // Update session activity
      updateActivity();

      startSpeaking();
      onAIResponse?.(response);
      
    } catch (error) {
      console.error('AI processing error:', error);
      toast({
        title: "AI processing failed",
        description: "Could not generate response. Please try again.",
        variant: "destructive",
      });
      goIdle();
    } finally {
      setThinkingProgress(0);
    }
  }, [generateAIResponse, storeConversation, addMessage, startSpeaking, onAIResponse, toast, goIdle]);

  // Handle speech completion by listening for when TTS finishes
  useEffect(() => {
    if (isSpeaking && aiResponse) {
      const estimatedDuration = aiResponse.length * 50;
      const timeout = setTimeout(() => {
        setAiResponse('');
        goIdle();
      }, Math.max(estimatedDuration, 3000));

      return () => clearTimeout(timeout);
    }
  }, [isSpeaking, aiResponse, goIdle, setAiResponse]);

  return {
    // States
    conversationState,
    isTranscribing,
    aiResponse,
    transcriptionProgress,
    thinkingProgress,
    conversationData,
    
    // Conversation states
    isIdle,
    isListening,
    isProcessing,
    isSpeaking,
    
    // Actions
    startListening,
    startProcessing,
    getStateDuration,
    handleTranscription,
    goIdle,
    setAiResponse,
  };
};

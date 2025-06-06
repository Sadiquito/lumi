
import { useCallback } from 'react';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { useAIResponse } from '@/hooks/useAIResponse';
import { useAudioRecordingHandlers } from './useAudioRecordingHandlers';
import { ConversationDataState } from './useConversationData';

interface UseTranscriptionHandlerProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  onFallbackToText?: () => void;
  conversationData: ConversationDataState;
  setConversationData: (updater: (prev: ConversationDataState) => ConversationDataState) => void;
  setIsTranscribing: (value: boolean) => void;
  setTranscriptionProgress: (value: number | ((prev: number) => number)) => void;
  setThinkingProgress: (value: number | ((prev: number) => number)) => void;
  setAiResponse: (response: string) => void;
  goToSpeaking: () => void;
  goIdle: () => void;
}

export const useTranscriptionHandler = ({
  onTranscriptionComplete,
  onAIResponse,
  onFallbackToText,
  conversationData,
  setConversationData,
  setIsTranscribing,
  setTranscriptionProgress,
  setThinkingProgress,
  setAiResponse,
  goToSpeaking,
  goIdle,
}: UseTranscriptionHandlerProps) => {
  const { transcribeAudio } = useAudioTranscription();
  const { generateAIResponse } = useAIResponse();
  const { handleConversationError } = useAudioRecordingHandlers(() => {});

  const handleTranscription = useCallback(async (
    audioBlob: Blob,
    duration: number,
    audioQuality: 'good' | 'low' | 'poor',
    networkStatus: 'online' | 'offline',
    isSessionActive: boolean,
    updateActivity: () => void,
    retryCount: number,
    setRetryCount: (fn: (prev: number) => number) => void
  ) => {
    if (!audioBlob) {
      console.error('No audio blob provided for transcription');
      handleConversationError('No audio data to transcribe');
      goIdle();
      return;
    }

    if (networkStatus === 'offline') {
      handleConversationError('No internet connection available for transcription');
      goIdle();
      return;
    }

    console.log('Starting transcription process...', {
      audioBlobSize: audioBlob.size,
      duration,
      audioQuality,
      isSessionActive
    });

    setIsTranscribing(true);
    setTranscriptionProgress(0);

    try {
      // Use the Whisper transcription implementation
      const transcript = await transcribeAudio(
        audioBlob,
        retryCount,
        setTranscriptionProgress,
        onFallbackToText
      );

      console.log('Transcription successful:', transcript.substring(0, 100) + '...');
      
      setIsTranscribing(false);
      setThinkingProgress(0);
      
      // Update session activity
      if (isSessionActive) {
        updateActivity();
      }

      // Store transcript and trigger callback
      setConversationData(prev => ({
        ...prev,
        lastTranscript: transcript,
        lastTranscriptionTime: new Date(),
      }));

      onTranscriptionComplete?.(transcript);

      // Generate AI response
      const aiResponse = await generateAIResponse(
        transcript,
        setThinkingProgress,
        conversationData.conversationId,
        conversationData.personaState
      );

      console.log('AI response generated:', aiResponse.substring(0, 100) + '...');
      
      setAiResponse(aiResponse);
      onAIResponse?.(aiResponse);
      
      // Update conversation data
      setConversationData(prev => ({
        ...prev,
        lastAiResponse: aiResponse,
        lastAiResponseTime: new Date(),
      }));

      // Transition to speaking state
      goToSpeaking();

    } catch (error) {
      console.error('Transcription/AI response error:', error);
      setIsTranscribing(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage === 'RETRY_NEEDED' && retryCount < 2) {
        console.log('Retrying transcription...');
        setRetryCount(prev => prev + 1);
        // Retry automatically
        setTimeout(() => {
          handleTranscription(
            audioBlob, 
            duration, 
            audioQuality, 
            networkStatus, 
            isSessionActive, 
            updateActivity, 
            retryCount + 1, 
            setRetryCount
          );
        }, 1000);
      } else {
        handleConversationError(`Transcription failed: ${errorMessage}`);
        goIdle();
      }
    }
  }, [
    transcribeAudio,
    generateAIResponse,
    onTranscriptionComplete,
    onAIResponse,
    onFallbackToText,
    conversationData,
    setTranscriptionProgress,
    setThinkingProgress,
    setIsTranscribing,
    setAiResponse,
    setConversationData,
    goToSpeaking,
    goIdle,
    handleConversationError
  ]);

  return { handleTranscription };
};

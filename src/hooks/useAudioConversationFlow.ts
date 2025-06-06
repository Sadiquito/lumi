
import { useState, useCallback } from 'react';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { useAIResponse } from '@/hooks/useAIResponse';
import { useAudioRecordingHandlers } from './useAudioRecordingHandlers';
import { useToast } from './use-toast';
import { ConversationData } from '@/types/audioRecording';
import { PersonaState } from '@/lib/persona-state';

export type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking' | 'waiting_for_user' | 'waiting_for_ai';

interface UseAudioConversationFlowProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  onFallbackToText?: () => void;
}

interface ConversationDataState {
  conversationId?: string;
  startTime?: Date;
  endTime?: Date;
  lastActivity?: Date;
  messageCount: number;
  totalDuration: number;
  topics: string[];
  personaState?: PersonaState | null;
  lastTranscript?: string;
  lastTranscriptionTime?: Date;
  lastAiResponse?: string;
  lastAiResponseTime?: Date;
}

export const useAudioConversationFlow = ({
  onTranscriptionComplete,
  onAIResponse,
  onFallbackToText
}: UseAudioConversationFlowProps) => {
  const { toast } = useToast();
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const [stateStartTime, setStateStartTime] = useState<Date>(new Date());

  const [conversationData, setConversationData] = useState<ConversationDataState>({
    messageCount: 0,
    totalDuration: 0,
    topics: [],
    personaState: null,
  });

  const { transcribeAudio } = useAudioTranscription();
  const { generateAIResponse } = useAIResponse();
  const { handleConversationError } = useAudioRecordingHandlers(() => {});

  const getStateDuration = (): number => {
    const now = new Date();
    return (now.getTime() - stateStartTime.getTime()) / 1000;
  };

  const goIdle = () => {
    setConversationState('idle');
    setStateStartTime(new Date());
  };

  const startListening = () => {
    setConversationState('listening');
    setStateStartTime(new Date());
  };

  const startProcessing = () => {
    setConversationState('processing');
    setStateStartTime(new Date());
  };

  const goToSpeaking = () => {
    setConversationState('speaking');
    setStateStartTime(new Date());
  };

  const isIdle = conversationState === 'idle';
  const isListening = conversationState === 'listening';
  const isProcessing = conversationState === 'processing';
  const isSpeaking = conversationState === 'speaking';
  const isWaitingForUser = conversationState === 'waiting_for_user';
  const isWaitingForAI = conversationState === 'waiting_for_ai';

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
      return;
    }

    if (networkStatus === 'offline') {
      handleConversationError('No internet connection available for transcription');
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
      // Use the new Whisper transcription implementation
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

  return {
    conversationState,
    isTranscribing,
    aiResponse,
    transcriptionProgress,
    thinkingProgress,
    conversationData,
    isIdle,
    isListening,
    isProcessing,
    isSpeaking,
    isWaitingForUser,
    isWaitingForAI,
    startListening,
    startProcessing,
    getStateDuration,
    handleTranscription,
    goIdle,
    setAiResponse,
  };
};

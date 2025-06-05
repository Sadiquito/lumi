
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useConversationState } from '@/hooks/useConversationState';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioRecordingState } from '@/hooks/useAudioRecordingState';
import { useAudioRecordingHandlers } from '@/hooks/useAudioRecordingHandlers';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { useAIResponse } from '@/hooks/useAIResponse';
import { useToast } from '@/hooks/use-toast';
import { ConversationData, UseAudioRecordingFeatureProps } from '@/types/audioRecording';

export const useAudioRecordingFeature = ({
  onTranscriptionComplete,
  onAIResponse,
  disabled = false,
  maxDuration,
  onFallbackToText
}: UseAudioRecordingFeatureProps) => {
  const { toast } = useToast();
  const { trialStatus } = useAuth();
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);

  const {
    recordedBlob,
    setRecordedBlob,
    isTranscribing,
    setIsTranscribing,
    aiResponse,
    setAiResponse,
    transcriptionProgress,
    setTranscriptionProgress,
    thinkingProgress,
    setThinkingProgress,
    audioQuality,
    setAudioQuality,
    networkStatus,
    setNetworkStatus,
    retryCount,
    setRetryCount,
  } = useAudioRecordingState();

  const {
    handleTimeoutError,
    handleConversationError,
    handleAudioRecorderError,
    storeConversation,
  } = useAudioRecordingHandlers(setRetryCount, onFallbackToText);

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

  const {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    requestPermission,
    isSupported,
    audioLevel,
    duration
  } = useAudioRecorder({
    maxDuration,
    onRecordingComplete: (blob) => {
      setRecordedBlob(blob);
      startProcessing();
      handleTranscription(blob);
    },
    onError: handleAudioRecorderError
  });

  // Monitor network status
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [setNetworkStatus]);

  // Monitor audio quality
  useEffect(() => {
    if (isListening && audioLevel > 0) {
      if (audioLevel < 0.05) {
        setAudioQuality('poor');
      } else if (audioLevel < 0.15) {
        setAudioQuality('low');
      } else {
        setAudioQuality('good');
      }
    }
  }, [audioLevel, isListening, setAudioQuality]);

  const handleTranscription = async (audioBlob: Blob) => {
    if (networkStatus === 'offline') {
      toast({
        title: "No internet connection",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      goIdle();
      return;
    }

    setIsTranscribing(true);
    setTranscriptionProgress(0);
    setRetryCount(0);
    
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
        }
      });

      onTranscriptionComplete?.(transcript);
      
      // Start AI thinking process
      await handleAIThinking(transcript);
      
    } catch (error) {
      if (error instanceof Error && error.message === 'RETRY_NEEDED') {
        setRetryCount(prev => prev + 1);
        setTimeout(() => handleTranscription(audioBlob), 1000 * (retryCount + 1));
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
      setRecordedBlob(null);
    }
  };

  const handleAIThinking = async (userInput: string) => {
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
  };

  const handleStartRecording = async () => {
    if (!isSupported) {
      toast({
        title: "Audio not supported",
        description: "Your browser doesn't support audio recording. Please use text input.",
        variant: "destructive",
      });
      if (onFallbackToText) {
        onFallbackToText();
      }
      return;
    }

    if (networkStatus === 'offline') {
      toast({
        title: "No internet connection",
        description: "Audio features require an internet connection. Please try text input.",
        variant: "destructive",
      });
      if (onFallbackToText) {
        onFallbackToText();
      }
      return;
    }

    if (!state.hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        toast({
          title: "Microphone permission required",
          description: "Please allow microphone access in your browser settings to use voice input.",
          variant: "destructive",
        });
        if (onFallbackToText) {
          onFallbackToText();
        }
        return;
      }
    }

    const started = await startRecording();
    if (started) {
      startListening();
      setAudioQuality('good');
      toast({
        title: "Recording started",
        description: trialStatus.hasPremiumAccess 
          ? "Recording in progress..."
          : "Recording started (60 second limit for trial users)",
      });
    } else {
      toast({
        title: "Recording failed to start",
        description: "Please try again or use text input.",
        variant: "destructive",
      });
      if (onFallbackToText) {
        onFallbackToText();
      }
    }
  };

  const handleStopRecording = () => {
    if (audioQuality === 'poor') {
      toast({
        title: "Low audio quality detected",
        description: "The recording may not transcribe well. Consider recording again.",
      });
    }
    
    stopRecording();
  };

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
    isSupported,
    state,
    audioLevel,
    duration,
    trialStatus,
    audioQuality,
    networkStatus,
    retryCount,
    conversationData,
    
    // Conversation states
    isIdle,
    isListening,
    isProcessing,
    isSpeaking,
    
    // Actions
    handleStartRecording,
    handleStopRecording,
    pauseRecording,
    resumeRecording,
    getStateDuration
  };
};

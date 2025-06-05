
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { useConversationState } from '@/hooks/useConversationState';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { supabase } from '@/integrations/supabase/client';

interface UseAudioRecordingFeatureProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  disabled?: boolean;
  maxDuration?: number;
  onFallbackToText?: () => void;
}

interface ConversationData {
  id: string;
  transcript: string;
  ai_response: string;
}

export const useAudioRecordingFeature = ({
  onTranscriptionComplete,
  onAIResponse,
  disabled = false,
  maxDuration,
  onFallbackToText
}: UseAudioRecordingFeatureProps) => {
  const { toast } = useToast();
  const { trialStatus } = useAuth();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const [audioQuality, setAudioQuality] = useState<'good' | 'low' | 'poor'>('good');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [retryCount, setRetryCount] = useState(0);
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);

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
    onTimeout: (state) => {
      console.log(`State timeout: ${state}`);
      handleTimeoutError(state);
    },
    onError: (error) => {
      console.error('Conversation state error:', error);
      handleConversationError(error);
    }
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
    onError: (error) => {
      handleAudioRecorderError(error);
    }
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
  }, []);

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
  }, [audioLevel, isListening]);

  const handleTimeoutError = (state: string) => {
    toast({
      title: "Session timeout",
      description: `The ${state} phase timed out. Please try again.`,
      variant: "destructive",
    });
    
    if (onFallbackToText) {
      onFallbackToText();
    }
  };

  const handleConversationError = (error: string) => {
    toast({
      title: "Conversation error",
      description: error,
      variant: "destructive",
    });
    goIdle();
  };

  const handleAudioRecorderError = (error: string) => {
    console.error('Audio recorder error:', error);
    
    if (error.includes('Permission denied') || error.includes('permission')) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access in your browser settings and try again.",
        variant: "destructive",
      });
    } else if (error.includes('not supported')) {
      toast({
        title: "Audio recording not supported",
        description: "Your browser doesn't support audio recording. Please use text input instead.",
        variant: "destructive",
      });
      if (onFallbackToText) {
        onFallbackToText();
      }
    } else {
      toast({
        title: "Recording error",
        description: `Recording failed: ${error}. Switching to text input.`,
        variant: "destructive",
      });
      if (onFallbackToText) {
        onFallbackToText();
      }
    }
    
    goIdle();
  };

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
    
    const attemptTranscription = async (attempt: number): Promise<string> => {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        const progressInterval = setInterval(() => {
          setTranscriptionProgress(prev => Math.min(prev + 10, 70));
        }, 200);

        console.log(`Starting Whisper transcription (attempt ${attempt + 1})...`);
        
        const { data, error } = await supabase.functions.invoke('whisper-transcription', {
          body: {
            audio: base64Audio,
            language: 'en'
          }
        });

        clearInterval(progressInterval);
        setTranscriptionProgress(100);

        if (error) {
          throw new Error(error.message || 'Transcription failed');
        }

        const transcript = data?.text || '';
        const confidence = data?.confidence || 0;
        
        console.log('Transcription completed:', { transcript, confidence });

        if (!transcript.trim()) {
          throw new Error('No speech detected in audio');
        }

        if (confidence < 0.3) {
          console.warn('Low confidence transcription:', confidence);
          toast({
            title: "Audio quality warning",
            description: "The audio quality was low. Please speak clearly and try again if needed.",
          });
        }

        return transcript;
      } catch (error) {
        console.error(`Transcription attempt ${attempt + 1} failed:`, error);
        throw error;
      }
    };

    try {
      const transcript = await attemptTranscription(retryCount);
      
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
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not transcribe your audio';
      
      if (retryCount < 2 && (errorMessage.includes('network') || errorMessage.includes('timeout'))) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => handleTranscription(audioBlob), 1000 * (retryCount + 1));
        toast({
          title: "Retrying transcription",
          description: `Attempt ${retryCount + 2} of 3...`,
        });
        return;
      }
      
      toast({
        title: "Transcription failed",
        description: `${errorMessage}. Please try text input instead.`,
        variant: "destructive",
      });
      
      if (onFallbackToText) {
        onFallbackToText();
      }
      
      goIdle();
    } finally {
      setIsTranscribing(false);
      setTranscriptionProgress(0);
      setRecordedBlob(null);
    }
  };

  const handleAIThinking = async (userInput: string) => {
    setThinkingProgress(0);
    
    try {
      const thinkingInterval = setInterval(() => {
        setThinkingProgress(prev => Math.min(prev + 5, 90));
      }, 100);

      // Generate AI response using existing conversation context
      const mockResponse = `Thank you for sharing that with me. I can hear the thoughtfulness in your voice. Based on what you've said about "${userInput.slice(0, 50)}...", I think there's a lot to explore here. What aspect of this situation feels most important to you right now?`;
      
      clearInterval(thinkingInterval);
      setThinkingProgress(100);
      
      setAiResponse(mockResponse);
      
      // Store conversation in database
      await storeConversation(userInput, mockResponse);
      
      // Add AI message to conversation
      addMessage({
        content: mockResponse,
        speaker: 'ai',
        type: 'text'
      });

      startSpeaking();
      onAIResponse?.(mockResponse);
      
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

  const storeConversation = async (transcript: string, aiResponse: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          transcript,
          ai_response: aiResponse,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setConversationData(data);
      console.log('Conversation stored:', data);
    } catch (error) {
      console.error('Failed to store conversation:', error);
      // Don't show error to user as this is background operation
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
  }, [isSpeaking, aiResponse, goIdle]);

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

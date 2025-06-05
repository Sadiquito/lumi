
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { useConversationState } from '@/hooks/useConversationState';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface UseAudioRecordingFeatureProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  disabled?: boolean;
  maxDuration?: number;
}

export const useAudioRecordingFeature = ({
  onTranscriptionComplete,
  onAIResponse,
  disabled = false,
  maxDuration
}: UseAudioRecordingFeatureProps) => {
  const { toast } = useToast();
  const { trialStatus } = useAuth();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [thinkingProgress, setThinkingProgress] = useState(0);

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
      toast({
        title: "Session timeout",
        description: "The conversation has timed out due to inactivity.",
      });
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
      toast({
        title: "Recording error",
        description: error,
        variant: "destructive",
      });
      goIdle();
    }
  });

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionProgress(0);
    
    try {
      // Simulate transcription progress
      const progressInterval = setInterval(() => {
        setTranscriptionProgress(prev => Math.min(prev + 10, 70));
      }, 200);

      // Simulate transcription for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(progressInterval);
      setTranscriptionProgress(100);
      
      const mockTranscript = "This is a sample transcription from your voice recording. The WebRTC audio capture is now working with real microphone input.";
      
      // Add user message to conversation
      addMessage({
        content: mockTranscript,
        speaker: 'user',
        type: 'audio',
        metadata: {
          duration: duration,
          audioUrl: URL.createObjectURL(audioBlob)
        }
      });

      onTranscriptionComplete?.(mockTranscript);
      
      // Start AI thinking process
      await handleAIThinking(mockTranscript);
      
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "Could not transcribe your audio. Please try again.",
        variant: "destructive",
      });
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
      // Simulate AI thinking progress
      const thinkingInterval = setInterval(() => {
        setThinkingProgress(prev => Math.min(prev + 5, 90));
      }, 100);

      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearInterval(thinkingInterval);
      setThinkingProgress(100);

      const mockResponse = `Thank you for sharing that with me. I can hear the thoughtfulness in your voice. Based on what you've said about "${userInput.slice(0, 50)}...", I think there's a lot to explore here. What aspect of this situation feels most important to you right now?`;
      
      setAiResponse(mockResponse);
      
      // Add AI message to conversation
      addMessage({
        content: mockResponse,
        speaker: 'ai',
        type: 'text'
      });

      startSpeaking();
      onAIResponse?.(mockResponse);
      
    } catch (error) {
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
    if (!state.hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        toast({
          title: "Permission required",
          description: "Please allow microphone access to record audio.",
          variant: "destructive",
        });
        return;
      }
    }

    const started = await startRecording();
    if (started) {
      startListening();
      toast({
        title: "Recording started",
        description: trialStatus.hasPremiumAccess 
          ? "Recording in progress..."
          : "Recording started (60 second limit for trial users)",
      });
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    // Processing state will be set in onRecordingComplete callback
  };

  // Handle speech completion by listening for when TTS finishes
  useEffect(() => {
    if (isSpeaking && aiResponse) {
      // Set a timeout to transition back to idle after TTS should be complete
      // This is a simple approach - in a real app you'd want to listen to actual TTS events
      const estimatedDuration = aiResponse.length * 50; // Rough estimate: 50ms per character
      const timeout = setTimeout(() => {
        setAiResponse('');
        goIdle();
      }, Math.max(estimatedDuration, 3000)); // Minimum 3 seconds

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

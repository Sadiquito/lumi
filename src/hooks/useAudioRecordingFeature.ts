import { useAudioSessionManager } from '@/hooks/useAudioSessionManager';
import { useAudioRecordingCore } from '@/hooks/useAudioRecordingCore';
import { useAudioConversationFlow } from '@/hooks/useAudioConversationFlow';
import { UseAudioRecordingFeatureProps } from '@/types/audioRecording';
import { useToast } from '@/hooks/use-toast';

export const useAudioRecordingFeature = ({
  onTranscriptionComplete,
  onAIResponse,
  disabled = false,
  maxDuration,
  onFallbackToText
}: UseAudioRecordingFeatureProps) => {
  const { toast } = useToast();

  // Session management
  const {
    session,
    sessionState,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateActivity,
    getSessionDuration,
    isSessionActive,
  } = useAudioSessionManager();

  // Audio recording core functionality
  const {
    recordedBlob,
    setRecordedBlob,
    audioQuality,
    setAudioQuality,
    networkStatus,
    retryCount,
    setRetryCount,
    state,
    isSupported,
    audioLevel,
    duration,
    handleStartRecording: coreStartRecording,
    handleStopRecording: coreStopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecordingCore({
    maxDuration,
    onFallbackToText
  });

  // Conversation flow management
  const {
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
    startListening,
    startProcessing,
    getStateDuration,
    handleTranscription,
    goIdle,
    setAiResponse,
  } = useAudioConversationFlow({
    onTranscriptionComplete,
    onAIResponse,
    onFallbackToText
  });

  // Enhanced start recording that ensures session is active
  const handleStartRecording = async () => {
    try {
      if (!isSessionActive) {
        toast({
          title: "Start a session first",
          description: "Please start a conversation session before recording.",
          variant: "destructive",
        });
        return;
      }

      await coreStartRecording();
      if (state.isRecording) {
        startListening();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Failed",
        description: "Could not start recording. Please try again or use text input.",
        variant: "destructive",
      });
      if (onFallbackToText) {
        onFallbackToText();
      }
    }
  };

  // Enhanced stop recording that handles cleanup
  const handleStopRecording = async () => {
    try {
      await coreStopRecording();
      if (recordedBlob) {
        startProcessing();
        await handleTranscription(recordedBlob);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to process recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle barge-in detection
  const handleBargeIn = async () => {
    if (isSpeaking) {
      console.log('Barge-in detected - stopping Lumi and switching to user input');
      // Stop Lumi's speech
      pauseRecording();
      // Start listening to user
      await handleStartRecording();
    }
  };

  // Handle session end cleanup
  const handleSessionEnd = () => {
    if (state.isRecording) {
      coreStopRecording();
    }
    goIdle();
    endSession();
  };

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
    audioQuality,
    networkStatus,
    retryCount,
    conversationData,
    recordedBlob,
    
    // Session management
    session,
    sessionState,
    startSession,
    endSession: handleSessionEnd,
    pauseSession,
    resumeSession,
    getSessionDuration,
    isSessionActive,
    
    // Conversation states
    isIdle,
    isListening,
    isProcessing,
    isSpeaking,
    
    // Actions
    handleStartRecording,
    handleStopRecording,
    handleBargeIn,
    pauseRecording,
    resumeRecording,
    getStateDuration
  };
};

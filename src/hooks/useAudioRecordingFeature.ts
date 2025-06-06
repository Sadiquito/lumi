
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
    trialStatus,
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
    if (!isSessionActive) {
      toast({
        title: "Start a session first",
        description: "Please start a conversation session before recording.",
        variant: "destructive",
      });
      return;
    }

    try {
      await coreStartRecording();
      if (state.isRecording) {
        startListening();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  // Enhanced stop recording that triggers transcription
  const handleStopRecording = () => {
    coreStopRecording();
    
    // Wait for the recorded blob to be available
    setTimeout(() => {
      if (recordedBlob) {
        console.log('Starting transcription with recorded blob:', {
          size: recordedBlob.size,
          type: recordedBlob.type,
          duration,
          audioQuality
        });
        
        startProcessing();
        handleTranscription(
          recordedBlob, 
          duration, 
          audioQuality, 
          networkStatus, 
          isSessionActive, 
          updateActivity, 
          retryCount, 
          setRetryCount
        );
      } else {
        console.error('No recorded blob available for transcription');
        toast({
          title: "Recording Error",
          description: "No audio was recorded. Please try again.",
          variant: "destructive",
        });
        goIdle();
      }
    }, 100); // Small delay to ensure blob is set
  };

  // Enhanced audio recorder with transcription handling
  const enhancedAudioRecorder = {
    ...state,
    startRecording: handleStartRecording,
    stopRecording: handleStopRecording,
    pauseRecording,
    resumeRecording,
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
    state: enhancedAudioRecorder,
    audioLevel,
    duration,
    trialStatus,
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
    pauseRecording,
    resumeRecording,
    getStateDuration
  };
};

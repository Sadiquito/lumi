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

  // Enhanced stop recording that triggers transcription with safety checks
  const handleStopRecording = () => {
    try {
      coreStopRecording();
      
      // Wait for the recorded blob to be available with timeout
      const checkForBlob = (attempts = 0) => {
        const maxAttempts = 10; // 1 second total wait time
        
        if (attempts >= maxAttempts) {
          console.error('Timeout waiting for recorded blob');
          toast({
            title: "Recording Error",
            description: "The recording didn't complete properly. Please try again.",
            variant: "destructive",
          });
          goIdle();
          return;
        }
        
        if (recordedBlob && recordedBlob.size > 0) {
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
          // Check again after a short delay
          setTimeout(() => checkForBlob(attempts + 1), 100);
        }
      };
      
      checkForBlob();
    } catch (error) {
      console.error('Critical error in stop recording:', error);
      toast({
        title: "Recording Error",
        description: "There was an error processing the recording. Please try again.",
        variant: "destructive",
      });
      goIdle();
    }
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

import { useEffect } from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioRecordingState } from '@/hooks/useAudioRecordingState';
import { useAudioRecordingHandlers } from '@/hooks/useAudioRecordingHandlers';
import { useToast } from '@/hooks/use-toast';
import { UseAudioRecordingFeatureProps } from '@/types/audioRecording';

export const useAudioRecordingCore = ({
  maxDuration,
  onFallbackToText
}: UseAudioRecordingFeatureProps) => {
  const { toast } = useToast();

  const {
    recordedBlob,
    setRecordedBlob,
    audioQuality,
    setAudioQuality,
    networkStatus,
    setNetworkStatus,
    retryCount,
    setRetryCount,
  } = useAudioRecordingState();

  const {
    handleAudioRecorderError,
  } = useAudioRecordingHandlers(setRetryCount, onFallbackToText);

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
    onError: handleAudioRecorderError,
    onRecordingComplete: (audioBlob: Blob) => {
      console.log('Audio recording completed:', {
        size: audioBlob.size,
        type: audioBlob.type,
        duration
      });
      if (!audioBlob) {
        console.error('Audio recording completed but no blob provided');
        toast({
          title: "Recording Error",
          description: "No audio was captured. Please try again.",
          variant: "destructive",
        });
        return;
      }
      if (audioBlob.size === 0) {
        console.error('Audio recording completed but blob is empty');
        toast({
          title: "Recording Error", 
          description: "The audio recording was empty. Please speak and try again.",
          variant: "destructive",
        });
        return;
      }
      if (audioBlob.size < 100) {
        console.warn('Audio recording is very small, may be invalid');
        toast({
          title: "Recording Warning",
          description: "The recording seems very short. Please try speaking for longer.",
        });
      }
      setRecordedBlob(audioBlob);
    }
  });

  // Monitor network status with error handling
  useEffect(() => {
    const updateNetworkStatus = () => {
      try {
        setNetworkStatus({ online: navigator.onLine });
      } catch (error) {
        console.error('Failed to update network status:', error);
        setNetworkStatus({ online: true });
      }
    };
    updateNetworkStatus();
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [setNetworkStatus]);

  // Monitor audio quality with error handling
  useEffect(() => {
    try {
      if (audioLevel > 0) {
        if (audioLevel < 0.05) {
          setAudioQuality({
            level: 'poor',
            signalToNoise: audioLevel
          });
        } else if (audioLevel < 0.15) {
          setAudioQuality({
            level: 'fair',
            signalToNoise: audioLevel
          });
        } else {
          setAudioQuality({
            level: 'good',
            signalToNoise: audioLevel
          });
        }
      }
    } catch (error) {
      console.error('Failed to update audio quality:', error);
      setAudioQuality({
        level: 'good',
        signalToNoise: 0.8
      });
    }
  }, [audioLevel, setAudioQuality]);

  // Check browser support
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Audio recording not supported:', error);
        if (onFallbackToText) {
          onFallbackToText();
        }
      }
    };
    checkSupport();
  }, [onFallbackToText]);

  // Start recording
  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed to start",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again or use text input.`,
        variant: "destructive",
      });
      if (onFallbackToText) {
        onFallbackToText();
      }
    }
  };

  // Stop recording
  const handleStopRecording = () => {
    try {
      stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecordedBlob(null);
      toast({
        title: "Recording Error",
        description: "There was an issue with the recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
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
    handleStartRecording,
    handleStopRecording,
    pauseRecording,
    resumeRecording
  };
};


import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioRecordingState } from '@/hooks/useAudioRecordingState';
import { useAudioRecordingHandlers } from '@/hooks/useAudioRecordingHandlers';
import { useToast } from '@/hooks/use-toast';
import { UseAudioRecordingFeatureProps } from '@/types/audioRecording';

export const useAudioRecordingCore = ({
  maxDuration,
  onFallbackToText
}: Pick<UseAudioRecordingFeatureProps, 'maxDuration' | 'onFallbackToText'>) => {
  const { toast } = useToast();
  const { trialStatus } = useAuth();

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
        // Assume online if we can't detect
        setNetworkStatus({ online: true });
      }
    };

    // Initial check
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
      // Default to good quality if we can't detect
      setAudioQuality({
        level: 'good',
        signalToNoise: 0.8
      });
    }
  }, [audioLevel, setAudioQuality]);

  const handleStartRecording = async () => {
    try {
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

      if (!networkStatus.online) {
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

      // Clear previous recording
      setRecordedBlob(null);
      setRetryCount(0);

      const started = await startRecording();
      if (started) {
        setAudioQuality({
          level: 'good',
          signalToNoise: 0.8
        });
        toast({
          title: "Recording started",
          description: trialStatus.hasPremiumAccess 
            ? "Recording in progress..."
            : "Recording started (60 second limit for trial users)",
        });
      } else {
        throw new Error('Failed to start recording');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
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
    try {
      if (audioQuality.level === 'poor') {
        toast({
          title: "Low audio quality detected",
          description: "The recording may not transcribe well. Consider recording again.",
        });
      }
      
      stopRecording();
    } catch (error) {
      console.error('Error stopping recording:', error);
      // Force stop even if there's an error
      try {
        stopRecording();
      } catch (secondError) {
        console.error('Failed to force stop recording:', secondError);
      }
    }
  };

  return {
    // Recording state
    recordedBlob,
    setRecordedBlob,
    audioQuality,
    setAudioQuality,
    networkStatus,
    retryCount,
    setRetryCount,
    
    // Audio recorder
    state,
    isSupported,
    audioLevel,
    duration,
    
    // Actions
    handleStartRecording,
    handleStopRecording,
    pauseRecording,
    resumeRecording,
    
    // Meta
    trialStatus,
  };
};

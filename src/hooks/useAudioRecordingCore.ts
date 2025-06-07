import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAudioRecordingState } from '@/hooks/useAudioRecordingState';
import { useAudioRecordingHandlers } from '@/hooks/useAudioRecordingHandlers';
import { useToast } from '@/hooks/use-toast';
import { UseAudioRecordingFeatureProps } from '@/types/audioRecording';

interface AudioRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  error: string | null;
}

export const useAudioRecordingCore = ({
  maxDuration,
  onFallbackToText
}: UseAudioRecordingFeatureProps) => {
  const { toast } = useToast();
  // Removed trial status - all users have full access

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
      
      // Enhanced validation before setting the blob
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

  // Check browser support
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setIsSupported(true);
      } catch (error) {
        console.error('Audio recording not supported:', error);
        setIsSupported(false);
        onFallbackToText?.();
      }
    };

    checkSupport();
  }, [onFallbackToText]);

  // Initialize audio context and analyzer
  const initializeAudioContext = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      const analyserNode = context.createAnalyser();
      const source = context.createMediaStreamSource(stream);
      source.connect(analyserNode);

      analyserNode.fftSize = 256;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (!state.isRecording) return;

        analyserNode.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(average / 128); // Normalize to 0-1 range

        requestAnimationFrame(updateAudioLevel);
      };

      setAudioContext(context);
      setAnalyser(analyserNode);
      updateAudioLevel();

      return stream;
    } catch (error) {
      console.error('Error initializing audio context:', error);
      throw error;
    }
  }, [state.isRecording]);

  const handleStartRecording = async () => {
    try {
      console.log('Starting recording - checking browser support:', isSupported);
      
      if (!isSupported) {
        console.error('Browser does not support audio recording');
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

      console.log('Checking network status:', networkStatus.online);
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

      console.log('Checking permissions:', state.hasPermission);
      if (!state.hasPermission) {
        console.log('Requesting microphone permission...');
        const granted = await requestPermission();
        console.log('Permission granted:', granted);
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

      // Clear previous recording and reset state
      setRecordedBlob(null);
      setRetryCount(0);

      console.log('Attempting to start recording...');
      const started = await startRecording();
      console.log('Recording started successfully:', started);
      
      if (started) {
        setAudioQuality({
          level: 'good',
          signalToNoise: 0.8
        });
        toast({
          title: "Recording started",
          description: "Recording in progress...",
        });
      } else {
        throw new Error('Failed to start recording - no error details available');
      }
    } catch (error) {
      console.error('Detailed error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Recording failed to start",
        description: `Error: ${errorMessage}. Please try again or use text input.`,
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
        // Clear state manually if all else fails
        setRecordedBlob(null);
        toast({
          title: "Recording Error",
          description: "There was an issue with the recording. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [mediaRecorder, audioContext]);

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
    // trialStatus removed
  };
};

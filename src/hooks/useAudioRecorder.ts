
import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioRecorder, AudioRecorderConfig, AudioRecorderState, AudioChunk } from '@/utils/AudioRecorder';
import { AudioProcessor } from '@/utils/AudioProcessing';
import { useAuth } from '@/components/SimpleAuthProvider';

export interface UseAudioRecorderConfig {
  maxDuration?: number;
  sampleRate?: number;
  onRecordingComplete?: (audioBlob: Blob) => void;
  onError?: (error: string) => void;
}

export interface UseAudioRecorderReturn {
  state: AudioRecorderState;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  requestPermission: () => Promise<boolean>;
  isSupported: boolean;
  audioLevel: number;
  duration: number;
}

const DEFAULT_CONFIG: AudioRecorderConfig = {
  sampleRate: 24000, // Optimal for Whisper API
  channels: 1,
  bitDepth: 16,
};

export const useAudioRecorder = (config: UseAudioRecorderConfig = {}): UseAudioRecorderReturn => {
  // Removed trial status - all users have full access
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    currentTime: 0,
    audioLevel: 0,
    hasPermission: false,
    error: null,
  });

  const [isSupported, setIsSupported] = useState(false);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioChunksRef = useRef<AudioChunk[]>([]);

  // No max duration limit - all users have unlimited recording
  const maxDuration = config.maxDuration;

  const recorderConfig: AudioRecorderConfig = {
    ...DEFAULT_CONFIG,
    sampleRate: config.sampleRate || DEFAULT_CONFIG.sampleRate,
    maxDuration,
  };

  // Check browser support on mount
  useEffect(() => {
    AudioRecorder.checkBrowserSupport().then(setIsSupported);
  }, []);

  const handleStateChange = useCallback((newState: AudioRecorderState) => {
    setState(newState);
    
    if (newState.error && config.onError) {
      config.onError(newState.error);
    }
  }, [config]);

  const handleAudioData = useCallback((chunk: AudioChunk) => {
    audioChunksRef.current.push(chunk);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      const error = 'Audio recording is not supported in this browser';
      setState(prev => ({ ...prev, error }));
      config.onError?.(error);
      return false;
    }

    if (!recorderRef.current) {
      recorderRef.current = new AudioRecorder(
        recorderConfig,
        handleStateChange,
        handleAudioData
      );
    }

    return await recorderRef.current.requestPermission();
  }, [isSupported, recorderConfig, handleStateChange, handleAudioData, config]);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      const error = 'Audio recording is not supported in this browser';
      config.onError?.(error);
      return false;
    }

    // No trial limits - all users have full access

    if (!recorderRef.current) {
      recorderRef.current = new AudioRecorder(
        recorderConfig,
        handleStateChange,
        handleAudioData
      );
    }

    audioChunksRef.current = [];
    return await recorderRef.current.startRecording();
  }, [isSupported, maxDuration, recorderConfig, handleStateChange, handleAudioData, config]);

  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return;

    const audioData = recorderRef.current.stopRecording();
    
    if (audioData && config.onRecordingComplete) {
      try {
        // Process the audio data
        const processedAudio = AudioProcessor.normalizeAudio(audioData);
        const trimmedAudio = AudioProcessor.trimSilence(processedAudio);
        
        // Convert to WAV blob
        const wavBlob = AudioProcessor.convertToWav(trimmedAudio, {
          sampleRate: recorderConfig.sampleRate,
          channels: recorderConfig.channels,
          bitDepth: recorderConfig.bitDepth,
        });

        config.onRecordingComplete(wavBlob);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to process audio';
        config.onError?.(errorMessage);
      }
    }

    audioChunksRef.current = [];
  }, [config, recorderConfig]);

  const pauseRecording = useCallback(() => {
    recorderRef.current?.pauseRecording();
  }, []);

  const resumeRecording = useCallback(() => {
    recorderRef.current?.resumeRecording();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.destroy();
        recorderRef.current = null;
      }
    };
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    requestPermission,
    isSupported,
    audioLevel: state.audioLevel,
    duration: state.currentTime,
  };
};

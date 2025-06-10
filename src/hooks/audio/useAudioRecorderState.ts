
import { useState, useCallback, useEffect } from 'react';
import { useAudioRecorder, AudioChunk } from '@/hooks/useAudioRecorder';
import { encodeAudioForTransmission } from '@/utils/audioUtils';

interface UseAudioRecorderStateProps {
  onAudioData?: (encodedAudio: string, isSpeech: boolean) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  autoStart?: boolean;
}

export const useAudioRecorderState = ({
  onAudioData,
  onSpeechStart,
  onSpeechEnd,
  onRecordingStateChange,
  autoStart = true,
}: UseAudioRecorderStateProps) => {
  const handleAudioChunk = useCallback((chunk: AudioChunk) => {
    console.log('🎤 Audio chunk received in AudioRecorder:', {
      timestamp: chunk.timestamp,
      isSpeech: chunk.isSpeech,
      dataLength: chunk.data.length,
      rms: Math.sqrt(chunk.data.reduce((sum, val) => sum + val * val, 0) / chunk.data.length)
    });

    // ALWAYS encode and send audio when there's a chunk, regardless of speech detection
    // Let the STT service decide what to do with it
    if (chunk.data && chunk.data.length > 0) {
      const encodedAudio = encodeAudioForTransmission(chunk.data);
      console.log('📤 Sending encoded audio:', {
        originalLength: chunk.data.length,
        encodedLength: encodedAudio.length,
        isSpeech: chunk.isSpeech
      });
      onAudioData?.(encodedAudio, chunk.isSpeech);
    } else {
      console.warn('⚠️ Received empty audio chunk');
    }
  }, [onAudioData]);

  const handleSpeechStart = useCallback(() => {
    console.log('🎤 Speech detection: User started speaking');
    onSpeechStart?.();
  }, [onSpeechStart]);

  const handleSpeechEnd = useCallback(() => {
    console.log('🔇 Speech detection: User stopped speaking');
    onSpeechEnd?.();
  }, [onSpeechEnd]);

  const {
    isRecording,
    isSpeaking,
    error,
    startRecording,
    stopRecording,
  } = useAudioRecorder({
    onAudioChunk: handleAudioChunk,
    onSpeechStart: handleSpeechStart,
    onSpeechEnd: handleSpeechEnd,
    config: {
      vadThreshold: 0.01, // Sensitive voice detection
      silenceDuration: 1500, // 1.5 seconds of silence before ending turn
    }
  });

  // Auto-start recording when component mounts if autoStart is true
  useEffect(() => {
    if (autoStart && !isRecording) {
      console.log('🎙️ Auto-starting recording...');
      startRecording();
    }
  }, [autoStart, isRecording, startRecording]);

  // Auto-restart recording if it stops unexpectedly during auto mode
  useEffect(() => {
    if (autoStart && !isRecording && !error) {
      console.log('🔄 Recording stopped unexpectedly, restarting...');
      const timer = setTimeout(() => {
        startRecording();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, isRecording, error, startRecording]);

  // Notify parent of recording state changes
  useEffect(() => {
    console.log('📡 Recording state changed:', isRecording);
    onRecordingStateChange?.(isRecording);
  }, [isRecording, onRecordingStateChange]);

  // Log errors to console when they occur
  useEffect(() => {
    if (error) {
      console.error('AudioRecorder error:', error);
    }
  }, [error]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  return {
    isRecording,
    isSpeaking,
    error,
    handleToggleRecording
  };
};

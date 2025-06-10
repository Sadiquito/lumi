
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
    console.log('🎤 [AudioRecorderState] Audio chunk received:', {
      timestamp: chunk.timestamp,
      isSpeech: chunk.isSpeech,
      dataLength: chunk.data.length,
      rms: Math.sqrt(chunk.data.reduce((sum, val) => sum + val * val, 0) / chunk.data.length).toFixed(6),
      hasOnAudioData: !!onAudioData
    });

    // ALWAYS encode and send audio when there's a chunk, regardless of speech detection
    // Let the STT service decide what to do with it
    if (chunk.data && chunk.data.length > 0) {
      try {
        const encodedAudio = encodeAudioForTransmission(chunk.data);
        console.log('📤 [AudioRecorderState] Sending encoded audio:', {
          originalLength: chunk.data.length,
          encodedLength: encodedAudio.length,
          isSpeech: chunk.isSpeech,
          encodedPreview: encodedAudio.substring(0, 50) + '...'
        });
        
        if (onAudioData) {
          onAudioData(encodedAudio, chunk.isSpeech);
          console.log('✅ [AudioRecorderState] Audio data sent to parent');
        } else {
          console.warn('⚠️ [AudioRecorderState] No onAudioData callback provided');
        }
      } catch (error) {
        console.error('❌ [AudioRecorderState] Error encoding audio:', error);
      }
    } else {
      console.warn('⚠️ [AudioRecorderState] Received empty audio chunk');
    }
  }, [onAudioData]);

  const handleSpeechStart = useCallback(() => {
    console.log('🎤 [AudioRecorderState] Speech detection: User started speaking');
    if (onSpeechStart) {
      onSpeechStart();
      console.log('✅ [AudioRecorderState] Speech start callback executed');
    }
  }, [onSpeechStart]);

  const handleSpeechEnd = useCallback(() => {
    console.log('🔇 [AudioRecorderState] Speech detection: User stopped speaking');
    if (onSpeechEnd) {
      onSpeechEnd();
      console.log('✅ [AudioRecorderState] Speech end callback executed');
    }
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
      console.log('🎙️ [AudioRecorderState] Auto-starting recording...');
      startRecording().then(() => {
        console.log('✅ [AudioRecorderState] Auto-start recording successful');
      }).catch((error) => {
        console.error('❌ [AudioRecorderState] Auto-start recording failed:', error);
      });
    }
  }, [autoStart, isRecording, startRecording]);

  // Auto-restart recording if it stops unexpectedly during auto mode
  useEffect(() => {
    if (autoStart && !isRecording && !error) {
      console.log('🔄 [AudioRecorderState] Recording stopped unexpectedly, restarting...');
      const timer = setTimeout(() => {
        startRecording().then(() => {
          console.log('✅ [AudioRecorderState] Auto-restart recording successful');
        }).catch((error) => {
          console.error('❌ [AudioRecorderState] Auto-restart recording failed:', error);
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, isRecording, error, startRecording]);

  // Notify parent of recording state changes
  useEffect(() => {
    console.log('📡 [AudioRecorderState] Recording state changed:', isRecording);
    if (onRecordingStateChange) {
      onRecordingStateChange(isRecording);
      console.log('✅ [AudioRecorderState] Recording state callback executed');
    }
  }, [isRecording, onRecordingStateChange]);

  // Log errors to console when they occur
  useEffect(() => {
    if (error) {
      console.error('❌ [AudioRecorderState] AudioRecorder error:', error);
    }
  }, [error]);

  const handleToggleRecording = async () => {
    console.log('🎛️ [AudioRecorderState] Toggle recording requested, current state:', isRecording);
    if (isRecording) {
      stopRecording();
      console.log('🛑 [AudioRecorderState] Stop recording called');
    } else {
      try {
        await startRecording();
        console.log('▶️ [AudioRecorderState] Start recording successful');
      } catch (error) {
        console.error('❌ [AudioRecorderState] Start recording failed:', error);
      }
    }
  };

  return {
    isRecording,
    isSpeaking,
    error,
    handleToggleRecording
  };
};

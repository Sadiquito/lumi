
import React from 'react';
import { AudioRecorderUI } from './AudioRecorderUI';
import { useAudioRecorderState } from '@/hooks/audio/useAudioRecorderState';
import type { AudioRecorderProps } from '@/types/audioRecorder';

export const AudioRecorderCore: React.FC<AudioRecorderProps> = ({
  onAudioData,
  onSpeechStart,
  onSpeechEnd,
  onRecordingStateChange,
  autoStart = true,
}) => {
  const {
    isRecording,
    isSpeaking,
    error,
    handleToggleRecording
  } = useAudioRecorderState({
    onAudioData,
    onSpeechStart,
    onSpeechEnd,
    onRecordingStateChange,
    autoStart,
  });

  // If in autoStart mode, render hidden component
  if (autoStart) {
    return (
      <div style={{ display: 'none' }}>
        {/* Component is running but hidden */}
      </div>
    );
  }

  return (
    <AudioRecorderUI
      isRecording={isRecording}
      isSpeaking={isSpeaking}
      error={error}
      onToggleRecording={handleToggleRecording}
    />
  );
};

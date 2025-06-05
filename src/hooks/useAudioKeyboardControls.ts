
import { useEffect, useCallback } from 'react';

interface UseAudioKeyboardControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  disabled?: boolean;
}

export const useAudioKeyboardControls = ({
  isRecording,
  isPaused,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  disabled = false
}: UseAudioKeyboardControlsProps) => {
  
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Don't trigger if user is typing in an input
    if (event.target && (event.target as HTMLElement).tagName === 'INPUT' || 
        (event.target as HTMLElement).tagName === 'TEXTAREA') {
      return;
    }

    // Don't trigger if disabled
    if (disabled) return;

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        if (!isRecording) {
          onStartRecording();
        } else if (isPaused) {
          onResumeRecording();
        } else {
          onPauseRecording();
        }
        break;
      
      case 'Enter':
        if (isRecording) {
          event.preventDefault();
          onStopRecording();
        }
        break;
      
      case 'Escape':
        if (isRecording) {
          event.preventDefault();
          onStopRecording();
        }
        break;
    }
  }, [isRecording, isPaused, onStartRecording, onStopRecording, onPauseRecording, onResumeRecording, disabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return {
    // Return keyboard shortcuts info for display
    shortcuts: {
      space: !isRecording ? 'Start recording' : isPaused ? 'Resume recording' : 'Pause recording',
      enter: isRecording ? 'Stop recording' : null,
      escape: isRecording ? 'Stop recording' : null
    }
  };
};

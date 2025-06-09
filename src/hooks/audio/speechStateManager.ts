
import { useCallback, useRef } from 'react';

interface SpeechStateManagerProps {
  isSpeaking: boolean;
  silenceDuration: number;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  setIsSpeaking: (speaking: boolean) => void;
}

export const useSpeechStateManager = ({
  isSpeaking,
  silenceDuration,
  onSpeechStart,
  onSpeechEnd,
  setIsSpeaking,
}: SpeechStateManagerProps) => {
  const silenceTimeoutRef = useRef<number | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);

  const handleSpeechStateChange = useCallback((isSpeech: boolean) => {
    const currentTime = Date.now();

    if (isSpeech && !isSpeaking) {
      console.log('🎤 Speech detected - starting');
      setIsSpeaking(true);
      onSpeechStart?.();
      lastSpeechTimeRef.current = currentTime;
      
      // Clear any existing silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    } else if (isSpeech) {
      // Update last speech time
      lastSpeechTimeRef.current = currentTime;
      
      // Clear silence timeout if speech continues
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    } else if (!isSpeech && isSpeaking) {
      // Start silence timeout
      if (!silenceTimeoutRef.current) {
        console.log('🔇 Starting silence timeout');
        silenceTimeoutRef.current = window.setTimeout(() => {
          console.log('🔇 Speech ended - silence detected');
          setIsSpeaking(false);
          onSpeechEnd?.();
          silenceTimeoutRef.current = null;
        }, silenceDuration);
      }
    }
  }, [isSpeaking, onSpeechStart, onSpeechEnd, silenceDuration, setIsSpeaking]);

  const clearTimeouts = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  return {
    handleSpeechStateChange,
    clearTimeouts,
  };
};

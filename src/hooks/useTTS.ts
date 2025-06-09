
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseTTSProps {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

export const useTTS = ({ onSpeechStart, onSpeechEnd }: UseTTSProps = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, voiceId?: string) => {
    if (!text.trim()) return;

    try {
      setIsProcessing(true);
      setError(null);

      console.log('Converting text to speech:', text);

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: text.trim(),
          voiceId
        }
      });

      if (error) {
        console.error('TTS function error:', error);
        throw new Error(error.message || 'Failed to convert text to speech');
      }

      if (!data.audioContent) {
        throw new Error('No audio content received');
      }

      // Create audio element and play
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: data.audioFormat || 'audio/mpeg' }
      );
      
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('ended', handleAudioEnd);
        audioRef.current.removeEventListener('error', handleAudioError);
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Declare event handlers first
      const handleAudioEnd = () => {
        console.log('Audio playback ended');
        setIsSpeaking(false);
        onSpeechEnd?.();
        URL.revokeObjectURL(audioUrl);
      };

      const handleAudioError = (e: any) => {
        console.error('Audio playback error:', e);
        setError('Failed to play audio');
        setIsSpeaking(false);
        onSpeechEnd?.();
        URL.revokeObjectURL(audioUrl);
      };

      audio.addEventListener('ended', handleAudioEnd);
      audio.addEventListener('error', handleAudioError);

      // Start playback
      await audio.play();
      setIsSpeaking(true);
      onSpeechStart?.();

      console.log('Audio playback started');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert text to speech';
      console.error('TTS error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onSpeechStart, onSpeechEnd]);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current && isSpeaking) {
      console.log('Stopping audio playback');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
      onSpeechEnd?.();
    }
  }, [isSpeaking, onSpeechEnd]);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    isProcessing,
    error
  };
};

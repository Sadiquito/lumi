
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseOptimizedTTSProps {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: string) => void;
}

export const useOptimizedTTS = ({ onSpeechStart, onSpeechEnd, onError }: UseOptimizedTTSProps = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<Array<{ text: string; voiceId?: string }>>([]);
  const isPlayingRef = useRef(false);

  const speak = useCallback(async (text: string, voiceId?: string) => {
    if (!text.trim()) return;

    // Add to queue
    audioQueueRef.current.push({ text: text.trim(), voiceId });
    
    // Process queue if not already playing
    if (!isPlayingRef.current) {
      processQueue();
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current) return;

    isPlayingRef.current = true;
    
    while (audioQueueRef.current.length > 0) {
      const { text, voiceId } = audioQueueRef.current.shift()!;
      
      try {
        setIsProcessing(true);
        setError(null);

        console.log('🔊 Converting text to speech:', { textLength: text.length, voiceId });

        const startTime = Date.now();
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { text, voiceId }
        });

        if (error) {
          throw new Error(error.message || 'TTS conversion failed');
        }

        console.log('✅ TTS conversion completed:', {
          processingTime: Date.now() - startTime,
          audioSize: data.audioContent?.length || 0
        });

        // Create and play audio
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: data.audioFormat || 'audio/mpeg' }
        );
        
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Clean up previous audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        // Promise-based audio playback
        await new Promise<void>((resolve, reject) => {
          const handleEnd = () => {
            console.log('🔊 Audio playback completed');
            setIsSpeaking(false);
            onSpeechEnd?.();
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          const handleError = (e: any) => {
            console.error('🔊 Audio playback error:', e);
            const errorMessage = 'Audio playback failed';
            setError(errorMessage);
            onError?.(errorMessage);
            URL.revokeObjectURL(audioUrl);
            reject(new Error(errorMessage));
          };

          audio.addEventListener('ended', handleEnd);
          audio.addEventListener('error', handleError);

          audio.play().then(() => {
            setIsSpeaking(true);
            onSpeechStart?.();
            console.log('🔊 Audio playback started');
          }).catch(handleError);
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'TTS processing failed';
        console.error('❌ TTS error:', errorMessage);
        setError(errorMessage);
        onError?.(errorMessage);
        break; // Stop processing queue on error
      } finally {
        setIsProcessing(false);
      }
    }

    isPlayingRef.current = false;
  }, [onSpeechStart, onSpeechEnd, onError]);

  const stopSpeaking = useCallback(() => {
    // Clear queue and stop current audio
    audioQueueRef.current = [];
    
    if (audioRef.current && isSpeaking) {
      console.log('🛑 Stopping audio playback');
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
      onSpeechEnd?.();
    }
    
    isPlayingRef.current = false;
  }, [isSpeaking, onSpeechEnd]);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    isProcessing,
    error
  };
};

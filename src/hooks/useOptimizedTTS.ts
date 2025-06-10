
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
    if (!text.trim()) {
      console.log('⚠️ [OptimizedTTS] Empty text provided for speech');
      return;
    }

    console.log('🔊 [OptimizedTTS] Adding text to speech queue:', {
      textLength: text.length,
      textPreview: text.substring(0, 50) + '...',
      voiceId,
      currentQueueLength: audioQueueRef.current.length
    });

    // Add to queue
    audioQueueRef.current.push({ text: text.trim(), voiceId });
    
    // Process queue if not already playing
    if (!isPlayingRef.current) {
      console.log('🎵 [OptimizedTTS] Starting queue processing...');
      processQueue();
    } else {
      console.log('🎵 [OptimizedTTS] Queue processing already in progress');
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isPlayingRef.current) {
      console.log('🔇 [OptimizedTTS] Queue processing skipped:', {
        queueEmpty: audioQueueRef.current.length === 0,
        alreadyPlaying: isPlayingRef.current
      });
      return;
    }

    isPlayingRef.current = true;
    console.log('🎬 [OptimizedTTS] Starting queue processing, items:', audioQueueRef.current.length);
    
    while (audioQueueRef.current.length > 0) {
      const { text, voiceId } = audioQueueRef.current.shift()!;
      
      try {
        setIsProcessing(true);
        setError(null);

        console.log('🔄 [OptimizedTTS] Converting text to speech:', { 
          textLength: text.length, 
          textPreview: text.substring(0, 50) + '...',
          voiceId 
        });

        const startTime = Date.now();
        const { data, error } = await supabase.functions.invoke('text-to-speech', {
          body: { text, voiceId }
        });

        const processingTime = Date.now() - startTime;

        if (error) {
          console.error('❌ [OptimizedTTS] TTS function error:', error);
          throw new Error(error.message || 'TTS conversion failed');
        }

        console.log('✅ [OptimizedTTS] TTS conversion completed:', {
          processingTime,
          audioSize: data?.audioContent?.length || 0,
          hasAudioContent: !!data?.audioContent
        });

        if (!data?.audioContent) {
          throw new Error('No audio content received from TTS service');
        }

        // Create and play audio
        console.log('🎵 [OptimizedTTS] Creating audio blob...');
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

        console.log('▶️ [OptimizedTTS] Starting audio playback...');

        // Promise-based audio playback
        await new Promise<void>((resolve, reject) => {
          const handleEnd = () => {
            console.log('🔊 [OptimizedTTS] Audio playback completed');
            setIsSpeaking(false);
            onSpeechEnd?.();
            URL.revokeObjectURL(audioUrl);
            resolve();
          };

          const handleError = (e: any) => {
            console.error('❌ [OptimizedTTS] Audio playback error:', e);
            const errorMessage = 'Audio playback failed';
            setError(errorMessage);
            onError?.(errorMessage);
            URL.revokeObjectURL(audioUrl);
            reject(new Error(errorMessage));
          };

          const handleCanPlay = () => {
            console.log('🎵 [OptimizedTTS] Audio can play, starting...');
            audio.play().then(() => {
              setIsSpeaking(true);
              onSpeechStart?.();
              console.log('🔊 [OptimizedTTS] Audio playback started successfully');
            }).catch(handleError);
          };

          audio.addEventListener('ended', handleEnd);
          audio.addEventListener('error', handleError);
          audio.addEventListener('canplay', handleCanPlay);

          // Load the audio
          audio.load();
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'TTS processing failed';
        console.error('❌ [OptimizedTTS] TTS error:', errorMessage);
        setError(errorMessage);
        onError?.(errorMessage);
        break; // Stop processing queue on error
      } finally {
        setIsProcessing(false);
      }
    }

    isPlayingRef.current = false;
    console.log('🏁 [OptimizedTTS] Queue processing complete');
  }, [onSpeechStart, onSpeechEnd, onError]);

  const stopSpeaking = useCallback(() => {
    // Clear queue and stop current audio
    console.log('🛑 [OptimizedTTS] Stopping speech, clearing queue:', audioQueueRef.current.length);
    audioQueueRef.current = [];
    
    if (audioRef.current && isSpeaking) {
      console.log('🛑 [OptimizedTTS] Stopping current audio playback');
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

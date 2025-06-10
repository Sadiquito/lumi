
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OptimizedSTTResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  isSpeech: boolean;
  timestamp?: number;
}

interface UseOptimizedSTTProps {
  onTranscript?: (result: OptimizedSTTResult) => void;
  onError?: (error: string) => void;
}

export const useOptimizedSTT = ({ onTranscript, onError }: UseOptimizedSTTProps = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const processingQueueRef = useRef<Promise<void>>(Promise.resolve());
  const retryCountRef = useRef(0);

  const processAudio = useCallback(async (
    audioData: string, 
    isSpeech: boolean, 
    timestamp: number
  ) => {
    if (!audioData || !isSpeech) return;

    // Queue processing to avoid overwhelming the API
    processingQueueRef.current = processingQueueRef.current.then(async () => {
      try {
        setIsProcessing(true);
        setError(null);

        console.log('🎤 Processing audio chunk:', {
          audioLength: audioData.length,
          isSpeech,
          timestamp: new Date(timestamp).toISOString(),
          queueDepth: 'processing'
        });

        const { data, error } = await supabase.functions.invoke('audio-to-text', {
          body: {
            audioData,
            isSpeech,
            timestamp
          }
        });

        if (error) {
          throw new Error(error.message || 'STT processing failed');
        }

        const result: OptimizedSTTResult = {
          transcript: data.transcript || '',
          isFinal: data.isFinal || false,
          confidence: data.confidence || 0,
          isSpeech: data.isSpeech || false,
          timestamp
        };

        // Reset retry count on success
        retryCountRef.current = 0;

        console.log('✅ STT result:', {
          transcript: result.transcript,
          confidence: result.confidence,
          processingTime: Date.now() - timestamp
        });

        onTranscript?.(result);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'STT processing failed';
        console.error('❌ STT error:', errorMessage);
        
        // Implement exponential backoff retry
        if (retryCountRef.current < 3) {
          retryCountRef.current++;
          const delay = Math.pow(2, retryCountRef.current) * 1000;
          console.log(`🔄 Retrying STT in ${delay}ms (attempt ${retryCountRef.current})`);
          
          setTimeout(() => {
            processAudio(audioData, isSpeech, timestamp);
          }, delay);
          return;
        }

        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    });

    return processingQueueRef.current;
  }, [onTranscript, onError]);

  return {
    processAudio,
    isProcessing,
    error
  };
};

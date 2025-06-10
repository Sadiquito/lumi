
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
  const lastProcessedTimeRef = useRef(0);

  const processAudio = useCallback(async (
    audioData: string, 
    isSpeech: boolean, 
    timestamp: number
  ) => {
    // Only process speech and avoid processing too frequently
    if (!audioData || !isSpeech) {
      console.log('⏭️ Skipping non-speech audio chunk');
      return;
    }

    // Throttle processing to avoid overwhelming the API
    const now = Date.now();
    if (now - lastProcessedTimeRef.current < 1000) { // Reduced throttle to 1 second
      console.log('⏱️ Throttling STT requests');
      return;
    }
    lastProcessedTimeRef.current = now;

    // Queue processing to avoid overwhelming the API
    processingQueueRef.current = processingQueueRef.current.then(async () => {
      try {
        setIsProcessing(true);
        setError(null);

        console.log('🎤 Processing audio chunk for STT:', {
          audioLength: audioData.length,
          isSpeech,
          timestamp: new Date(timestamp).toISOString(),
          processingStartTime: new Date().toISOString()
        });

        console.log('📡 About to call Supabase function: audio-to-text');

        const functionStartTime = Date.now();
        const { data, error: functionError } = await supabase.functions.invoke('audio-to-text', {
          body: {
            audioData,
            isSpeech,
            timestamp
          }
        });

        console.log('📡 Supabase function completed:', {
          duration: Date.now() - functionStartTime,
          data,
          error: functionError
        });

        if (functionError) {
          console.error('❌ STT function error:', functionError);
          throw new Error(functionError.message || 'STT processing failed');
        }

        if (!data) {
          console.error('❌ No data returned from STT service');
          throw new Error('No data returned from STT service');
        }

        console.log('✅ STT function response received:', data);

        const result: OptimizedSTTResult = {
          transcript: data.transcript || '',
          isFinal: data.isFinal || false,
          confidence: data.confidence || 0,
          isSpeech: data.isSpeech || false,
          timestamp
        };

        // Reset retry count on success
        retryCountRef.current = 0;

        console.log('✅ STT result processed:', {
          transcript: result.transcript,
          confidence: result.confidence,
          isFinal: result.isFinal,
          processingTime: Date.now() - timestamp
        });

        // Only call onTranscript if we have meaningful results
        if (result.transcript && result.transcript.trim().length > 0) {
          console.log('📤 Calling onTranscript with result:', result.transcript);
          onTranscript?.(result);
        } else {
          console.log('⚠️ Empty transcript received, not calling onTranscript');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'STT processing failed';
        console.error('❌ STT error:', errorMessage, err);
        
        // Implement exponential backoff retry for network errors
        if (retryCountRef.current < 2 && (errorMessage.includes('network') || errorMessage.includes('fetch'))) {
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

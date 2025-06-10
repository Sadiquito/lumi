
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface STTResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  isSpeech: boolean;
  timestamp?: number;
}

interface UseOptimizedSTTProps {
  onTranscript?: (result: STTResult) => void;
  onError?: (error: string) => void;
}

export const useOptimizedSTT = ({ onTranscript, onError }: UseOptimizedSTTProps = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastProcessTimeRef = useRef<number>(0);
  const processingQueueRef = useRef<Array<{ audioData: string; isSpeech: boolean; timestamp: number }>>([]);
  const isProcessingQueueRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || processingQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    console.log('🔄 [OptimizedSTT] Processing queue, items:', processingQueueRef.current.length);

    while (processingQueueRef.current.length > 0) {
      const item = processingQueueRef.current.shift();
      if (!item) continue;

      const now = Date.now();
      const timeSinceLastProcess = now - lastProcessTimeRef.current;
      
      // Only process if enough time has passed and it's speech
      if (timeSinceLastProcess >= 1000 && item.isSpeech) {
        console.log('🎯 [OptimizedSTT] Processing audio item:', {
          audioLength: item.audioData.length,
          isSpeech: item.isSpeech,
          timeSinceLastProcess
        });

        try {
          setIsProcessing(true);
          setError(null);
          lastProcessTimeRef.current = now;

          console.log('📡 [OptimizedSTT] Calling Supabase function audio-to-text...');

          const { data, error: functionError } = await supabase.functions.invoke('audio-to-text', {
            body: {
              audioData: item.audioData,
              isSpeech: item.isSpeech,
              timestamp: item.timestamp
            }
          });

          if (functionError) {
            console.error('❌ [OptimizedSTT] Supabase function error:', functionError);
            throw new Error(functionError.message || 'Failed to process audio');
          }

          console.log('✅ [OptimizedSTT] STT result received:', data);

          const result: STTResult = {
            transcript: data.transcript || '',
            isFinal: data.isFinal || false,
            confidence: data.confidence || 0,
            isSpeech: data.isSpeech || false,
            timestamp: item.timestamp
          };

          if (onTranscript) {
            onTranscript(result);
            console.log('📤 [OptimizedSTT] Transcript sent to callback:', result.transcript);
          }

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to process audio';
          console.error('❌ [OptimizedSTT] Processing error:', errorMessage);
          setError(errorMessage);
          if (onError) {
            onError(errorMessage);
          }
        } finally {
          setIsProcessing(false);
        }

        // Wait a bit before processing next item
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log('⏭️ [OptimizedSTT] Skipping audio item:', {
          isSpeech: item.isSpeech,
          timeSinceLastProcess,
          reason: !item.isSpeech ? 'not speech' : 'too soon'
        });
      }
    }

    isProcessingQueueRef.current = false;
    console.log('✅ [OptimizedSTT] Queue processing complete');
  }, [onTranscript, onError]);

  const processAudio = useCallback(async (
    audioData: string, 
    isSpeech: boolean, 
    timestamp: number
  ) => {
    console.log('📥 [OptimizedSTT] Audio received for processing:', {
      audioLength: audioData ? audioData.length : 0,
      isSpeech,
      timestamp: new Date(timestamp).toISOString(),
      queueLength: processingQueueRef.current.length
    });

    if (!audioData || audioData.length === 0) {
      console.warn('⚠️ [OptimizedSTT] Empty audio data received');
      return;
    }

    // Add to queue
    processingQueueRef.current.push({ audioData, isSpeech, timestamp });
    console.log('📋 [OptimizedSTT] Added to queue, new length:', processingQueueRef.current.length);

    // Start processing queue
    processQueue();
  }, [processQueue]);

  return {
    processAudio,
    isProcessing,
    error
  };
};

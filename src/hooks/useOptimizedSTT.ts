
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
      
      // Process speech chunks with reasonable timing
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

          const startTime = Date.now();
          const { data, error: functionError } = await supabase.functions.invoke('audio-to-text', {
            body: {
              audioData: item.audioData,
              isSpeech: item.isSpeech,
              timestamp: item.timestamp
            }
          });

          const requestTime = Date.now() - startTime;
          console.log('⏱️ [OptimizedSTT] Supabase function call completed:', {
            requestTime: `${requestTime}ms`,
            hasData: !!data,
            hasError: !!functionError,
            errorMessage: functionError?.message
          });

          if (functionError) {
            console.error('❌ [OptimizedSTT] Supabase function error:', functionError);
            throw new Error(functionError.message || 'Failed to process audio');
          }

          console.log('✅ [OptimizedSTT] Raw STT result received:', {
            data,
            hasTranscript: !!data?.transcript,
            transcriptLength: data?.transcript?.length || 0,
            transcriptPreview: data?.transcript?.substring(0, 50) + '...'
          });

          const result: STTResult = {
            transcript: data.transcript || '',
            isFinal: data.isFinal !== undefined ? data.isFinal : true,
            confidence: data.confidence || 0.8,
            isSpeech: data.isSpeech || false,
            timestamp: item.timestamp
          };

          console.log('📋 [OptimizedSTT] Processed STT result:', {
            transcript: result.transcript,
            isFinal: result.isFinal,
            confidence: result.confidence,
            isSpeech: result.isSpeech,
            hasTranscript: !!result.transcript && result.transcript.trim().length > 0,
            hasOnTranscriptCallback: !!onTranscript
          });

          // CRITICAL: Call onTranscript if we have meaningful content
          if (result.transcript && result.transcript.trim().length > 0) {
            console.log('📤 [OptimizedSTT] EXECUTING onTranscript callback with:', {
              transcript: result.transcript,
              isFinal: result.isFinal,
              confidence: result.confidence
            });
            
            if (onTranscript) {
              onTranscript(result);
              console.log('✅ [OptimizedSTT] onTranscript callback executed successfully');
            } else {
              console.error('❌ [OptimizedSTT] No onTranscript callback provided!');
            }
          } else {
            console.log('⏭️ [OptimizedSTT] Skipping empty transcript:', {
              hasTranscript: !!result.transcript,
              transcriptLength: result.transcript?.length || 0,
              trimmedLength: result.transcript?.trim().length || 0
            });
          }

        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to process audio';
          console.error('❌ [OptimizedSTT] Processing error:', {
            errorMessage,
            errorStack: err instanceof Error ? err.stack : 'No stack',
            timestamp: new Date().toISOString()
          });
          setError(errorMessage);
          if (onError) {
            onError(errorMessage);
          }
        } finally {
          setIsProcessing(false);
        }

        // Wait before processing next item
        await new Promise(resolve => setTimeout(resolve, 300));
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

    // Only add speech chunks to queue
    if (isSpeech) {
      // Keep queue manageable
      if (processingQueueRef.current.length > 1) {
        processingQueueRef.current = [];
        console.log('🧹 [OptimizedSTT] Cleared queue to prevent buildup');
      }

      processingQueueRef.current.push({ audioData, isSpeech, timestamp });
      console.log('📋 [OptimizedSTT] Added to queue, new length:', processingQueueRef.current.length);

      // Start processing
      processQueue();
    } else {
      console.log('⏭️ [OptimizedSTT] Skipping non-speech chunk');
    }
  }, [processQueue]);

  return {
    processAudio,
    isProcessing,
    error
  };
};

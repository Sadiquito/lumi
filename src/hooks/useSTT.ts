
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface STTResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  isSpeech: boolean;
  timestamp?: number;
}

interface UseSTTProps {
  onTranscript?: (result: STTResult) => void;
}

export const useSTT = ({ onTranscript }: UseSTTProps = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processAudio = useCallback(async (
    audioData: string, 
    isSpeech: boolean, 
    timestamp: number
  ) => {
    if (!audioData) return;

    try {
      setIsProcessing(true);
      setError(null);

      console.log('Sending audio to STT service:', {
        audioLength: audioData.length,
        isSpeech,
        timestamp: new Date(timestamp).toISOString()
      });

      const { data, error } = await supabase.functions.invoke('audio-to-text', {
        body: {
          audioData,
          isSpeech,
          timestamp
        }
      });

      if (error) {
        console.error('STT function error:', error);
        throw new Error(error.message || 'Failed to process audio');
      }

      console.log('STT result:', data);

      const result: STTResult = {
        transcript: data.transcript || '',
        isFinal: data.isFinal || false,
        confidence: data.confidence || 0,
        isSpeech: data.isSpeech || false,
        timestamp
      };

      onTranscript?.(result);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process audio';
      console.error('STT processing error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscript]);

  return {
    processAudio,
    isProcessing,
    error
  };
};


import { useState, useCallback } from 'react';
import { synthesizeAudio, AudioSynthesisResult, AudioSynthesisConfig } from '@/utils/audioSynthesis';
import { useToast } from '@/hooks/use-toast';

interface UseAudioSynthesisProps {
  onSynthesisComplete?: (result: AudioSynthesisResult) => void;
  onError?: (error: Error) => void;
  config?: AudioSynthesisConfig;
}

export const useAudioSynthesis = ({
  onSynthesisComplete,
  onError,
  config
}: UseAudioSynthesisProps = {}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<AudioSynthesisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSynthesis = useCallback(async (text: string, overrideConfig?: AudioSynthesisConfig) => {
    if (!text.trim()) {
      const errorMsg = 'Text is required for synthesis';
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      return null;
    }

    setIsSynthesizing(true);
    setError(null);
    setSynthesisResult(null);

    try {
      console.log('Starting audio synthesis for text:', text.substring(0, 100) + '...');
      
      const result = await synthesizeAudio(text, { ...config, ...overrideConfig });
      
      console.log('Audio synthesis successful:', {
        voiceId: result.voiceId,
        characterCount: result.characterCount,
        audioSize: result.audioBlob.size
      });
      
      setSynthesisResult(result);
      onSynthesisComplete?.(result);
      
      return result;
    } catch (err) {
      console.error('Audio synthesis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Synthesis failed';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      
      toast({
        title: "Audio Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsSynthesizing(false);
    }
  }, [config, onSynthesisComplete, onError, toast]);

  const clearResults = useCallback(() => {
    setSynthesisResult(null);
    setError(null);
  }, []);

  return {
    isSynthesizing,
    synthesisResult,
    error,
    handleSynthesis,
    clearResults
  };
};

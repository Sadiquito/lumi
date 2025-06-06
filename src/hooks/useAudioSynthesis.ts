
import { useState, useCallback } from 'react';
import { synthesizeAudio, AudioSynthesisResult, AudioSynthesisConfig } from '@/utils/audioSynthesis';
import { useToast } from '@/hooks/use-toast';

interface UseAudioSynthesisProps {
  onSynthesisComplete?: (result: AudioSynthesisResult) => void;
  onError?: (error: Error) => void;
  config?: AudioSynthesisConfig;
  enableFallback?: boolean;
}

export const useAudioSynthesis = ({
  onSynthesisComplete,
  onError,
  config,
  enableFallback = true
}: UseAudioSynthesisProps = {}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<AudioSynthesisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVoiceSupport, setHasVoiceSupport] = useState(true);
  const { toast } = useToast();

  const handleSynthesis = useCallback(async (text: string, overrideConfig?: AudioSynthesisConfig) => {
    if (!text.trim()) {
      const errorMsg = 'Text is required for synthesis';
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      return null;
    }

    // If voice support is disabled, skip synthesis
    if (!hasVoiceSupport && enableFallback) {
      console.log('Voice support disabled, skipping synthesis');
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
      
      // Handle different types of errors
      let userMessage = errorMessage;
      let shouldDisableVoice = false;
      
      if (errorMessage.includes('temporarily unavailable') || errorMessage.includes('service is temporarily')) {
        userMessage = 'Voice is temporarily unavailable. The text response is shown above.';
        shouldDisableVoice = false; // Don't disable permanently for temporary issues
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('busy')) {
        userMessage = 'Voice service is busy. Please try again in a moment.';
        shouldDisableVoice = false;
      } else if (errorMessage.includes('authentication') || errorMessage.includes('API key')) {
        userMessage = 'Voice service is unavailable. Using text-only mode.';
        shouldDisableVoice = true;
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        userMessage = 'Network issue detected. Voice temporarily disabled.';
        shouldDisableVoice = false;
      } else {
        userMessage = 'Voice generation failed. Text response is available above.';
        shouldDisableVoice = false;
      }
      
      // Disable voice support if we encounter configuration issues
      if (shouldDisableVoice && enableFallback) {
        setHasVoiceSupport(false);
        console.log('Voice support disabled due to configuration issues');
      }
      
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      
      // Only show toast for non-fallback scenarios or critical errors
      if (!enableFallback || shouldDisableVoice) {
        toast({
          title: "Voice Generation Issue",
          description: userMessage,
          variant: "destructive",
        });
      } else {
        // For fallback scenarios, show a less intrusive message
        toast({
          title: "Using Text Mode",
          description: userMessage,
        });
      }
      
      return null;
    } finally {
      setIsSynthesizing(false);
    }
  }, [config, onSynthesisComplete, onError, toast, hasVoiceSupport, enableFallback]);

  const clearResults = useCallback(() => {
    setSynthesisResult(null);
    setError(null);
  }, []);

  const enableVoiceSupport = useCallback(() => {
    setHasVoiceSupport(true);
    setError(null);
  }, []);

  const disableVoiceSupport = useCallback(() => {
    setHasVoiceSupport(false);
    setSynthesisResult(null);
    setError(null);
  }, []);

  return {
    isSynthesizing,
    synthesisResult,
    error,
    hasVoiceSupport,
    handleSynthesis,
    clearResults,
    enableVoiceSupport,
    disableVoiceSupport
  };
};

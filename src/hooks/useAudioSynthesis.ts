
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
      
      // Handle different types of errors with graceful fallback
      let userMessage = 'Voice generation failed. Text response is available above.';
      let shouldDisableVoice = false;
      
      if (errorMessage.includes('TTS_SERVICE_UNAVAILABLE') || errorMessage.includes('TTS_SERVER_ERROR')) {
        userMessage = 'Voice is temporarily unavailable. The text response is shown above.';
        shouldDisableVoice = false; // Don't disable permanently for temporary issues
      } else if (errorMessage.includes('TTS_RATE_LIMIT')) {
        userMessage = 'Voice service is busy. The text response is available above.';
        shouldDisableVoice = false;
      } else if (errorMessage.includes('TTS_AUTH_ERROR') || errorMessage.includes('TTS_AUTH_REQUIRED')) {
        userMessage = 'Voice service authentication failed. Using text-only mode.';
        shouldDisableVoice = true;
      } else if (errorMessage.includes('TTS_ALL_ATTEMPTS_FAILED')) {
        userMessage = 'Voice generation failed after multiple attempts. Text response is available above.';
        shouldDisableVoice = false;
      } else if (errorMessage.includes('TTS_TEXT_TOO_LONG')) {
        userMessage = 'Response too long for voice. Text response is available above.';
        shouldDisableVoice = false;
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        userMessage = 'Network issue detected. Voice temporarily disabled.';
        shouldDisableVoice = false;
      }
      
      // Disable voice support if we encounter authentication issues
      if (shouldDisableVoice && enableFallback) {
        setHasVoiceSupport(false);
        console.log('Voice support disabled due to authentication issues');
      }
      
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      
      // Show appropriate toast based on error severity
      if (shouldDisableVoice) {
        toast({
          title: "Voice Service Unavailable",
          description: userMessage,
          variant: "destructive",
        });
      } else if (enableFallback) {
        // For fallback scenarios, show less intrusive message
        toast({
          title: "Using Text Mode",
          description: userMessage,
        });
      } else {
        toast({
          title: "Voice Generation Issue",
          description: userMessage,
          variant: "destructive",
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

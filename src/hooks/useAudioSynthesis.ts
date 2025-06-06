import { useState, useCallback } from 'react';
import { synthesizeAudio, AudioSynthesisResult, AudioSynthesisConfig } from '@/utils/audioSynthesis';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  // Log TTS events
  const logTTSEvent = useCallback(async (
    event: 'attempt' | 'success' | 'failure' | 'fallback',
    details: any
  ) => {
    console.log(`[TTS ${event.toUpperCase()}]`, {
      timestamp: new Date().toISOString(),
      ...details
    });

    // Track in system health for admin monitoring
    try {
      await supabase.functions.invoke('track-system-health', {
        body: {
          metric_name: `tts_${event}`,
          metric_value: event === 'success' ? 1 : 0,
          metadata: details
        }
      });
    } catch (error) {
      console.error('Failed to log TTS event:', error);
    }
  }, []);

  const handleSynthesis = useCallback(async (text: string, overrideConfig?: AudioSynthesisConfig) => {
    if (!text.trim()) {
      const errorMsg = 'Text is required for synthesis';
      setError(errorMsg);
      await logTTSEvent('failure', { error: errorMsg, text_length: 0 });
      onError?.(new Error(errorMsg));
      return null;
    }

    // If voice support is disabled, skip synthesis
    if (!hasVoiceSupport && enableFallback) {
      console.log('Voice support disabled, skipping synthesis');
      await logTTSEvent('fallback', { reason: 'voice_support_disabled', text_length: text.length });
      return null;
    }

    setIsSynthesizing(true);
    setError(null);
    setSynthesisResult(null);

    try {
      console.log('Starting audio synthesis for text:', text.substring(0, 100) + '...');
      
      await logTTSEvent('attempt', { text_length: text.length });
      
      const result = await synthesizeAudio(text, { ...config, ...overrideConfig });
      
      console.log('Audio synthesis successful:', {
        voiceId: result.voiceId,
        characterCount: result.characterCount,
        audioSize: result.audioBlob.size
      });
      
      await logTTSEvent('success', {
        voice_id: result.voiceId,
        character_count: result.characterCount,
        audio_size: result.audioBlob.size,
        text_length: text.length
      });
      
      setSynthesisResult(result);
      onSynthesisComplete?.(result);
      
      return result;
    } catch (err) {
      console.error('Audio synthesis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Synthesis failed';
      setError(errorMessage);
      
      await logTTSEvent('failure', {
        error: errorMessage,
        text_length: text.length
      });
      
      // Handle different types of errors with graceful fallback
      let userMessage = 'Voice generation failed. Text response is available above.';
      let shouldDisableVoice = false;
      
      if (errorMessage.includes('TTS_SERVICE_UNAVAILABLE') || errorMessage.includes('TTS_SERVER_ERROR')) {
        userMessage = 'Voice is temporarily unavailable. The text response is shown above.';
        shouldDisableVoice = false; // Don't disable permanently for temporary issues
        await logTTSEvent('fallback', { reason: 'service_unavailable', text_length: text.length });
      } else if (errorMessage.includes('TTS_RATE_LIMIT')) {
        userMessage = 'Voice service is busy. The text response is available above.';
        shouldDisableVoice = false;
        await logTTSEvent('fallback', { reason: 'rate_limit', text_length: text.length });
      } else if (errorMessage.includes('TTS_AUTH_ERROR') || errorMessage.includes('TTS_AUTH_REQUIRED')) {
        userMessage = 'Voice service authentication failed. Using text-only mode.';
        shouldDisableVoice = true;
        await logTTSEvent('fallback', { reason: 'auth_error', text_length: text.length });
      } else if (errorMessage.includes('TTS_ALL_ATTEMPTS_FAILED')) {
        userMessage = 'Voice generation failed after multiple attempts. Text response is available above.';
        shouldDisableVoice = false;
        await logTTSEvent('fallback', { reason: 'all_attempts_failed', text_length: text.length });
      } else if (errorMessage.includes('TTS_TEXT_TOO_LONG')) {
        userMessage = 'Response too long for voice. Text response is available above.';
        shouldDisableVoice = false;
        await logTTSEvent('fallback', { reason: 'text_too_long', text_length: text.length });
      } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
        userMessage = 'Network issue detected. Voice temporarily disabled.';
        shouldDisableVoice = false;
        await logTTSEvent('fallback', { reason: 'network_error', text_length: text.length });
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
  }, [config, onSynthesisComplete, onError, toast, hasVoiceSupport, enableFallback, logTTSEvent]);

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

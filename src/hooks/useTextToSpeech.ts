
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_VOICE_ID, ELEVENLABS_MODEL, DEFAULT_VOICE_SETTINGS } from '@/utils/elevenLabsConfig';
import { useToast } from '@/hooks/use-toast';
import { useTTSUsageTracking } from '@/hooks/useTTSUsageTracking';
import { useAuth } from '@/components/SimpleAuthProvider';

interface UseTextToSpeechProps {
  text: string;
  autoPlay?: boolean;
  selectedVoice?: string;
}

export const useTextToSpeech = ({ text, autoPlay = false, selectedVoice = DEFAULT_VOICE_ID }: UseTextToSpeechProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  // Removed trial status - all users have full TTS access
  const { trackUsage, canUseToday } = useTTSUsageTracking();

  const generateSpeech = async (retryAttempt = 0) => {
    if (!text.trim()) {
      toast({
        title: "TTS Not Available",
        description: "No text provided.",
        variant: "destructive"
      });
      return;
    }

    // All users have unlimited TTS access - no checks needed

    try {
      setIsLoading(true);
      setError(null);

      // Track usage before generation
      const usageTracked = await trackUsage(text, selectedVoice);
      if (!usageTracked) {
        throw new Error('Usage tracking failed');
      }

      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text: text.trim(),
          voice_id: selectedVoice,
          model_id: ELEVENLABS_MODEL,
          voice_settings: DEFAULT_VOICE_SETTINGS
        }
      });

      if (error) throw error;

      if (data?.audio_url) {
        setAudioUrl(data.audio_url);
        setRetryCount(0);
        
        if (autoPlay) {
          setTimeout(() => handlePlay(), 100);
        }
      } else {
        throw new Error('No audio data received');
      }
    } catch (err) {
      console.error('TTS Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(errorMessage);
      
      if (retryAttempt < 2 && (errorMessage.includes('network') || errorMessage.includes('timeout'))) {
        console.log(`Retrying TTS generation, attempt ${retryAttempt + 1}`);
        setTimeout(() => generateSpeech(retryAttempt + 1), 1000 * (retryAttempt + 1));
        return;
      }
      
      setRetryCount(prev => prev + 1);
      toast({
        title: "Speech Generation Failed",
        description: retryCount < 2 ? "Retrying automatically..." : "Unable to generate audio. Text is available below.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    } else if (!audioUrl && !isLoading) {
      generateSpeech();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    setIsPlaying(false);
    setError('Audio playback failed');
    toast({
      title: "Playback Error",
      description: "Audio could not be played. Please try again.",
      variant: "destructive"
    });
  };

  const handleRetry = () => {
    setError(null);
    setAudioUrl(null);
    generateSpeech();
  };

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    isPlaying,
    isLoading,
    audioUrl,
    error,
    retryCount,
    audioRef,
    generateSpeech,
    handlePlay,
    handlePause,
    handleAudioEnd,
    handleAudioError,
    handleRetry
  };
};

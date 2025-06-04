
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, Loader2 } from 'lucide-react';
import { useElevenLabsConfig } from '@/hooks/useElevenLabsConfig';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_VOICE_ID, ELEVENLABS_MODEL, DEFAULT_VOICE_SETTINGS } from '@/utils/elevenLabsConfig';
import { useToast } from '@/hooks/use-toast';

interface TextToSpeechProps {
  text: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only';
  autoPlay?: boolean;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ 
  text, 
  className = '', 
  variant = 'default',
  autoPlay = false 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { config, loading: configLoading } = useElevenLabsConfig();
  const { toast } = useToast();

  const generateSpeech = async () => {
    if (!config.isConfigured || !text.trim()) {
      toast({
        title: "TTS Not Available",
        description: "ElevenLabs is not configured or no text provided.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: {
          text: text.trim(),
          voice_id: DEFAULT_VOICE_ID,
          model_id: ELEVENLABS_MODEL,
          voice_settings: DEFAULT_VOICE_SETTINGS
        }
      });

      if (error) throw error;

      if (data?.audio_url) {
        setAudioUrl(data.audio_url);
        // Auto-play if requested
        if (autoPlay) {
          setTimeout(() => handlePlay(), 100);
        }
      } else {
        throw new Error('No audio data received');
      }
    } catch (err) {
      console.error('TTS Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
      toast({
        title: "Speech Generation Failed",
        description: "Unable to generate audio. Please try again.",
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

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  if (configLoading || !config.isConfigured) {
    return null;
  }

  const renderButton = () => {
    if (variant === 'icon-only') {
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading || !text.trim()}
          className={`text-white hover:bg-white/10 ${className}`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
      );
    }

    if (variant === 'compact') {
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading || !text.trim()}
          className={`border-lumi-aquamarine/20 text-lumi-aquamarine hover:bg-lumi-aquamarine/10 ${className}`}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : isPlaying ? (
            <Pause className="w-3 h-3 mr-1" />
          ) : (
            <Volume2 className="w-3 h-3 mr-1" />
          )}
          {isLoading ? 'Generating...' : isPlaying ? 'Pause' : 'Listen'}
        </Button>
      );
    }

    return (
      <Button
        onClick={isPlaying ? handlePause : handlePlay}
        disabled={isLoading || !text.trim()}
        className={`bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white ${className}`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 mr-2" />
        ) : (
          <Volume2 className="w-4 h-4 mr-2" />
        )}
        {isLoading ? 'Generating Audio...' : isPlaying ? 'Pause Audio' : 'Listen to Response'}
      </Button>
    );
  };

  return (
    <div className="flex items-center space-x-2">
      {renderButton()}
      
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnd}
          onError={handleAudioError}
          preload="metadata"
        />
      )}
      
      {error && variant !== 'icon-only' && (
        <span className="text-red-400 text-xs">{error}</span>
      )}
    </div>
  );
};

export default TextToSpeech;

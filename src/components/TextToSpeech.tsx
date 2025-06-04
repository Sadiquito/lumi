
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Play, Loader2 } from 'lucide-react';
import { useElevenLabsConfig } from '@/hooks/useElevenLabsConfig';
import { supabase } from '@/integrations/supabase/client';
import { DEFAULT_VOICE_ID, ELEVENLABS_MODEL, DEFAULT_VOICE_SETTINGS } from '@/utils/elevenLabsConfig';
import { useToast } from '@/hooks/use-toast';
import { useTTSUsageTracking } from '@/hooks/useTTSUsageTracking';
import AudioProgress from './AudioProgress';
import AudioControls from './AudioControls';
import VoiceSelector from './VoiceSelector';
import TTSErrorBoundary from './TTSErrorBoundary';
import TTSTrialPreview from './TTSTrialPreview';
import { useAuth } from './AuthProvider';

interface TextToSpeechProps {
  text: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only' | 'enhanced';
  autoPlay?: boolean;
  showVoiceSelector?: boolean;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ 
  text, 
  className = '', 
  variant = 'default',
  autoPlay = false,
  showVoiceSelector = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<string>(DEFAULT_VOICE_ID);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { config, loading: configLoading } = useElevenLabsConfig();
  const { toast } = useToast();
  const { trialStatus } = useAuth();
  const { trackUsage, canUseToday, getRemainingUsage } = useTTSUsageTracking();

  const generateSpeech = async (retryAttempt = 0) => {
    if (!config.isConfigured || !text.trim()) {
      toast({
        title: "TTS Not Available",
        description: "ElevenLabs is not configured or no text provided.",
        variant: "destructive"
      });
      return;
    }

    // Check trial limits before generation
    if (!trialStatus.canUseTTS) {
      toast({
        title: "TTS Access Required",
        description: "Voice responses require premium access or active trial.",
        variant: "destructive"
      });
      return;
    }

    if (!trialStatus.hasPremiumAccess && !canUseToday()) {
      const remaining = getRemainingUsage();
      toast({
        title: "Daily Limit Reached",
        description: `You've used all ${remaining.daily} voice responses today. Upgrade for unlimited access.`,
        variant: "destructive"
      });
      return;
    }

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

  if (configLoading || !config.isConfigured) {
    return null;
  }

  // Show trial preview for users without TTS access
  if (!trialStatus.canUseTTS) {
    return <TTSTrialPreview text={text} className={className} />;
  }

  // Show trial preview for trial users who have reached daily limit
  if (!trialStatus.hasPremiumAccess && !canUseToday()) {
    return <TTSTrialPreview text={text} className={className} />;
  }

  const renderEnhancedVersion = () => (
    <TTSErrorBoundary fallbackText={text} onRetry={handleRetry}>
      <div className="space-y-4 p-4 bg-lumi-charcoal/40 rounded-lg border border-lumi-sunset-coral/20">
        {showVoiceSelector && trialStatus.canUseTTS && (
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            disabled={isLoading || isPlaying}
          />
        )}
        
        <div className="flex items-center justify-between">
          <AudioControls
            audioRef={audioRef}
            isPlaying={isPlaying}
            onPlay={handlePlay}
            onPause={handlePause}
            disabled={isLoading || !text.trim()}
            className="flex-1"
          />
          
          {isLoading && (
            <div className="flex items-center space-x-2 text-lumi-aquamarine">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating...</span>
            </div>
          )}
        </div>

        {audioUrl && (
          <AudioProgress audioRef={audioRef} className="mt-2" />
        )}

        {error && (
          <div className="flex items-center justify-between p-2 bg-red-500/10 rounded border border-red-500/20">
            <span className="text-red-400 text-sm">{error}</span>
            <Button
              onClick={handleRetry}
              size="sm"
              variant="outline"
              className="border-red-400/30 text-red-400 hover:bg-red-400/10"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </TTSErrorBoundary>
  );

  if (variant === 'enhanced') {
    return renderEnhancedVersion();
  }

  if (variant === 'icon-only') {
    return (
      <TTSErrorBoundary onRetry={handleRetry}>
        <Button
          variant="ghost"
          size="icon"
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading || !text.trim()}
          className={`text-white hover:bg-white/10 ${className}`}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : error ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnd}
            onError={handleAudioError}
            preload="metadata"
          />
        )}
      </TTSErrorBoundary>
    );
  }

  if (variant === 'compact') {
    return (
      <TTSErrorBoundary onRetry={handleRetry}>
        <div className="flex items-center space-x-2">
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
            ) : error ? (
              <VolumeX className="w-3 h-3 mr-1 text-red-400" />
            ) : (
              <Volume2 className="w-3 h-3 mr-1" />
            )}
            {isLoading ? 'Generating...' : isPlaying ? 'Pause' : error ? 'Retry' : 'Listen'}
          </Button>
          
          {audioUrl && isPlaying && (
            <AudioProgress audioRef={audioRef} className="w-16" />
          )}
        </div>
        
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnd}
            onError={handleAudioError}
            preload="metadata"
          />
        )}
      </TTSErrorBoundary>
    );
  }

  return (
    <TTSErrorBoundary fallbackText={text} onRetry={handleRetry}>
      <div className="flex items-center space-x-2">
        <Button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={isLoading || !text.trim()}
          className={`bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white ${className}`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 mr-2" />
          ) : error ? (
            <VolumeX className="w-4 h-4 mr-2 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 mr-2" />
          )}
          {isLoading ? 'Generating Audio...' : isPlaying ? 'Pause Audio' : error ? 'Retry Audio' : 'Listen to Response'}
        </Button>
        
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={handleAudioEnd}
            onError={handleAudioError}
            preload="metadata"
          />
        )}
        
        {error && (
          <span className="text-red-400 text-xs">{error}</span>
        )}
      </div>
    </TTSErrorBoundary>
  );
};

export default TextToSpeech;

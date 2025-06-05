
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Loader2 } from 'lucide-react';
import TTSErrorBoundary from './TTSErrorBoundary';

interface TTSIconOnlyVariantProps {
  text: string;
  isLoading: boolean;
  isPlaying: boolean;
  audioUrl: string | null;
  error: string | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  onPlay: () => void;
  onPause: () => void;
  onRetry: () => void;
  onAudioEnd: () => void;
  onAudioError: () => void;
  className?: string;
}

const TTSIconOnlyVariant: React.FC<TTSIconOnlyVariantProps> = ({
  text,
  isLoading,
  isPlaying,
  audioUrl,
  error,
  audioRef,
  onPlay,
  onPause,
  onRetry,
  onAudioEnd,
  onAudioError,
  className = ''
}) => {
  return (
    <TTSErrorBoundary onRetry={onRetry}>
      <Button
        variant="ghost"
        size="icon"
        onClick={isPlaying ? onPause : onPlay}
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
          onEnded={onAudioEnd}
          onError={onAudioError}
          preload="metadata"
        />
      )}
    </TTSErrorBoundary>
  );
};

export default TTSIconOnlyVariant;

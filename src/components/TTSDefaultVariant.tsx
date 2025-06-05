
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Loader2 } from 'lucide-react';
import TTSErrorBoundary from './TTSErrorBoundary';

interface TTSDefaultVariantProps {
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

const TTSDefaultVariant: React.FC<TTSDefaultVariantProps> = ({
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
    <TTSErrorBoundary fallbackText={text} onRetry={onRetry}>
      <div className="flex items-center space-x-2">
        <Button
          onClick={isPlaying ? onPause : onPlay}
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
            onEnded={onAudioEnd}
            onError={onAudioError}
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

export default TTSDefaultVariant;

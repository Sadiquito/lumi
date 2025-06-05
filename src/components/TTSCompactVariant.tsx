
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Pause, Loader2 } from 'lucide-react';
import TTSErrorBoundary from './TTSErrorBoundary';
import AudioProgress from './AudioProgress';

interface TTSCompactVariantProps {
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

const TTSCompactVariant: React.FC<TTSCompactVariantProps> = ({
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
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={isPlaying ? onPause : onPlay}
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
          onEnded={onAudioEnd}
          onError={onAudioError}
          preload="metadata"
        />
      )}
    </TTSErrorBoundary>
  );
};

export default TTSCompactVariant;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import TTSErrorBoundary from './TTSErrorBoundary';
import AudioControls from './AudioControls';
import AudioProgress from './AudioProgress';
import VoiceSelector from './VoiceSelector';

interface TTSEnhancedVariantProps {
  text: string;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
  isLoading: boolean;
  isPlaying: boolean;
  audioUrl: string | null;
  error: string | null;
  audioRef: React.RefObject<HTMLAudioElement>;
  onPlay: () => void;
  onPause: () => void;
  onRetry: () => void;
  showVoiceSelector?: boolean;
  className?: string;
}

const TTSEnhancedVariant: React.FC<TTSEnhancedVariantProps> = ({
  text,
  selectedVoice,
  onVoiceChange,
  isLoading,
  isPlaying,
  audioUrl,
  error,
  audioRef,
  onPlay,
  onPause,
  onRetry,
  showVoiceSelector = false,
  className = ''
}) => {
  const { trialStatus } = useAuth();

  return (
    <TTSErrorBoundary fallbackText={text} onRetry={onRetry}>
      <div className={`space-y-4 p-4 bg-lumi-charcoal/40 rounded-lg border border-lumi-sunset-coral/20 ${className}`}>
        {showVoiceSelector && trialStatus.canUseTTS && (
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={onVoiceChange}
            disabled={isLoading || isPlaying}
          />
        )}
        
        <div className="flex items-center justify-between">
          <AudioControls
            audioRef={audioRef}
            isPlaying={isPlaying}
            onPlay={onPlay}
            onPause={onPause}
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
              onClick={onRetry}
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
};

export default TTSEnhancedVariant;

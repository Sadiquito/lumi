
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Square } from 'lucide-react';

interface AudioRecordingListeningStateProps {
  audioLevel: number;
  duration: number;
  onPause: () => void;
  onStop: () => void;
}

const AudioRecordingListeningState: React.FC<AudioRecordingListeningStateProps> = ({
  audioLevel,
  duration,
  onPause,
  onStop
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="text-center space-y-4">
      {/* Audio Level Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>audio level:</span>
          <span>{formatDuration(duration)}</span>
        </div>
        <div className="w-full bg-lumi-charcoal rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-lumi-aquamarine to-lumi-sunset-coral h-3 rounded-full transition-all duration-100"
            style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
          />
        </div>
      </div>

      <p className="text-white text-lg font-medium">
        🎤 Listening... Speak your mind
      </p>

      <div className="flex justify-center space-x-3">
        <Button
          onClick={onPause}
          variant="outline"
          className="border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
        >
          <Pause className="w-4 h-4 mr-2" />
          Pause
        </Button>
        <Button
          onClick={onStop}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop & Send
        </Button>
      </div>
    </div>
  );
};

export default AudioRecordingListeningState;

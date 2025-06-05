
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pause, Square, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import MicrophoneLevelIndicator from './MicrophoneLevelIndicator';
import WaveformIndicator from './WaveformIndicator';

interface AudioRecordingListeningStateProps {
  audioLevel: number;
  duration: number;
  onPause: () => void;
  onStop: () => void;
  audioQuality?: 'good' | 'low' | 'poor';
  maxDuration?: number;
}

const AudioRecordingListeningState: React.FC<AudioRecordingListeningStateProps> = ({
  audioLevel,
  duration,
  onPause,
  onStop,
  audioQuality = 'good',
  maxDuration
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good': return 'text-green-400';
      case 'low': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getQualityMessage = (quality: string) => {
    switch (quality) {
      case 'good': return 'Good audio quality';
      case 'low': return 'Low audio - speak louder';
      case 'poor': return 'Poor audio - check microphone';
      default: return 'Checking audio quality...';
    }
  };

  const isNearLimit = maxDuration && duration > maxDuration * 0.8;
  const timeRemaining = maxDuration ? maxDuration - duration : null;

  return (
    <div className="text-center space-y-4">
      {/* Waveform Visualization */}
      <div className="flex justify-center">
        <WaveformIndicator 
          isActive={audioLevel > 0.1} 
          barCount={7}
          color="aquamarine"
          className="mb-2"
        />
      </div>

      {/* Audio Quality Status */}
      <div className="flex items-center justify-center space-x-2">
        {audioQuality === 'poor' && <AlertTriangle className="w-4 h-4 text-red-400" />}
        <Badge 
          variant="outline" 
          className={`${
            audioQuality === 'good' 
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : audioQuality === 'low'
              ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              : 'bg-red-500/20 text-red-400 border-red-500/30'
          }`}
        >
          {getQualityMessage(audioQuality)}
        </Badge>
      </div>

      {/* Audio Level Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>audio level:</span>
          <div className="flex items-center space-x-2">
            <span>{formatDuration(duration)}</span>
            {timeRemaining !== null && timeRemaining <= 10 && (
              <span className="text-red-400 font-medium">
                -{formatDuration(timeRemaining)}
              </span>
            )}
          </div>
        </div>
        <MicrophoneLevelIndicator
          level={audioLevel}
          isActive={true}
          showIcon={false}
          size="md"
        />
      </div>

      <p className="text-white text-lg font-medium">
        🎤 Listening... Speak your mind
      </p>

      {/* Duration Warning */}
      {isNearLimit && (
        <div className="text-yellow-400 text-sm">
          ⚠️ Approaching time limit - consider stopping soon
        </div>
      )}

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
          className={`${
            audioQuality === 'poor' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-500 hover:bg-red-600'
          } text-white`}
        >
          <Square className="w-4 h-4 mr-2" />
          {audioQuality === 'poor' ? 'Stop (Low Quality)' : 'Stop & Send'}
        </Button>
      </div>
    </div>
  );
};

export default AudioRecordingListeningState;


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Smartphone, 
  Headphones,
  AlertTriangle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileAudioControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  maxDuration?: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  disabled?: boolean;
  className?: string;
}

const MobileAudioControls: React.FC<MobileAudioControlsProps> = ({
  isRecording,
  isPaused,
  duration,
  audioLevel,
  maxDuration,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  disabled = false,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [hasHeadphones, setHasHeadphones] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Detect headphones (basic check)
  useEffect(() => {
    const checkAudioOutputs = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
          setHasHeadphones(audioOutputs.length > 1); // More than just default speaker
        }
      } catch (error) {
        console.log('Could not detect audio devices:', error);
      }
    };

    checkAudioOutputs();
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!maxDuration) return 0;
    return Math.min((duration / maxDuration) * 100, 100);
  };

  const isNearLimit = maxDuration && duration > maxDuration * 0.8;
  const isAtLimit = maxDuration && duration >= maxDuration;

  return (
    <Card className={cn("bg-lumi-charcoal/90 backdrop-blur-sm border-lumi-sunset-coral/20", className)}>
      <CardContent className="p-4 space-y-4">
        {/* Mobile indicator and tips */}
        {isMobile && (
          <div className="flex items-center justify-between text-xs text-white/60">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-3 h-3" />
              <span>Mobile optimized</span>
            </div>
            {!hasHeadphones && (
              <div className="flex items-center space-x-1 text-yellow-400">
                <Headphones className="w-3 h-3" />
                <span>Use headphones for best quality</span>
              </div>
            )}
          </div>
        )}

        {/* Audio level visualization for mobile */}
        {isRecording && !isPaused && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>Audio level</span>
              <span>{Math.round(audioLevel * 100)}%</span>
            </div>
            <div className="w-full bg-lumi-deep-space/40 rounded-full h-2">
              <div 
                className={cn(
                  "h-2 rounded-full transition-all duration-100",
                  audioLevel > 0.7 ? "bg-green-400" :
                  audioLevel > 0.3 ? "bg-yellow-400" : "bg-red-400"
                )}
                style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Duration and progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-medium">
              {formatDuration(duration)}
            </span>
            {maxDuration && (
              <div className="flex items-center space-x-2">
                {isNearLimit && (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                )}
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    isAtLimit ? "border-red-400 text-red-400" :
                    isNearLimit ? "border-yellow-400 text-yellow-400" :
                    "border-white/30 text-white/70"
                  )}
                >
                  max: {formatDuration(maxDuration)}
                </Badge>
              </div>
            )}
          </div>
          
          {maxDuration && (
            <div className="w-full bg-lumi-deep-space/40 rounded-full h-1">
              <div 
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  isAtLimit ? "bg-red-400" :
                  isNearLimit ? "bg-yellow-400" : "bg-lumi-aquamarine"
                )}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          )}
        </div>

        {/* Mobile-optimized controls */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording ? (
            <Button
              onClick={onStartRecording}
              disabled={disabled}
              size={isMobile ? "lg" : "default"}
              className={cn(
                "bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white",
                isMobile && "min-h-[56px] min-w-[56px] rounded-full"
              )}
              aria-label="Start recording"
            >
              <Mic className={cn("w-5 h-5", isMobile && "w-6 h-6")} />
              {!isMobile && <span className="ml-2">Start Recording</span>}
            </Button>
          ) : (
            <div className="flex items-center space-x-3">
              <Button
                onClick={isPaused ? onResumeRecording : onPauseRecording}
                size={isMobile ? "lg" : "default"}
                variant="outline"
                className={cn(
                  "border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10",
                  isMobile && "min-h-[48px] min-w-[48px] rounded-full"
                )}
                aria-label={isPaused ? "Resume recording" : "Pause recording"}
              >
                {isPaused ? (
                  <Play className={cn("w-4 h-4", isMobile && "w-5 h-5")} />
                ) : (
                  <Pause className={cn("w-4 h-4", isMobile && "w-5 h-5")} />
                )}
              </Button>
              
              <Button
                onClick={onStopRecording}
                size={isMobile ? "lg" : "default"}
                className={cn(
                  "bg-red-500 hover:bg-red-600 text-white",
                  isMobile && "min-h-[48px] min-w-[48px] rounded-full"
                )}
                aria-label="Stop recording"
              >
                <Square className={cn("w-4 h-4", isMobile && "w-5 h-5")} />
                {!isMobile && <span className="ml-2">Stop</span>}
              </Button>
            </div>
          )}
        </div>

        {/* Accessibility hints for mobile */}
        {isMobile && (
          <div className="text-xs text-white/50 text-center space-y-1">
            <p>Tap and hold for continuous recording</p>
            <p>Ensure microphone permissions are enabled</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileAudioControls;

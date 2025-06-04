
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  AlertTriangle, 
  Clock,
  Volume2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAuth } from '@/components/AuthProvider';

interface AudioRecordingFeatureProps {
  onTranscriptionComplete?: (transcript: string) => void;
  disabled?: boolean;
  maxDuration?: number;
}

const AudioRecordingFeature: React.FC<AudioRecordingFeatureProps> = ({
  onTranscriptionComplete,
  disabled = false,
  maxDuration
}) => {
  const { toast } = useToast();
  const { trialStatus } = useAuth();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const {
    state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    requestPermission,
    isSupported,
    audioLevel,
    duration
  } = useAudioRecorder({
    maxDuration,
    onRecordingComplete: (blob) => {
      setRecordedBlob(blob);
      handleTranscription(blob);
    },
    onError: (error) => {
      toast({
        title: "Recording error",
        description: error,
        variant: "destructive",
      });
    }
  });

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    
    try {
      // Simulate transcription for now
      // In a real implementation, this would send to Whisper API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTranscript = "This is a sample transcription from your voice recording. The WebRTC audio capture is now working with real microphone input.";
      
      onTranscriptionComplete?.(mockTranscript);
      
      toast({
        title: "Transcription complete",
        description: "Your audio has been transcribed successfully.",
      });
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "Could not transcribe your audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
      setRecordedBlob(null);
    }
  };

  const handleStartRecording = async () => {
    if (!state.hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        toast({
          title: "Permission required",
          description: "Please allow microphone access to record audio.",
          variant: "destructive",
        });
        return;
      }
    }

    const started = await startRecording();
    if (started) {
      toast({
        title: "Recording started",
        description: trialStatus.hasPremiumAccess 
          ? "Recording in progress..."
          : "Recording started (60 second limit for trial users)",
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMaxDurationDisplay = () => {
    const limit = maxDuration || (trialStatus.hasPremiumAccess ? undefined : 60);
    return limit ? formatDuration(limit) : '∞';
  };

  if (!isSupported) {
    return (
      <Alert className="bg-red-500/20 border-red-500/30">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-white">
          Audio recording is not supported in this browser. Please try using Chrome, Firefox, or Safari.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Mic className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            voice recording
          </div>
          <div className="flex items-center space-x-2">
            {state.isRecording && (
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                REC
              </Badge>
            )}
            <Badge variant="outline" className="bg-lumi-deep-space/30 text-white/70 border-lumi-sunset-coral/20">
              max: {getMaxDurationDisplay()}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission Alert */}
        {!state.hasPermission && !state.error && (
          <Alert className="bg-lumi-sunset-coral/20 border-lumi-sunset-coral/30">
            <Mic className="h-4 w-4 text-lumi-sunset-coral" />
            <AlertDescription className="text-white">
              Microphone access is required for voice recording.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {state.error && (
          <Alert className="bg-red-500/20 border-red-500/30">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-white">
              {state.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Audio Level Indicator */}
        {state.isRecording && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>audio level:</span>
              <span>{formatDuration(duration)}</span>
            </div>
            <div className="w-full bg-lumi-charcoal rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-lumi-aquamarine to-lumi-sunset-coral h-2 rounded-full transition-all duration-100"
                style={{ width: `${Math.min(100, audioLevel * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div className="text-center">
          <p className="text-white/70 text-sm mb-4">
            {state.isRecording 
              ? "Recording your voice..." 
              : isTranscribing 
                ? "Transcribing your audio..."
                : "Record your thoughts - transcription is always available"
            }
          </p>
          
          <div className="flex justify-center space-x-3">
            {!state.isRecording && !isTranscribing ? (
              <Button
                onClick={handleStartRecording}
                disabled={disabled}
                className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : state.isRecording && !state.isPaused ? (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  className="border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            ) : state.isPaused ? (
              <>
                <Button
                  onClick={resumeRecording}
                  className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
                <Button
                  onClick={stopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </>
            ) : (
              <Button disabled className="bg-lumi-charcoal text-white/50">
                <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                Processing...
              </Button>
            )}
          </div>
        </div>

        {/* Recording Info */}
        {(state.isRecording || state.isPaused) && (
          <div className="pt-2 border-t border-lumi-sunset-coral/10">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Duration: {formatDuration(duration)}</span>
              <span>
                {state.isPaused ? "Paused" : "Recording..."}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioRecordingFeature;

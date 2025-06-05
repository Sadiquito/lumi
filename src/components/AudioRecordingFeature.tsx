
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Mic, AlertTriangle } from 'lucide-react';
import { useAudioRecordingFeature } from '@/hooks/useAudioRecordingFeature';
import ConversationStateIndicator from './ConversationStateIndicator';
import AudioRecordingSpeakingState from './AudioRecordingSpeakingState';
import AudioRecordingProcessingState from './AudioRecordingProcessingState';
import AudioRecordingListeningState from './AudioRecordingListeningState';
import AudioRecordingIdleState from './AudioRecordingIdleState';

interface AudioRecordingFeatureProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  disabled?: boolean;
  maxDuration?: number;
}

const AudioRecordingFeature: React.FC<AudioRecordingFeatureProps> = ({
  onTranscriptionComplete,
  onAIResponse,
  disabled = false,
  maxDuration
}) => {
  const {
    conversationState,
    isTranscribing,
    aiResponse,
    transcriptionProgress,
    thinkingProgress,
    isSupported,
    state,
    audioLevel,
    duration,
    trialStatus,
    isIdle,
    isListening,
    isProcessing,
    isSpeaking,
    handleStartRecording,
    handleStopRecording,
    pauseRecording,
    resumeRecording,
    getStateDuration
  } = useAudioRecordingFeature({
    onTranscriptionComplete,
    onAIResponse,
    disabled,
    maxDuration
  });

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
    <div className="space-y-4">
      {/* Conversation State Indicator */}
      <ConversationStateIndicator
        state={conversationState}
        duration={getStateDuration()}
      />

      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Mic className="w-5 h-5 mr-2 text-lumi-aquamarine" />
              voice conversation
            </div>
            <div className="flex items-center space-x-2">
              {isListening && (
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
        <CardContent className="space-y-6">
          {/* Permission Alert */}
          {!state.hasPermission && !state.error && (
            <Alert className="bg-lumi-sunset-coral/20 border-lumi-sunset-coral/30">
              <Mic className="h-4 w-4 text-lumi-sunset-coral" />
              <AlertDescription className="text-white">
                Microphone access is required for voice conversation.
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

          {/* Lumi is Speaking State */}
          {isSpeaking && (
            <AudioRecordingSpeakingState aiResponse={aiResponse} />
          )}

          {/* Processing State */}
          {isProcessing && (
            <AudioRecordingProcessingState
              isTranscribing={isTranscribing}
              transcriptionProgress={transcriptionProgress}
              thinkingProgress={thinkingProgress}
            />
          )}

          {/* Your Turn to Speak State */}
          {(isIdle || isListening) && !isProcessing && !isSpeaking && (
            <>
              {isListening ? (
                <AudioRecordingListeningState
                  audioLevel={audioLevel}
                  duration={duration}
                  onPause={pauseRecording}
                  onStop={handleStopRecording}
                />
              ) : (
                <AudioRecordingIdleState
                  disabled={disabled}
                  onStartRecording={handleStartRecording}
                />
              )}
            </>
          )}

          {/* Recording Info */}
          {(isListening || state.isPaused) && (
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
    </div>
  );
};

export default AudioRecordingFeature;

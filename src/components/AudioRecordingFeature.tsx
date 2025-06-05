
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, AlertTriangle, Send, Keyboard } from 'lucide-react';
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
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [isSubmittingText, setIsSubmittingText] = useState(false);

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
    audioQuality,
    networkStatus,
    retryCount,
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
    maxDuration,
    onFallbackToText: () => setShowTextFallback(true)
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

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    
    setIsSubmittingText(true);
    try {
      // Simulate processing text input
      onTranscriptionComplete?.(textInput);
      
      // Generate AI response (this would typically call the same AI service)
      const mockResponse = `Thank you for sharing that with me. Based on what you've written about "${textInput.slice(0, 50)}...", I'd like to explore this further with you.`;
      
      setTimeout(() => {
        onAIResponse?.(mockResponse);
        setTextInput('');
        setShowTextFallback(false);
        setIsSubmittingText(false);
      }, 2000);
      
    } catch (error) {
      setIsSubmittingText(false);
      console.error('Text processing error:', error);
    }
  };

  if (!isSupported) {
    return (
      <Alert className="bg-red-500/20 border-red-500/30">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-white">
          Audio recording is not supported in this browser. Please use the text input below or try using Chrome, Firefox, or Safari.
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
              {showTextFallback ? (
                <Keyboard className="w-5 h-5 mr-2 text-lumi-sunset-coral" />
              ) : (
                <Mic className="w-5 h-5 mr-2 text-lumi-aquamarine" />
              )}
              {showTextFallback ? 'text conversation' : 'voice conversation'}
            </div>
            <div className="flex items-center space-x-2">
              {networkStatus === 'offline' && (
                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                  Offline
                </Badge>
              )}
              {isListening && (
                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1"></div>
                  REC
                </Badge>
              )}
              {retryCount > 0 && (
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Retry {retryCount}
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
          {!showTextFallback && !state.hasPermission && !state.error && (
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

          {/* Text Fallback Input */}
          {showTextFallback && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-lg font-medium">Text Input</h3>
                <Button
                  onClick={() => setShowTextFallback(false)}
                  variant="outline"
                  size="sm"
                  className="border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
                  disabled={!isSupported || networkStatus === 'offline'}
                >
                  <Mic className="w-4 h-4 mr-1" />
                  Try Voice
                </Button>
              </div>
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Type your message here..."
                className="bg-lumi-deep-space/40 border-lumi-sunset-coral/20 text-white placeholder-white/50 min-h-[100px]"
                disabled={isSubmittingText}
              />
              <Button
                onClick={handleTextSubmit}
                disabled={!textInput.trim() || isSubmittingText}
                className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmittingText ? 'Processing...' : 'Send Message'}
              </Button>
            </div>
          )}

          {/* Voice Interface States */}
          {!showTextFallback && (
            <>
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
                      audioQuality={audioQuality}
                      maxDuration={maxDuration || (trialStatus.hasPremiumAccess ? undefined : 60)}
                    />
                  ) : (
                    <AudioRecordingIdleState
                      disabled={disabled}
                      onStartRecording={handleStartRecording}
                      onFallbackToText={() => setShowTextFallback(true)}
                      networkStatus={networkStatus}
                      isSupported={isSupported}
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* Recording Info */}
          {(isListening || state.isPaused) && !showTextFallback && (
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

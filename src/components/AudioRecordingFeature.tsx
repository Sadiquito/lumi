
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  AlertTriangle, 
  Clock,
  Volume2,
  Loader2,
  Brain,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAuth } from '@/components/AuthProvider';
import { useConversationState } from '@/hooks/useConversationState';
import ConversationStateIndicator from './ConversationStateIndicator';
import TextToSpeech from './TextToSpeech';

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
  const { toast } = useToast();
  const { trialStatus } = useAuth();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [thinkingProgress, setThinkingProgress] = useState(0);

  const {
    state: conversationState,
    startListening,
    startProcessing,
    startSpeaking,
    goIdle,
    addMessage,
    getStateDuration,
    isIdle,
    isListening,
    isProcessing,
    isSpeaking
  } = useConversationState({
    onStateChange: (newState, previousState) => {
      console.log(`Conversation state: ${previousState} → ${newState}`);
    },
    onTimeout: (state) => {
      console.log(`State timeout: ${state}`);
      toast({
        title: "Session timeout",
        description: "The conversation has timed out due to inactivity.",
      });
    }
  });

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
      startProcessing();
      handleTranscription(blob);
    },
    onError: (error) => {
      toast({
        title: "Recording error",
        description: error,
        variant: "destructive",
      });
      goIdle();
    }
  });

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionProgress(0);
    
    try {
      // Simulate transcription progress
      const progressInterval = setInterval(() => {
        setTranscriptionProgress(prev => Math.min(prev + 10, 70));
      }, 200);

      // Simulate transcription for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearInterval(progressInterval);
      setTranscriptionProgress(100);
      
      const mockTranscript = "This is a sample transcription from your voice recording. The WebRTC audio capture is now working with real microphone input.";
      
      // Add user message to conversation
      addMessage({
        content: mockTranscript,
        speaker: 'user',
        type: 'audio',
        metadata: {
          duration: duration,
          audioUrl: URL.createObjectURL(audioBlob)
        }
      });

      onTranscriptionComplete?.(mockTranscript);
      
      // Start AI thinking process
      await handleAIThinking(mockTranscript);
      
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: "Could not transcribe your audio. Please try again.",
        variant: "destructive",
      });
      goIdle();
    } finally {
      setIsTranscribing(false);
      setTranscriptionProgress(0);
      setRecordedBlob(null);
    }
  };

  const handleAIThinking = async (userInput: string) => {
    setThinkingProgress(0);
    
    try {
      // Simulate AI thinking progress
      const thinkingInterval = setInterval(() => {
        setThinkingProgress(prev => Math.min(prev + 5, 90));
      }, 100);

      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      clearInterval(thinkingInterval);
      setThinkingProgress(100);

      const mockResponse = `Thank you for sharing that with me. I can hear the thoughtfulness in your voice. Based on what you've said about "${userInput.slice(0, 50)}...", I think there's a lot to explore here. What aspect of this situation feels most important to you right now?`;
      
      setAiResponse(mockResponse);
      
      // Add AI message to conversation
      addMessage({
        content: mockResponse,
        speaker: 'ai',
        type: 'text'
      });

      startSpeaking();
      onAIResponse?.(mockResponse);
      
    } catch (error) {
      toast({
        title: "AI processing failed",
        description: "Could not generate response. Please try again.",
        variant: "destructive",
      });
      goIdle();
    } finally {
      setThinkingProgress(0);
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
      startListening();
      toast({
        title: "Recording started",
        description: trialStatus.hasPremiumAccess 
          ? "Recording in progress..."
          : "Recording started (60 second limit for trial users)",
      });
    }
  };

  const handleStopRecording = () => {
    stopRecording();
    // Processing state will be set in onRecordingComplete callback
  };

  // Handle speech completion by listening for when TTS finishes
  useEffect(() => {
    if (isSpeaking && aiResponse) {
      // Set a timeout to transition back to idle after TTS should be complete
      // This is a simple approach - in a real app you'd want to listen to actual TTS events
      const estimatedDuration = aiResponse.length * 50; // Rough estimate: 50ms per character
      const timeout = setTimeout(() => {
        setAiResponse('');
        goIdle();
      }, Math.max(estimatedDuration, 3000)); // Minimum 3 seconds

      return () => clearTimeout(timeout);
    }
  }, [isSpeaking, aiResponse, goIdle]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMaxDurationDisplay = () => {
    const limit = maxDuration || (trialStatus.hasPremiumAccess ? undefined : 60);
    return limit ? formatDuration(limit) : '∞';
  };

  const renderWaveformAnimation = () => (
    <div className="flex items-center justify-center space-x-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-lumi-aquamarine rounded-full animate-pulse"
          style={{
            height: `${20 + Math.random() * 20}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );

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
            <div className="text-center space-y-4 p-6 bg-lumi-deep-space/20 rounded-lg border border-lumi-aquamarine/20">
              <div className="flex items-center justify-center space-x-3">
                <Volume2 className="w-6 h-6 text-lumi-aquamarine" />
                <span className="text-white text-lg font-medium">Lumi is responding...</span>
              </div>
              {renderWaveformAnimation()}
              
              {aiResponse && (
                <div className="mt-4">
                  <TextToSpeech
                    text={aiResponse}
                    variant="enhanced"
                    autoPlay={true}
                  />
                </div>
              )}
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="text-center space-y-4 p-6 bg-lumi-deep-space/20 rounded-lg border border-lumi-sunset-coral/20">
              {isTranscribing ? (
                <>
                  <div className="flex items-center justify-center space-x-3">
                    <MessageSquare className="w-6 h-6 text-lumi-sunset-coral animate-pulse" />
                    <span className="text-white text-lg font-medium">Transcribing your message...</span>
                  </div>
                  <Progress value={transcriptionProgress} className="w-full" />
                  <p className="text-white/70 text-sm">{transcriptionProgress}% complete</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center space-x-3">
                    <Brain className="w-6 h-6 text-lumi-sunset-coral animate-pulse" />
                    <span className="text-white text-lg font-medium">Lumi is thinking...</span>
                  </div>
                  <Progress value={thinkingProgress} className="w-full" />
                  <p className="text-white/70 text-sm">Processing your thoughts...</p>
                </>
              )}
            </div>
          )}

          {/* Your Turn to Speak State */}
          {(isIdle || isListening) && !isProcessing && !isSpeaking && (
            <div className="text-center space-y-4">
              {isListening ? (
                <>
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
                      onClick={pauseRecording}
                      variant="outline"
                      className="border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                    <Button
                      onClick={handleStopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop & Send
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-white/70 text-lg mb-6">
                    💭 Your turn to speak
                  </p>
                  
                  <Button
                    onClick={handleStartRecording}
                    disabled={disabled}
                    size="lg"
                    className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-6 px-8 text-xl rounded-full"
                  >
                    <Mic className="w-6 h-6 mr-3" />
                    Tap to speak
                  </Button>
                  
                  <p className="text-white/60 text-sm">
                    Press and speak your thoughts naturally
                  </p>
                </>
              )}
            </div>
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


import React, { useState, useCallback } from 'react';
import { useAudioRecorder, AudioChunk } from '@/hooks/useAudioRecorder';
import { encodeAudioForTransmission } from '@/utils/audioUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface AudioRecorderProps {
  onAudioData?: (encodedAudio: string, isSpeech: boolean) => void;
  onConversationStateChange?: (state: 'idle' | 'listening' | 'speaking') => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioData,
  onConversationStateChange,
}) => {
  const [conversationState, setConversationState] = useState<'idle' | 'listening' | 'speaking'>('idle');

  const handleAudioChunk = useCallback((chunk: AudioChunk) => {
    console.log('Audio chunk received:', {
      timestamp: chunk.timestamp,
      isSpeech: chunk.isSpeech,
      dataLength: chunk.data.length,
      rms: Math.sqrt(chunk.data.reduce((sum, val) => sum + val * val, 0) / chunk.data.length)
    });

    // Encode audio for transmission
    const encodedAudio = encodeAudioForTransmission(chunk.data);
    onAudioData?.(encodedAudio, chunk.isSpeech);
  }, [onAudioData]);

  const handleSpeechStart = useCallback(() => {
    console.log('Speech started');
    setConversationState('speaking');
    onConversationStateChange?.('speaking');
  }, [onConversationStateChange]);

  const handleSpeechEnd = useCallback(() => {
    console.log('Speech ended');
    setConversationState('listening');
    onConversationStateChange?.('listening');
  }, [onConversationStateChange]);

  const {
    isRecording,
    isSpeaking,
    error,
    startRecording,
    stopRecording,
  } = useAudioRecorder({
    onAudioChunk: handleAudioChunk,
    onSpeechStart: handleSpeechStart,
    onSpeechEnd: handleSpeechEnd,
    config: {
      vadThreshold: 0.01, // Adjust sensitivity as needed
      silenceDuration: 1000, // 1 second of silence before considering speech ended
    }
  });

  const handleToggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      setConversationState('idle');
      onConversationStateChange?.('idle');
    } else {
      await startRecording();
      setConversationState('listening');
      onConversationStateChange?.('listening');
    }
  };

  const getStatusText = () => {
    if (!isRecording) return 'Ready to start conversation';
    if (isSpeaking) return 'You are speaking...';
    return 'Listening...';
  };

  const getStatusColor = () => {
    if (!isRecording) return 'text-gray-600';
    if (isSpeaking) return 'text-green-600';
    return 'text-blue-600';
  };

  const getButtonIcon = () => {
    if (!isRecording) return <Mic className="w-6 h-6" />;
    if (isSpeaking) return <Volume2 className="w-6 h-6" />;
    return <MicOff className="w-6 h-6" />;
  };

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-8 text-center space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-light text-gray-900">
            Voice Activity Detection
          </h3>
          <p className={`text-sm ${getStatusColor()}`}>
            {getStatusText()}
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleToggleRecording}
            size="lg"
            className={`
              px-12 py-8 text-xl rounded-full shadow-lg transition-all duration-200 hover:shadow-xl
              ${isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-indigo-400 hover:bg-indigo-500 text-white'
              }
              ${isSpeaking ? 'animate-pulse' : ''}
            `}
          >
            {getButtonIcon()}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>

          {isRecording && (
            <div className="space-y-2">
              <div className="flex justify-center space-x-4 text-sm">
                <div className={`flex items-center space-x-2 ${isSpeaking ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Speech Detected</span>
                </div>
                <div className={`flex items-center space-x-2 ${!isSpeaking && isRecording ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${!isSpeaking && isRecording ? 'bg-blue-500' : 'bg-gray-300'}`} />
                  <span>Listening</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Audio is being processed at 24kHz with automatic turn detection
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

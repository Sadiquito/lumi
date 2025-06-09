
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { useSTT } from '@/hooks/useSTT';
import { useLumiConversation } from '@/hooks/useLumiConversation';
import { useTTS } from '@/hooks/useTTS';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Volume2, Mic, MicOff } from 'lucide-react';

interface TranscriptEntry {
  id: string;
  text: string;
  speaker: 'user' | 'lumi';
  timestamp: number;
  confidence?: number;
}

type ConversationState = 'idle' | 'listening' | 'user_speaking' | 'processing' | 'lumi_speaking';

const ConversationPage = () => {
  const { user, signOut } = useAuth();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [conversationId, setConversationId] = useState<string | undefined>();

  // TTS Management with interruption handling
  const handleTTSSpeechStart = useCallback(() => {
    console.log('Lumi started speaking');
    setConversationState('lumi_speaking');
  }, []);

  const handleTTSSpeechEnd = useCallback(() => {
    console.log('Lumi finished speaking - returning to listening');
    setConversationState('listening');
  }, []);

  const { speak: speakText, stopSpeaking, isSpeaking: isLumiSpeaking, isProcessing: isTTSProcessing } = useTTS({
    onSpeechStart: handleTTSSpeechStart,
    onSpeechEnd: handleTTSSpeechEnd
  });

  // Lumi conversation handling
  const handleLumiResponse = useCallback((response: any) => {
    console.log('Lumi response received:', response);
    
    if (response.response) {
      const lumiEntry: TranscriptEntry = {
        id: `${Date.now()}-lumi-${Math.random()}`,
        text: response.response,
        speaker: 'lumi',
        timestamp: Date.now()
      };
      
      setTranscript(prev => [...prev, lumiEntry]);
      
      // Convert Lumi's response to speech
      speakText(response.response);
      
      // Handle follow-up question if present
      if (response.followUpQuestion) {
        setTimeout(() => {
          const followUpEntry: TranscriptEntry = {
            id: `${Date.now()}-lumi-followup-${Math.random()}`,
            text: response.followUpQuestion,
            speaker: 'lumi',
            timestamp: Date.now()
          };
          setTranscript(prev => [...prev, followUpEntry]);
          
          // Speak the follow-up question after current response ends
          setTimeout(() => {
            speakText(response.followUpQuestion);
          }, 500);
        }, 1000);
      }
    }

    if (response.conversationId) {
      setConversationId(response.conversationId);
    }
  }, [speakText]);

  const { sendToLumi, isProcessing: isLumiProcessing } = useLumiConversation({
    onLumiResponse: handleLumiResponse
  });

  // STT handling with turn management
  const handleSTTResult = useCallback((result: any) => {
    console.log('STT Result received:', result);
    
    if (result.transcript && result.transcript.trim()) {
      if (result.isFinal) {
        // Add final transcript to history
        const newEntry: TranscriptEntry = {
          id: `${Date.now()}-${Math.random()}`,
          text: result.transcript.trim(),
          speaker: 'user',
          timestamp: result.timestamp || Date.now(),
          confidence: result.confidence
        };
        
        setTranscript(prev => [...prev, newEntry]);
        setCurrentUserText(''); // Clear interim text
        
        console.log('Added final transcript, sending to Lumi:', newEntry);
        
        // Transition to processing state
        setConversationState('processing');
        
        // Send to Lumi for response
        sendToLumi(result.transcript.trim(), conversationId);
      } else {
        // Update interim transcript
        setCurrentUserText(result.transcript);
      }
    }
  }, [sendToLumi, conversationId]);

  const { processAudio, isProcessing: isSTTProcessing, error: sttError } = useSTT({
    onTranscript: handleSTTResult
  });

  // Audio data handling with VAD
  const handleAudioData = useCallback((encodedAudio: string, isSpeech: boolean) => {
    console.log('Received audio data:', {
      audioLength: encodedAudio.length,
      isSpeech,
      currentState: conversationState,
      timestamp: new Date().toISOString(),
    });
    
    // Only process audio if we're in a listening state
    if (conversationState === 'listening' || conversationState === 'user_speaking') {
      processAudio(encodedAudio, isSpeech, Date.now());
    }
  }, [processAudio, conversationState]);

  // Critical: Speech detection with interruption logic
  const handleSpeechStart = useCallback(() => {
    console.log('User speech detected');
    
    // If Lumi is speaking, interrupt immediately
    if (isLumiSpeaking && conversationState === 'lumi_speaking') {
      console.log('Interrupting Lumi - user started speaking');
      stopSpeaking();
    }
    
    setConversationState('user_speaking');
  }, [isLumiSpeaking, conversationState, stopSpeaking]);

  const handleSpeechEnd = useCallback(() => {
    console.log('User speech ended');
    
    // Only transition to listening if we were in user_speaking state
    if (conversationState === 'user_speaking') {
      setConversationState('listening');
    }
  }, [conversationState]);

  // Recording state management
  const handleRecordingStateChange = useCallback((isRecording: boolean) => {
    console.log('Recording state changed:', isRecording);
    
    if (isRecording) {
      setConversationState('listening');
    } else {
      setConversationState('idle');
      setCurrentUserText('');
    }
  }, []);

  // Status indicators
  const getStatusInfo = () => {
    switch (conversationState) {
      case 'idle':
        return { text: 'Ready to start conversation', color: 'text-gray-600', icon: MicOff };
      case 'listening':
        return { text: 'Listening for your voice...', color: 'text-blue-600', icon: Mic };
      case 'user_speaking':
        return { text: 'You are speaking', color: 'text-green-600', icon: Mic };
      case 'processing':
        return { text: 'Processing your message...', color: 'text-purple-600', icon: Mic };
      case 'lumi_speaking':
        return { text: 'Lumi is responding', color: 'text-orange-600', icon: Volume2 };
      default:
        return { text: 'Unknown state', color: 'text-gray-400', icon: MicOff };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Welcome back</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Main Conversation Area */}
        <div className="space-y-8">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-light text-gray-900">
                Voice Conversation with Lumi
              </CardTitle>
              <p className="text-gray-600">
                Natural turn-taking conversation with automatic interruption handling
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Recorder Component */}
              <AudioRecorder
                onAudioData={handleAudioData}
                onSpeechStart={handleSpeechStart}
                onSpeechEnd={handleSpeechEnd}
                onRecordingStateChange={handleRecordingStateChange}
              />
              
              {/* Enhanced Status Display */}
              <div className="text-center space-y-4">
                <div className={`flex items-center justify-center space-x-3 ${statusInfo.color}`}>
                  <StatusIcon className="w-5 h-5" />
                  <span className="text-lg font-medium">{statusInfo.text}</span>
                </div>
                
                {/* Detailed Status Indicators */}
                <div className="flex justify-center space-x-8 text-sm">
                  <div className={`flex items-center space-x-2 ${conversationState === 'user_speaking' ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${conversationState === 'user_speaking' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span>You Speaking</span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 ${isSTTProcessing ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${isSTTProcessing ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span>STT Processing</span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 ${isLumiProcessing ? 'text-purple-600' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${isLumiProcessing ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span>Lumi Thinking</span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 ${isLumiSpeaking ? 'text-orange-600' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${isLumiSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`} />
                    <Volume2 className="w-3 h-3" />
                    <span>Lumi Speaking</span>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {sttError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center">
                  STT Error: {sttError}
                </div>
              )}

              {/* Turn-taking Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Conversation Flow</h4>
                <p className="text-sm text-gray-600">
                  • Start speaking to interrupt Lumi at any time<br/>
                  • Automatic turn detection with VAD<br/>
                  • Real-time transcription and response generation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transcript Display */}
          <TranscriptDisplay
            transcript={transcript}
            currentUserText={currentUserText}
            isUserSpeaking={conversationState === 'user_speaking'}
            isLumiSpeaking={isLumiSpeaking}
          />
        </div>
      </div>
    </div>
  );
};

const Conversation = () => (
  <ProtectedRoute>
    <ConversationPage />
  </ProtectedRoute>
);

export default Conversation;


import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { useSTT } from '@/hooks/useSTT';
import { useLumiConversation } from '@/hooks/useLumiConversation';
import { useTTS } from '@/hooks/useTTS';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Volume2 } from 'lucide-react';

interface TranscriptEntry {
  id: string;
  text: string;
  speaker: 'user' | 'lumi';
  timestamp: number;
  confidence?: number;
}

const ConversationPage = () => {
  const { user, signOut } = useAuth();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [conversationState, setConversationState] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [conversationId, setConversationId] = useState<string | undefined>();

  const handleTTSSpeechStart = useCallback(() => {
    console.log('Lumi started speaking');
    setConversationState('speaking');
  }, []);

  const handleTTSSpeechEnd = useCallback(() => {
    console.log('Lumi finished speaking');
    setConversationState('listening');
  }, []);

  const { speak: speakText, stopSpeaking, isSpeaking: isLumiSpeaking, isProcessing: isTTSProcessing } = useTTS({
    onSpeechStart: handleTTSSpeechStart,
    onSpeechEnd: handleTTSSpeechEnd
  });

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
      
      // Add follow-up question if present
      if (response.followUpQuestion) {
        setTimeout(() => {
          const followUpEntry: TranscriptEntry = {
            id: `${Date.now()}-lumi-followup-${Math.random()}`,
            text: response.followUpQuestion,
            speaker: 'lumi',
            timestamp: Date.now()
          };
          setTranscript(prev => [...prev, followUpEntry]);
          
          // Speak the follow-up question after a brief pause
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
        
        console.log('Added final transcript:', newEntry);
        
        // Send to Lumi for response
        sendToLumi(result.transcript.trim(), conversationId);
      } else {
        // Update interim transcript
        setCurrentUserText(result.transcript);
      }
    }
  }, [sendToLumi, conversationId]);

  const { processAudio, isProcessing, error: sttError } = useSTT({
    onTranscript: handleSTTResult
  });

  const handleAudioData = useCallback((encodedAudio: string, isSpeech: boolean) => {
    console.log('Received audio data:', {
      audioLength: encodedAudio.length,
      isSpeech,
      timestamp: new Date().toISOString(),
    });
    
    // Process audio through STT
    processAudio(encodedAudio, isSpeech, Date.now());
  }, [processAudio]);

  const handleConversationStateChange = useCallback((state: 'idle' | 'listening' | 'speaking') => {
    console.log('Conversation state changed to:', state);
    
    // If user starts speaking while Lumi is talking, interrupt Lumi
    if (state === 'speaking' && isLumiSpeaking) {
      console.log('User interrupted Lumi - stopping TTS');
      stopSpeaking();
    }
    
    setConversationState(state);
    
    // Clear interim text when not speaking
    if (state !== 'speaking') {
      setCurrentUserText('');
    }
  }, [isLumiSpeaking, stopSpeaking]);

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
                Ready to talk with Lumi?
              </CardTitle>
              <p className="text-gray-600">
                Start speaking naturally - Lumi will automatically detect and transcribe your words
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <AudioRecorder
                onAudioData={handleAudioData}
                onConversationStateChange={handleConversationStateChange}
              />
              
              {/* Status indicators */}
              <div className="flex justify-center space-x-6 text-sm">
                <div className={`flex items-center space-x-2 ${conversationState === 'speaking' && !isLumiSpeaking ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${conversationState === 'speaking' && !isLumiSpeaking ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>You Speaking</span>
                </div>
                <div className={`flex items-center space-x-2 ${isProcessing ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span>Processing</span>
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

              {/* Error display */}
              {sttError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center">
                  STT Error: {sttError}
                </div>
              )}

              <p className="text-sm text-gray-500 text-center">
                Speech-to-text is enabled - your words will appear below in real-time
              </p>
            </CardContent>
          </Card>

          {/* Transcript Display */}
          <TranscriptDisplay
            transcript={transcript}
            currentUserText={currentUserText}
            isUserSpeaking={conversationState === 'speaking' && !isLumiSpeaking}
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

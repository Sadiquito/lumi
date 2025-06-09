
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { useSTT } from '@/hooks/useSTT';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

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
      } else {
        // Update interim transcript
        setCurrentUserText(result.transcript);
      }
    }
  }, []);

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
    setConversationState(state);
    
    // Clear interim text when not speaking
    if (state !== 'speaking') {
      setCurrentUserText('');
    }
  }, []);

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
                <div className={`flex items-center space-x-2 ${conversationState === 'speaking' ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${conversationState === 'speaking' ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Speaking</span>
                </div>
                <div className={`flex items-center space-x-2 ${isProcessing ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                  <span>Processing</span>
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
            isUserSpeaking={conversationState === 'speaking'}
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


import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AudioRecorder } from '@/components/AudioRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

const ConversationPage = () => {
  const { user, signOut } = useAuth();

  const handleAudioData = (encodedAudio: string, isSpeech: boolean) => {
    console.log('Received audio data:', {
      audioLength: encodedAudio.length,
      isSpeech,
      timestamp: new Date().toISOString(),
    });
    
    // TODO: Send to backend for STT processing
    // This will be implemented in the next phase
  };

  const handleConversationStateChange = (state: 'idle' | 'listening' | 'speaking') => {
    console.log('Conversation state changed to:', state);
    // TODO: Update UI state, send to backend for context
  };

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
                Start speaking naturally - Lumi will automatically detect when you're talking
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <AudioRecorder
                onAudioData={handleAudioData}
                onConversationStateChange={handleConversationStateChange}
              />
              <p className="text-sm text-gray-500 text-center">
                Voice Activity Detection is enabled - no need to click between turns
              </p>
            </CardContent>
          </Card>

          {/* Placeholder for future transcript display */}
          <Card className="border-none shadow-sm bg-white/60">
            <CardContent className="p-6">
              <p className="text-center text-gray-500">
                Your conversation transcript will appear here...
              </p>
            </CardContent>
          </Card>
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

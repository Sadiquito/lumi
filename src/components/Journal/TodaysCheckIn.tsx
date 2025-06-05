
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles, Brain } from 'lucide-react';
import AudioRecordingFeature from '@/components/AudioRecordingFeature';
import DailyAdviceGenerator from '@/components/DailyAdviceGenerator';
import DailyGreetingAutoStart from '@/components/DailyGreetingAutoStart';
import { useAuth } from '@/components/AuthProvider';

const TodaysCheckIn: React.FC = () => {
  const { user } = useAuth();
  const [showAudioRecording, setShowAudioRecording] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);

  const handleStartConversation = () => {
    setShowAudioRecording(true);
    setConversationStarted(true);
  };

  const handleTranscriptionComplete = (transcript: string) => {
    console.log('Transcription completed:', transcript);
  };

  const handleAIResponse = (response: string) => {
    console.log('AI response:', response);
  };

  return (
    <div className="space-y-6">
      {/* Daily Greeting Auto-Start */}
      {!conversationStarted && (
        <DailyGreetingAutoStart
          onStartConversation={handleStartConversation}
          autoPlay={true}
        />
      )}

      {/* Main Check-in Card */}
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-xl flex items-center">
            <MessageCircle className="w-6 h-6 mr-3 text-lumi-aquamarine" />
            today's check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Audio Recording Interface */}
          {showAudioRecording ? (
            <AudioRecordingFeature
              onTranscriptionComplete={handleTranscriptionComplete}
              onAIResponse={handleAIResponse}
              maxDuration={300} // 5 minutes for check-ins
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-lumi-deep-space/40 rounded-lg p-6 border border-lumi-aquamarine/10">
                <Brain className="w-12 h-12 text-lumi-aquamarine mx-auto mb-4" />
                <h3 className="text-white text-lg font-medium mb-2">ready to chat with lumi?</h3>
                <p className="text-white/70 mb-4">
                  share what's on your mind today. i'm here to listen and understand.
                </p>
                <Button
                  onClick={handleStartConversation}
                  className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  start conversation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Wisdom Generator */}
      <DailyAdviceGenerator />
    </div>
  );
};

export default TodaysCheckIn;

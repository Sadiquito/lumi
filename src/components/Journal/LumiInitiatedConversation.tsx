
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Volume2, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import SimpleTTS from '@/components/SimpleTTS';

interface LumiInitiatedConversationProps {
  onUserResponse?: (transcript: string) => void;
  onConversationEnd?: () => void;
}

type ConversationFlow = 'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing';

const LumiInitiatedConversation: React.FC<LumiInitiatedConversationProps> = ({
  onUserResponse,
  onConversationEnd
}) => {
  const [flowState, setFlowState] = useState<ConversationFlow>('ready');
  const [currentLumiMessage, setCurrentLumiMessage] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<Array<{
    speaker: 'lumi' | 'user';
    message: string;
    timestamp: Date;
  }>>([]);

  // Mock Lumi opening prompts - these will be replaced with AI-generated content
  const openingPrompts = [
    "Hello! I'm Lumi. I'm here to listen and understand you better. What's been on your mind lately?",
    "Hi there! I sense you might have something you'd like to explore today. What would you like to talk about?",
    "Welcome back! I've been thinking about our previous conversations. How are you feeling right now?",
    "Good to see you again! I'm curious - what's the most important thing happening in your life today?"
  ];

  const followUpPrompts = [
    "That's really interesting. Can you tell me more about how that makes you feel?",
    "I hear you. What do you think is driving those thoughts?",
    "Thank you for sharing that with me. What would you like to explore deeper?",
    "I appreciate your openness. How has this been affecting your daily life?"
  ];

  const handleStartConversation = () => {
    setFlowState('lumi_speaking');
    // Select an opening prompt - in production this would come from AI
    const prompt = openingPrompts[Math.floor(Math.random() * openingPrompts.length)];
    setCurrentLumiMessage(prompt);
    
    // Add to conversation history
    setConversationHistory([{
      speaker: 'lumi',
      message: prompt,
      timestamp: new Date()
    }]);
  };

  const handleLumiFinishedSpeaking = () => {
    setFlowState('waiting_for_user');
  };

  const handleUserStartRecording = () => {
    setFlowState('user_recording');
  };

  const handleUserFinishedRecording = (transcript: string) => {
    setFlowState('processing');
    
    // Add user response to history
    setConversationHistory(prev => [...prev, {
      speaker: 'user',
      message: transcript,
      timestamp: new Date()
    }]);

    onUserResponse?.(transcript);

    // Simulate processing time then generate Lumi's follow-up
    setTimeout(() => {
      const followUp = followUpPrompts[Math.floor(Math.random() * followUpPrompts.length)];
      setCurrentLumiMessage(followUp);
      setConversationHistory(prev => [...prev, {
        speaker: 'lumi',
        message: followUp,
        timestamp: new Date()
      }]);
      setFlowState('lumi_speaking');
    }, 2000);
  };

  const renderCurrentState = () => {
    switch (flowState) {
      case 'ready':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lumi-aquamarine/80 to-lumi-aquamarine/60 flex items-center justify-center shadow-2xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-white text-xl font-medium tracking-wide" style={{ fontFamily: 'Cinzel' }}>
                Ready to begin your session
              </h3>
              <p className="text-white/70 text-lg" style={{ fontFamily: 'Crimson Pro' }}>
                Lumi will start the conversation with a thoughtful question
              </p>
            </div>
            <Button
              onClick={handleStartConversation}
              className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white py-6 px-12 text-lg font-medium rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
              size="lg"
            >
              <MessageCircle className="w-6 h-6 mr-3" />
              Begin Conversation
            </Button>
          </div>
        );

      case 'lumi_speaking':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-sunset-gold/80 to-lumi-sunset-gold/60 flex items-center justify-center shadow-2xl animate-pulse">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
                Lumi is speaking
              </h3>
              <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
                Listen to Lumi's question
              </p>
            </div>
            
            <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-gold/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-lumi-sunset-gold/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-lumi-sunset-gold" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg leading-relaxed" style={{ fontFamily: 'Crimson Pro' }}>
                      {currentLumiMessage}
                    </p>
                    <div className="mt-4">
                      <SimpleTTS
                        text={currentLumiMessage}
                        autoPlay={true}
                        variant="compact"
                        className="bg-lumi-sunset-gold/20 border-lumi-sunset-gold/40 text-lumi-sunset-gold hover:bg-lumi-sunset-gold/30"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={handleLumiFinishedSpeaking}
                variant="outline"
                className="border-lumi-sunset-gold/40 text-lumi-sunset-gold hover:bg-lumi-sunset-gold/10"
              >
                I'm ready to respond
              </Button>
            </div>
          </div>
        );

      case 'waiting_for_user':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-aquamarine/80 to-lumi-aquamarine/60 flex items-center justify-center shadow-2xl animate-pulse">
                  <Mic className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
                Your turn to speak
              </h3>
              <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
                Share your thoughts with Lumi
              </p>
            </div>

            <div className="text-center">
              <Button
                onClick={handleUserStartRecording}
                className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white py-6 px-12 text-lg font-medium rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
                size="lg"
              >
                <Mic className="w-6 h-6 mr-3" />
                Start Recording
              </Button>
            </div>
          </div>
        );

      case 'user_recording':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-coral/80 to-lumi-coral/60 flex items-center justify-center shadow-2xl">
                  <Mic className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
                Recording your response
              </h3>
              <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
                Speak naturally - Lumi is listening
              </p>
            </div>

            <div className="text-center">
              <Button
                onClick={() => handleUserFinishedRecording("Mock user response - this will be replaced with actual transcription")}
                variant="outline"
                className="border-lumi-coral/40 text-lumi-coral hover:bg-lumi-coral/10"
              >
                Stop Recording
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-sunset-gold/80 to-lumi-sunset-gold/60 flex items-center justify-center shadow-2xl">
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
                Lumi is thinking
              </h3>
              <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
                Processing your response and preparing a thoughtful follow-up
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {renderCurrentState()}
      
      {/* Conversation History */}
      {conversationHistory.length > 0 && (
        <Card className="bg-lumi-charcoal/60 backdrop-blur-sm border-lumi-aquamarine/10">
          <CardContent className="p-6">
            <h4 className="text-white text-lg font-medium mb-4" style={{ fontFamily: 'Cinzel' }}>
              Conversation Flow
            </h4>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {conversationHistory.map((entry, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    entry.speaker === 'lumi' 
                      ? "bg-lumi-sunset-gold/20" 
                      : "bg-lumi-aquamarine/20"
                  )}>
                    {entry.speaker === 'lumi' ? (
                      <Sparkles className="w-4 h-4 text-lumi-sunset-gold" />
                    ) : (
                      <Mic className="w-4 h-4 text-lumi-aquamarine" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white/90 text-sm leading-relaxed" style={{ fontFamily: 'Crimson Pro' }}>
                      {entry.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LumiInitiatedConversation;

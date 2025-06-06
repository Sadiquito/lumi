
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import LumiInitiatedConversation from './LumiInitiatedConversation';
import ConversationHistory from './ConversationHistory';

const ConversationInterface: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'start' | 'conversation'>('start');

  const handleUserResponse = (transcript: string) => {
    console.log('User response:', transcript);
    // This will later integrate with conversation storage
  };

  const handleConversationEnd = () => {
    setActiveMode('start');
  };

  const handleStartConversation = () => {
    setActiveMode('conversation');
  };

  if (activeMode === 'conversation') {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <div className="flex justify-start">
          <Button
            onClick={() => setActiveMode('start')}
            variant="outline"
            size="sm"
            className="border-lumi-aquamarine/40 text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Button>
        </div>

        {/* Active Conversation */}
        <LumiInitiatedConversation
          onUserResponse={handleUserResponse}
          onConversationEnd={handleConversationEnd}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-12">
      {/* Main Conversation Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleStartConversation}
          className="
            w-32 h-32 rounded-full 
            bg-gradient-to-br from-lumi-aquamarine/80 to-lumi-aquamarine/60
            hover:from-lumi-aquamarine/90 hover:to-lumi-aquamarine/70
            border-2 border-lumi-aquamarine/30
            shadow-2xl hover:shadow-lumi-aquamarine/20
            transition-all duration-300 hover:scale-105
            backdrop-blur-sm
          "
          size="lg"
        >
          <MessageCircle className="w-12 h-12 text-white drop-shadow-lg" />
        </Button>
      </div>

      {/* Conversation History */}
      <ConversationHistory />
    </div>
  );
};

export default ConversationInterface;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import ConversationHistory from './ConversationHistory';

const ConversationInterface: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  const handleStartConversation = () => {
    console.log('Starting conversation...');
    setIsRecording(!isRecording);
    // TODO: Implement conversation start logic
  };

  return (
    <div className="flex flex-col items-center space-y-12">
      {/* Main Conversation Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleStartConversation}
          className={`
            w-32 h-32 rounded-full 
            bg-gradient-to-br from-lumi-aquamarine/80 to-lumi-aquamarine/60
            hover:from-lumi-aquamarine/90 hover:to-lumi-aquamarine/70
            border-2 border-lumi-aquamarine/30
            shadow-2xl hover:shadow-lumi-aquamarine/20
            transition-all duration-300 hover:scale-105
            backdrop-blur-sm
            ${isRecording ? 'animate-pulse shadow-lumi-aquamarine/40' : ''}
          `}
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

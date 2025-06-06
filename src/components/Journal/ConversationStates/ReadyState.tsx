
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles } from 'lucide-react';

interface ReadyStateProps {
  onStartConversation: () => void;
}

const ReadyState: React.FC<ReadyStateProps> = ({ onStartConversation }) => {
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
        onClick={onStartConversation}
        className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white py-6 px-12 text-lg font-medium rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
        size="lg"
      >
        <MessageCircle className="w-6 h-6 mr-3" />
        Begin Conversation
      </Button>
    </div>
  );
};

export default ReadyState;

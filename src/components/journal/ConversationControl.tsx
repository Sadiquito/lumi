
import React from 'react';
import { Button } from '@/components/ui/button';
import { Circle, CircleStop } from 'lucide-react';

interface ConversationControlProps {
  hasStartedConversation: boolean;
  onToggleConversation: () => void;
}

export const ConversationControl: React.FC<ConversationControlProps> = ({
  hasStartedConversation,
  onToggleConversation,
}) => {
  return (
    <div className="flex flex-col items-center space-y-6 mb-12">
      <Button
        onClick={onToggleConversation}
        className={`
          w-24 h-24 rounded-full transition-all duration-300 
          ${hasStartedConversation 
            ? 'bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
            : 'bg-cyan-400/20 hover:bg-cyan-400/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
          }
          backdrop-blur-sm
        `}
      >
        {hasStartedConversation ? (
          <CircleStop className="w-8 h-8 text-red-400" />
        ) : (
          <Circle className="w-8 h-8 text-cyan-400" />
        )}
      </Button>
      
      <div className="text-center space-y-4">
        <h2 className="text-lg font-cinzel mb-1" style={{ color: '#ffffff' }}>
          {hasStartedConversation ? 'End Conversation' : 'Begin Conversation'}
        </h2>
        <p className="font-crimson text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          {hasStartedConversation ? 'Lumi is listening...' : 'Start your daily reflection with Lumi'}
        </p>
      </div>
    </div>
  );
};

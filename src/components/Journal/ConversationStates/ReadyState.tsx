
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, User } from 'lucide-react';

interface ReadyStateProps {
  onStartConversation: () => void;
  isPersonaLoading?: boolean;
  hasPersonaData?: boolean;
}

const ReadyState: React.FC<ReadyStateProps> = ({ 
  onStartConversation, 
  isPersonaLoading = false,
  hasPersonaData = false 
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-aquamarine/80 to-lumi-aquamarine/60 flex items-center justify-center shadow-2xl">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
          Ready to begin
        </h3>
        
        <p className="text-white/70 mb-6" style={{ fontFamily: 'Crimson Pro' }}>
          I'm here to listen and understand. Share whatever feels important to you right now.
        </p>

        {/* Persona status indicator */}
        {isPersonaLoading && (
          <div className="flex items-center justify-center text-xs text-lumi-aquamarine/70 mb-4">
            <User className="w-3 h-3 mr-1 animate-pulse" />
            Loading your profile...
          </div>
        )}
        
        {hasPersonaData && !isPersonaLoading && (
          <div className="flex items-center justify-center text-xs text-lumi-aquamarine/70 mb-4">
            <User className="w-3 h-3 mr-1" />
            Ready with your personal context
          </div>
        )}

        <Button
          onClick={onStartConversation}
          className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white px-8 py-3 rounded-full"
          style={{ fontFamily: 'Cinzel' }}
          disabled={isPersonaLoading}
        >
          Start Conversation
        </Button>
      </div>
    </div>
  );
};

export default ReadyState;

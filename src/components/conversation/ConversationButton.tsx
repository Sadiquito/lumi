
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface ConversationButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  onToggleConversation: () => void;
}

export const ConversationButton: React.FC<ConversationButtonProps> = ({
  isConnected,
  isConnecting,
  onToggleConversation
}) => {
  return (
    <Button
      onClick={onToggleConversation}
      disabled={isConnecting}
      className={`
        w-24 h-24 rounded-full transition-all duration-300 
        ${isConnected 
          ? 'bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
          : isConnecting
          ? 'bg-yellow-500/20 border-2 border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
          : 'bg-cyan-400/20 hover:bg-cyan-400/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
        }
        backdrop-blur-sm
      `}
    >
      {isConnecting ? (
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      ) : isConnected ? (
        <MicOff className="w-8 h-8 text-red-400" />
      ) : (
        <Mic className="w-8 h-8 text-cyan-400" />
      )}
    </Button>
  );
};

import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConversationState = 'idle' | 'lumi_speaking' | 'user_speaking';

interface CentralConversationButtonProps {
  state: ConversationState;
  onClick: () => void;
  className?: string;
}

const CentralConversationButton = ({
  state,
  onClick,
  className
}: CentralConversationButtonProps) => {
  const getButtonStyles = () => {
    switch (state) {
      case 'lumi_speaking':
        return 'bg-gradient-to-br from-lumi-sunset-coral/80 to-lumi-sunset-coral/60 animate-pulse';
      case 'user_speaking':
        return 'bg-gradient-to-br from-lumi-aquamarine/80 to-lumi-aquamarine/60 animate-pulse';
      default:
        return 'bg-gradient-to-br from-lumi-charcoal/80 to-lumi-charcoal/60';
    }
  };

  return (
    <Button
      onClick={onClick}
      className={cn(
        'w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300',
        getButtonStyles(),
        className
      )}
    >
      <Mic className={cn(
        'w-8 h-8 text-white transition-all duration-300',
        state !== 'idle' && 'animate-pulse'
      )} />
    </Button>
  );
};

export default CentralConversationButton; 
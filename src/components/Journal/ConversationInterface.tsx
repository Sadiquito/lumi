
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import LumiInitiatedConversation from './LumiInitiatedConversation';

const ConversationInterface: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'start' | 'conversation'>('start');
  const [conversationState, setConversationState] = useState<'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing'>('ready');

  const handleUserResponse = (transcript: string) => {
    console.log('User response:', transcript);
    // This will later integrate with conversation storage
  };

  const handleConversationEnd = () => {
    setActiveMode('start');
    setConversationState('ready');
  };

  const handleStartConversation = () => {
    setActiveMode('conversation');
    setConversationState('lumi_speaking');
  };

  const handleStateChange = (newState: 'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing') => {
    setConversationState(newState);
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
          onStateChange={handleStateChange}
        />
      </div>
    );
  }

  // Determine button styling based on conversation state
  const getButtonStyles = () => {
    switch (conversationState) {
      case 'lumi_speaking':
        return {
          className: cn(
            "w-32 h-32 rounded-full",
            "bg-lumi-aquamarine hover:bg-lumi-aquamarine/90",
            "border-2 border-lumi-aquamarine/30",
            "shadow-2xl",
            "transition-all duration-300 hover:scale-105",
            "backdrop-blur-sm",
            // Outward pulsing glow (breathing effect)
            "animate-pulse",
            "shadow-lumi-aquamarine/40"
          ),
          style: {
            boxShadow: '0 0 30px rgba(78, 205, 196, 0.4), 0 0 60px rgba(78, 205, 196, 0.2)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }
        };
      case 'waiting_for_user':
        return {
          className: cn(
            "w-32 h-32 rounded-full",
            "bg-lumi-sunset-gold hover:bg-lumi-sunset-gold/90",
            "border-2 border-lumi-sunset-gold/30",
            "shadow-2xl",
            "transition-all duration-300 hover:scale-105",
            "backdrop-blur-sm",
            // Inward pulsing/soft hovering glow
            "shadow-lumi-sunset-gold/40"
          ),
          style: {
            boxShadow: '0 0 20px rgba(255, 217, 61, 0.5), 0 0 40px rgba(255, 217, 61, 0.3)',
            animation: 'pulse 1.5s ease-in-out infinite alternate'
          }
        };
      default:
        return {
          className: cn(
            "w-32 h-32 rounded-full",
            "bg-gradient-to-br from-lumi-aquamarine/80 to-lumi-aquamarine/60",
            "hover:from-lumi-aquamarine/90 hover:to-lumi-aquamarine/70",
            "border-2 border-lumi-aquamarine/30",
            "shadow-2xl hover:shadow-lumi-aquamarine/20",
            "transition-all duration-300 hover:scale-105",
            "backdrop-blur-sm"
          ),
          style: {}
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <div className="flex flex-col items-center space-y-12">
      {/* Main Conversation Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleStartConversation}
          className={buttonStyles.className}
          style={buttonStyles.style}
          size="lg"
        >
          <MessageCircle className="w-12 h-12 text-white drop-shadow-lg" />
        </Button>
      </div>
    </div>
  );
};

export default ConversationInterface;

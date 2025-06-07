import React, { useEffect, useState } from 'react';
import { useConversationFlowManager } from './ConversationFlow/ConversationFlowManager';
import ConversationHistory from './ConversationHistory';
import CentralConversationButton from './ConversationFlow/CentralConversationButton';
import { useToast } from '@/hooks/use-toast';

interface LumiInitiatedConversationProps {
  onUserResponse?: (transcript: string) => void;
  onConversationEnd?: () => void;
  onStateChange?: (state: 'idle' | 'lumi_speaking' | 'user_speaking') => void;
  autoStart?: boolean;
}

const LumiInitiatedConversation = ({
  onUserResponse,
  onConversationEnd,
  onStateChange,
  autoStart = false
}: LumiInitiatedConversationProps) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  const {
    flowState,
    currentLumiMessage,
    conversationHistory,
    isTransitioning,
    error,
    isPersonaLoading,
    hasPersonaData,
    handleStartConversation,
    handleEndConversation,
    handleStartRecording,
    handleStopRecording
  } = useConversationFlowManager({
    onUserResponse,
    onConversationEnd,
    onStateChange,
    autoStart
  });

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      try {
        // Any initialization logic here
        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing conversation:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize conversation. Please try again.",
          variant: "destructive",
        });
      }
    };

    initialize();
  }, []);

  // Handle button click based on current state
  const handleButtonClick = () => {
    if (flowState === 'idle') {
      handleStartConversation();
    } else {
      handleEndConversation();
    }
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Central Conversation Button */}
      <div className="flex justify-center mb-8">
        <CentralConversationButton
          state={flowState}
          onClick={handleButtonClick}
        />
      </div>

      {/* Current Message Display */}
      {currentLumiMessage && (
        <div className="text-center mb-8">
          <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
            {currentLumiMessage}
          </p>
        </div>
      )}

      {/* Conversation History */}
      <ConversationHistory conversationHistory={conversationHistory} />

      {/* Error Display */}
      {error && (
        <div className="text-center text-red-400 mb-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default LumiInitiatedConversation;

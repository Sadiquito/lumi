import React, { useEffect, useState } from 'react';
import { useConversationFlowManager } from './ConversationFlow/ConversationFlowManager';
import ConversationStateRenderer from './ConversationFlow/ConversationStateRenderer';
import ConversationDebugPanels from './ConversationFlow/ConversationDebugPanels';
import ConversationHistory from './ConversationHistory';
import { useToast } from '@/hooks/use-toast';

interface LumiInitiatedConversationProps {
  onUserResponse?: (transcript: string) => void;
  onConversationEnd?: () => void;
  onStateChange?: (state: 'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing') => void;
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
    context,
    isPersonaLoading,
    hasPersonaData,
    conversationState,
    isSessionActive,
    audioState,
    isListening,
    isProcessing,
    handleStartConversation,
    handleLumiFinishedSpeaking,
    handleUserStartRecording,
    handleUserStopRecording,
  } = useConversationFlowManager({
    onUserResponse,
    onConversationEnd,
    onStateChange
  });

  // Auto-start conversation when component mounts if autoStart is true
  useEffect(() => {
    const initializeConversation = async () => {
      try {
        setIsInitializing(true);
        if (autoStart && flowState === 'ready') {
          await handleStartConversation();
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeConversation();
  }, [autoStart, flowState, handleStartConversation, toast]);

  // Handle errors in conversation flow
  useEffect(() => {
    if (flowState === 'ready' && !isInitializing && autoStart) {
      toast({
        title: "Conversation Ended",
        description: "The conversation has ended. You can start a new one.",
        variant: "default",
      });
      onConversationEnd?.();
    }
  }, [flowState, isInitializing, autoStart, onConversationEnd, toast]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Current Conversation State */}
      <ConversationStateRenderer
        flowState={flowState}
        currentLumiMessage={currentLumiMessage}
        isPersonaLoading={isPersonaLoading}
        hasPersonaData={hasPersonaData}
        onStartConversation={handleStartConversation}
        onFinishedSpeaking={handleLumiFinishedSpeaking}
        onStartRecording={handleUserStartRecording}
        onStopRecording={handleUserStopRecording}
      />
      
      {/* Conversation History */}
      <ConversationHistory conversationHistory={conversationHistory} />
      
      {/* Debug Panels (Development Only) */}
      <ConversationDebugPanels
        flowState={flowState}
        conversationState={conversationState}
        isSessionActive={isSessionActive}
        isListening={isListening}
        isProcessing={isProcessing}
        audioRecording={audioState.isRecording}
        personaState={context.personaState}
      />
    </div>
  );
};

export default LumiInitiatedConversation;

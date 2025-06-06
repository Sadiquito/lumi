
import React from 'react';
import { useConversationFlowManager } from './ConversationFlow/ConversationFlowManager';
import ConversationStateRenderer from './ConversationFlow/ConversationStateRenderer';
import ConversationDebugPanels from './ConversationFlow/ConversationDebugPanels';
import ConversationHistory from './ConversationHistory';

interface LumiInitiatedConversationProps {
  onUserResponse?: (transcript: string) => void;
  onConversationEnd?: () => void;
  onStateChange?: (state: 'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing') => void;
}

const LumiInitiatedConversation: React.FC<LumiInitiatedConversationProps> = ({
  onUserResponse,
  onConversationEnd,
  onStateChange
}) => {
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

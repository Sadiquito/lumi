
import React from 'react';
import ReadyState from '../ConversationStates/ReadyState';
import LumiSpeakingState from '../ConversationStates/LumiSpeakingState';
import WaitingForUserState from '../ConversationStates/WaitingForUserState';
import UserRecordingState from '../ConversationStates/UserRecordingState';
import ProcessingState from '../ConversationStates/ProcessingState';

type ConversationFlow = 'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing';

interface ConversationStateRendererProps {
  flowState: ConversationFlow;
  currentLumiMessage: string;
  isPersonaLoading: boolean;
  hasPersonaData: boolean;
  onStartConversation: () => void;
  onFinishedSpeaking: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const ConversationStateRenderer: React.FC<ConversationStateRendererProps> = ({
  flowState,
  currentLumiMessage,
  isPersonaLoading,
  hasPersonaData,
  onStartConversation,
  onFinishedSpeaking,
  onStartRecording,
  onStopRecording,
}) => {
  switch (flowState) {
    case 'ready':
      return (
        <ReadyState 
          onStartConversation={onStartConversation}
          isPersonaLoading={isPersonaLoading}
          hasPersonaData={hasPersonaData}
        />
      );

    case 'lumi_speaking':
      return (
        <LumiSpeakingState
          currentMessage={currentLumiMessage}
          onFinishedSpeaking={onFinishedSpeaking}
        />
      );

    case 'waiting_for_user':
      return <WaitingForUserState onStartRecording={onStartRecording} />;

    case 'user_recording':
      return (
        <UserRecordingState
          onStopRecording={onStopRecording}
        />
      );

    case 'processing':
      return <ProcessingState />;

    default:
      return null;
  }
};

export default ConversationStateRenderer;

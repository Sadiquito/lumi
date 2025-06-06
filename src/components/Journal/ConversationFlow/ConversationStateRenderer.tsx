import React from 'react';
import ReadyState from '../ConversationStates/ReadyState';
import LumiSpeakingState from '../ConversationStates/LumiSpeakingState';
import WaitingForUserState from '../ConversationStates/WaitingForUserState';
import UserRecordingState from '../ConversationStates/UserRecordingState';
import ProcessingState from '../ConversationStates/ProcessingState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

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
  error?: string | null;
  isTransitioning?: boolean;
}

const ConversationStateRenderer = ({
  flowState,
  currentLumiMessage,
  isPersonaLoading,
  hasPersonaData,
  onStartConversation,
  onFinishedSpeaking,
  onStartRecording,
  onStopRecording,
  error,
  isTransitioning,
}: ConversationStateRendererProps) => {
  // Show error if present
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <ReadyState 
          onStartConversation={onStartConversation}
          isPersonaLoading={isPersonaLoading}
          hasPersonaData={hasPersonaData}
        />
      </div>
    );
  }

  // Show loading state during transitions
  if (isTransitioning) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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

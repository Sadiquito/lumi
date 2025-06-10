
import React from 'react';
import { AudioWaveform } from '@/components/AudioWaveform';
import { ConversationStatus } from './ConversationStatus';

interface ConversationSectionProps {
  hasStartedConversation: boolean;
  currentAudioData?: Float32Array;
  conversationState: string;
  isLumiSpeaking: boolean;
  isRecordingActive: boolean;
}

export const ConversationSection: React.FC<ConversationSectionProps> = ({
  hasStartedConversation,
  currentAudioData,
  conversationState,
  isLumiSpeaking,
  isRecordingActive,
}) => {
  if (!hasStartedConversation) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <AudioWaveform
          audioData={currentAudioData}
          isRecording={conversationState !== 'idle'}
          isSpeaking={conversationState === 'user_speaking'}
          className="animate-fade-in"
        />
      </div>
      
      <ConversationStatus
        conversationState={conversationState}
        isLumiSpeaking={isLumiSpeaking}
        isRecordingActive={isRecordingActive}
      />
    </div>
  );
};

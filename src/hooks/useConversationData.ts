
import { useState } from 'react';
import { ConversationData, ConversationDataState } from '@/types/audioRecording';

export const useConversationData = () => {
  const [conversationData, setConversationDataState] = useState<ConversationDataState | null>(null);

  const setConversationData = (data: ConversationData | null) => {
    if (data) {
      setConversationDataState({
        id: data.id,
        transcript: data.transcript,
        ai_response: data.ai_response,
        audioBlob: data.audioBlob,
        duration: data.duration,
        quality: data.quality,
        timestamp: data.timestamp,
        retryCount: data.retryCount
      });
    } else {
      setConversationDataState(null);
    }
  };

  return { conversationData, setConversationData };
};


import { useState } from 'react';
import { PersonaState } from '@/lib/persona-state';

export interface ConversationDataState {
  conversationId?: string;
  startTime?: Date;
  endTime?: Date;
  lastActivity?: Date;
  messageCount: number;
  totalDuration: number;
  topics: string[];
  personaState?: PersonaState | null;
  lastTranscript?: string;
  lastTranscriptionTime?: Date;
  lastAiResponse?: string;
  lastAiResponseTime?: Date;
}

export const useConversationData = () => {
  const [conversationData, setConversationData] = useState<ConversationDataState>({
    messageCount: 0,
    totalDuration: 0,
    topics: [],
    personaState: null,
  });

  return {
    conversationData,
    setConversationData,
  };
};

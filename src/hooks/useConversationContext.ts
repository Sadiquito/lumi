
import { useState, useCallback, useEffect } from 'react';
import { usePersonaState } from './usePersonaState';
import { type PersonaState } from '@/lib/persona-state';

export interface ConversationContext {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  totalDuration: number;
  topics: string[];
  personaState: PersonaState | null;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

interface UseConversationContextProps {
  sessionId?: string;
}

export const useConversationContext = ({ sessionId }: UseConversationContextProps = {}) => {
  const { personaState, isLoading: personaLoading, updatePersona } = usePersonaState();
  
  const [context, setContext] = useState<ConversationContext>({
    sessionId: sessionId || `session_${Date.now()}`,
    startTime: new Date(),
    lastActivity: new Date(),
    messageCount: 0,
    totalDuration: 0,
    topics: [],
    personaState: null,
    conversationHistory: [],
  });

  // Update context when persona state changes
  useEffect(() => {
    setContext(prev => ({
      ...prev,
      personaState,
    }));
  }, [personaState]);

  const updateContext = useCallback((updates: Partial<ConversationContext>) => {
    setContext(prev => ({
      ...prev,
      ...updates,
      lastActivity: new Date(),
    }));
  }, []);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setContext(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      lastActivity: new Date(),
      conversationHistory: [
        ...prev.conversationHistory,
        {
          role,
          content,
          timestamp: new Date(),
        }
      ],
    }));
  }, []);

  const updatePersonaFromConversation = useCallback(async (insights: Partial<PersonaState>) => {
    const success = await updatePersona(insights);
    if (success) {
      console.log('Persona updated from conversation insights:', insights);
    }
    return success;
  }, [updatePersona]);

  const resetContext = useCallback(() => {
    setContext({
      sessionId: `session_${Date.now()}`,
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      totalDuration: 0,
      topics: [],
      personaState,
      conversationHistory: [],
    });
  }, [personaState]);

  return {
    context,
    updateContext,
    addMessage,
    resetContext,
    updatePersonaFromConversation,
    isPersonaLoading: personaLoading,
    hasPersonaData: personaState && Object.keys(personaState).length > 0,
  };
};

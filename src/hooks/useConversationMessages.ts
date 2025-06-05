
import { useState, useCallback } from 'react';
import { ConversationMessage, ConversationContext } from '@/types/conversation';
import { generateSessionId } from '@/utils/conversationStateUtils';

interface UseConversationMessagesProps {
  maxHistorySize: number;
}

export const useConversationMessages = ({ maxHistorySize }: UseConversationMessagesProps) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [context, setContext] = useState<ConversationContext>({
    sessionId: generateSessionId(),
    startTime: new Date(),
    lastActivity: new Date(),
    messageCount: 0,
    totalDuration: 0,
    topics: [],
  });

  const addMessage = useCallback((message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      return updated.slice(-maxHistorySize);
    });

    setContext(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      lastActivity: new Date(),
    }));

    return newMessage;
  }, [maxHistorySize]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setContext(prev => ({
      ...prev,
      sessionId: generateSessionId(),
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      totalDuration: 0,
      topics: [],
    }));
  }, []);

  return {
    messages,
    context,
    addMessage,
    clearHistory,
    setContext,
  };
};

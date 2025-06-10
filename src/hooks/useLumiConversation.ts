
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LumiResponse {
  response: string;
  followUpQuestion?: string;
  insights?: any;
  conversationId?: string;
}

interface UseLumiConversationProps {
  onLumiResponse?: (response: LumiResponse) => void;
  sessionId?: string;
}

export const useLumiConversation = ({ onLumiResponse, sessionId }: UseLumiConversationProps = {}) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendToLumi = useCallback(async (
    userTranscript: string,
    conversationId?: string,
    isSessionEnd: boolean = false
  ) => {
    if (!user || !userTranscript.trim()) return;

    try {
      setIsProcessing(true);
      setError(null);

      console.log('Sending to Lumi:', {
        userTranscript,
        userId: user.id,
        conversationId,
        sessionId,
        isSessionEnd
      });

      const { data, error } = await supabase.functions.invoke('lumi-conversation', {
        body: {
          userTranscript: userTranscript.trim(),
          userId: user.id,
          conversationId,
          isSessionEnd
        }
      });

      if (error) {
        console.error('Lumi conversation error:', error);
        throw new Error(error.message || 'Failed to get response from Lumi');
      }

      console.log('Lumi response:', data);

      onLumiResponse?.(data);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to communicate with Lumi';
      console.error('Lumi conversation error:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [user, onLumiResponse, sessionId]);

  return {
    sendToLumi,
    isProcessing,
    error
  };
};

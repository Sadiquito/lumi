
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
    if (!user || !userTranscript.trim()) {
      console.log('❌ [LumiConversation] Missing user or empty transcript:', { hasUser: !!user, transcript: userTranscript });
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      console.log('📤 [LumiConversation] Sending to Lumi:', {
        userTranscript: userTranscript.substring(0, 100) + '...',
        userId: user.id,
        conversationId,
        sessionId,
        isSessionEnd,
        timestamp: new Date().toISOString()
      });

      const startTime = Date.now();

      const { data, error } = await supabase.functions.invoke('lumi-conversation', {
        body: {
          userTranscript: userTranscript.trim(),
          userId: user.id,
          conversationId,
          isSessionEnd
        }
      });

      const processingTime = Date.now() - startTime;

      if (error) {
        console.error('❌ [LumiConversation] Supabase function error:', error);
        throw new Error(error.message || 'Failed to get response from Lumi');
      }

      console.log('✅ [LumiConversation] Lumi response received:', {
        processingTime,
        hasResponse: !!data?.response,
        responseLength: data?.response?.length || 0,
        responsePreview: data?.response?.substring(0, 100) + '...',
        fullData: data
      });

      if (data && data.response) {
        console.log('📢 [LumiConversation] Calling onLumiResponse callback...');
        onLumiResponse?.(data);
      } else {
        console.warn('⚠️ [LumiConversation] No response from Lumi:', data);
      }

      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to communicate with Lumi';
      console.error('❌ [LumiConversation] Processing error:', {
        error: errorMessage,
        userTranscript: userTranscript.substring(0, 50),
        timestamp: new Date().toISOString()
      });
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
      console.log('🏁 [LumiConversation] Processing complete');
    }
  }, [user, onLumiResponse, sessionId]);

  return {
    sendToLumi,
    isProcessing,
    error
  };
};

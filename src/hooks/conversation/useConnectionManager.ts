import { useState, useCallback, useRef, useEffect } from 'react';
import { OpenAIRealtimeAgent } from '@/utils/OpenAIRealtimeAgent';
import { supabase } from '@/integrations/supabase/client';
import { ModelOption, VoiceOption } from '@/types/conversation';

interface RealtimeMessage {
  type: string;
  [key: string]: unknown;
}

export const useConnectionManager = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLumiSpeaking, setIsLumiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const agentRef = useRef<OpenAIRealtimeAgent | null>(null);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    setIsLumiSpeaking(speaking);
  }, []);

  const startConnection = useCallback(async (
    selectedModel: ModelOption,
    selectedVoice: VoiceOption,
    onMessage: (message: RealtimeMessage) => void
  ) => {
    if (isConnecting || isConnected) {
      return;
    }

    try {
      setError(null);
      setIsConnecting(true);
      
      // Get API key from Supabase function
      const { data, error: functionError } = await supabase.functions.invoke('get-openai-key');
      
      if (functionError || !data?.apiKey) {
        throw new Error('Failed to get OpenAI API key. Please check your configuration.');
      }
      
      agentRef.current = new OpenAIRealtimeAgent();
      await agentRef.current.init(onMessage, handleSpeakingChange, data.apiKey, selectedModel, selectedVoice);
      
      setIsConnected(true);
      setIsConnecting(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      setError(errorMessage);
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [handleSpeakingChange, isConnecting, isConnected]);

  const endConnection = useCallback(async (onSessionEnd: (displayTranscript?: unknown[]) => Promise<void>, displayTranscript?: unknown[]) => {
    
    if (agentRef.current) {
      agentRef.current.disconnect();
      agentRef.current = null;
    }
    
    // Process session end with display transcript
    await onSessionEnd(displayTranscript);
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsLumiSpeaking(false);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (agentRef.current) {
        agentRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    isLumiSpeaking,
    error,
    startConnection,
    endConnection
  };
};

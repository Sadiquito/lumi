
import { useState, useCallback, useRef, useEffect } from 'react';
import { OpenAIRealtimeAgent } from '@/utils/OpenAIRealtimeAgent';
import { supabase } from '@/integrations/supabase/client';
import { ModelOption, VoiceOption } from '@/types/conversation';

export const useConnectionManager = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLumiSpeaking, setIsLumiSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const agentRef = useRef<OpenAIRealtimeAgent | null>(null);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    console.log('🗣️ Speaking state changed:', speaking);
    setIsLumiSpeaking(speaking);
  }, []);

  const startConnection = useCallback(async (
    selectedModel: ModelOption,
    selectedVoice: VoiceOption,
    onMessage: (message: any) => void,
    onSessionStart: () => void
  ) => {
    if (isConnecting || isConnected) {
      console.log('⚠️ Already connecting or connected');
      return;
    }

    try {
      console.log(`🚀 Starting conversation with ${selectedModel} using ${selectedVoice} voice...`);
      setError(null);
      setIsConnecting(true);
      
      // Session is now started externally before connection
      console.log('📋 Session management handled externally');
      
      // Get API key from Supabase function
      const { data, error: functionError } = await supabase.functions.invoke('get-openai-key');
      
      if (functionError || !data?.apiKey) {
        throw new Error('Failed to get OpenAI API key. Please check your configuration.');
      }
      
      agentRef.current = new OpenAIRealtimeAgent();
      await agentRef.current.init(onMessage, handleSpeakingChange, data.apiKey, selectedModel, selectedVoice);
      
      setIsConnected(true);
      setIsConnecting(false);
      console.log('✅ WebRTC connection established successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      console.error('❌ Error starting conversation:', err);
      setError(errorMessage);
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [handleSpeakingChange, isConnecting, isConnected]);

  const endConnection = useCallback(async (onSessionEnd: () => Promise<void>) => {
    console.log('🛑 Ending WebRTC connection...');
    
    if (agentRef.current) {
      agentRef.current.disconnect();
      agentRef.current = null;
    }
    
    // End session and save if meaningful
    console.log('💾 Processing session end...');
    await onSessionEnd();
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsLumiSpeaking(false);
    setError(null);
    
    console.log('✅ Connection and session ended');
  }, []);

  const sendTextMessage = useCallback(async (text: string) => {
    try {
      if (!agentRef.current) {
        throw new Error('Agent not initialized');
      }
      
      console.log('📤 Sending text message:', text);
      await agentRef.current.sendMessage(text);
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (agentRef.current) {
        console.log('🧹 Cleaning up agent connection');
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
    endConnection,
    sendTextMessage
  };
};

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
    onMessage: (message: any) => void
  ) => {
    if (isConnecting || isConnected) {
      console.log('⚠️ Already connecting or connected');
      return;
    }

    try {
      console.log(`🚀 Starting conversation with ${selectedModel} using ${selectedVoice} voice...`);
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
      console.log('✅ WebRTC connection established successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      console.error('❌ Error starting conversation:', err);
      setError(errorMessage);
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [handleSpeakingChange, isConnecting, isConnected]);

  const endConnection = useCallback(async (onSessionEnd: (displayTranscript?: any[]) => Promise<void>, displayTranscript?: any[]) => {
    console.log('🛑 Ending WebRTC connection with display transcript:', displayTranscript?.length || 0, 'entries');
    
    if (agentRef.current) {
      agentRef.current.disconnect();
      agentRef.current = null;
    }
    
    // Process session end with display transcript
    console.log('💾 Processing session end with display transcript...');
    await onSessionEnd(displayTranscript);
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsLumiSpeaking(false);
    setError(null);
    
    console.log('✅ Connection and session ended');
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
    endConnection
  };
};

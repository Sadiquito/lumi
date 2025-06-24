
import { useState, useCallback, useEffect, useRef } from 'react';
import { OpenAIRealtimeAgent } from '@/utils/OpenAIRealtimeAgent';
import { supabase } from '@/integrations/supabase/client';
import { useSessionManagement } from './useSessionManagement';

interface TranscriptEntry {
  id: string;
  text: string;
  speaker: 'user' | 'lumi';
  timestamp: number;
}

export type ModelOption = 'gpt-4o' | 'gpt-4o-mini';
export type VoiceOption = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';

export const useRealtimeConversation = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLumiSpeaking, setIsLumiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(() => {
    // Load from localStorage or default to gpt-4o-mini
    const saved = localStorage.getItem('lumi-selected-model');
    return (saved as ModelOption) || 'gpt-4o-mini';
  });
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(() => {
    // Load from localStorage or default to alloy
    const saved = localStorage.getItem('lumi-selected-voice');
    return (saved as VoiceOption) || 'alloy';
  });
  const agentRef = useRef<OpenAIRealtimeAgent | null>(null);

  // Integrate session management
  const { startSession, addToTranscript, endSession } = useSessionManagement();

  // Save model selection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lumi-selected-model', selectedModel);
  }, [selectedModel]);

  // Save voice selection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lumi-selected-voice', selectedVoice);
  }, [selectedVoice]);

  const handleMessage = useCallback((event: any) => {
    console.log('📨 Agent event received:', event.type);

    if (event.type === 'error') {
      console.error('❌ Agent error:', event);
      setError(event.error || 'An error occurred with the AI service');
      return;
    }

    // Handle conversation updates
    if (event.type === 'conversation.item.appended' && event.item?.type === 'message') {
      const role = event.item.role;
      const content = event.item.content?.[0]?.text || event.item.content?.[0]?.transcript || '';
      
      if (content && content.trim()) {
        const newEntry = {
          id: `${Date.now()}-${role}`,
          text: content,
          speaker: role === 'user' ? 'user' : 'lumi',
          timestamp: Date.now()
        };
        
        setTranscript(prev => [...prev, newEntry]);
        
        // Add to session transcript
        addToTranscript(newEntry.speaker, newEntry.text);
      }
    }

    // Handle realtime events for live transcript
    if (event.type === 'response.audio_transcript.delta') {
      setTranscript(prev => {
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.speaker === 'lumi' && !lastEntry.text.includes('[COMPLETE]')) {
          return prev.map((entry, index) => 
            index === prev.length - 1 
              ? { ...entry, text: entry.text + event.delta }
              : entry
          );
        } else {
          const newEntry = {
            id: `${Date.now()}-lumi-live`,
            text: event.delta,
            speaker: 'lumi' as const,
            timestamp: Date.now()
          };
          return [...prev, newEntry];
        }
      });
    } else if (event.type === 'response.audio_transcript.done') {
      setTranscript(prev => {
        const updatedTranscript = prev.map((entry, index) => 
          index === prev.length - 1 && entry.speaker === 'lumi'
            ? { ...entry, text: entry.text + ' [COMPLETE]' }
            : entry
        );
        
        // Add complete Lumi response to session
        const lastEntry = updatedTranscript[updatedTranscript.length - 1];
        if (lastEntry && lastEntry.speaker === 'lumi') {
          const cleanText = lastEntry.text.replace(' [COMPLETE]', '');
          addToTranscript('lumi', cleanText);
        }
        
        return updatedTranscript;
      });
    }

    // Handle user input transcription
    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const userText = event.transcript;
      if (userText && userText.trim()) {
        const newEntry = {
          id: `${Date.now()}-user`,
          text: userText,
          speaker: 'user' as const,
          timestamp: Date.now()
        };
        
        setTranscript(prev => [...prev, newEntry]);
        
        // Add to session transcript
        addToTranscript('user', userText);
      }
    }
  }, [addToTranscript]);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    console.log('🗣️ Speaking state changed:', speaking);
    setIsLumiSpeaking(speaking);
  }, []);

  const startConversation = useCallback(async () => {
    if (isConnecting || isConnected) {
      console.log('⚠️ Already connecting or connected');
      return;
    }

    try {
      console.log(`🚀 Starting conversation with ${selectedModel} using ${selectedVoice} voice...`);
      setError(null);
      setIsConnecting(true);
      
      // Start session management
      startSession();
      
      // Get API key from Supabase function
      const { data, error: functionError } = await supabase.functions.invoke('get-openai-key');
      
      if (functionError || !data?.apiKey) {
        throw new Error('Failed to get OpenAI API key. Please check your configuration.');
      }
      
      agentRef.current = new OpenAIRealtimeAgent();
      await agentRef.current.init(handleMessage, handleSpeakingChange, data.apiKey, selectedModel, selectedVoice);
      
      setIsConnected(true);
      setIsConnecting(false);
      console.log('✅ Conversation started successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      console.error('❌ Error starting conversation:', err);
      setError(errorMessage);
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [handleMessage, handleSpeakingChange, isConnecting, isConnected, selectedModel, selectedVoice, startSession]);

  const endConversation = useCallback(async () => {
    console.log('🛑 Ending conversation...');
    
    if (agentRef.current) {
      agentRef.current.disconnect();
      agentRef.current = null;
    }
    
    // End session and save if meaningful
    await endSession();
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsLumiSpeaking(false);
    setTranscript([]);
    setError(null);
    
    console.log('✅ Conversation ended');
  }, [endSession]);

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
    transcript,
    error,
    selectedModel,
    setSelectedModel,
    selectedVoice,
    setSelectedVoice,
    startConversation,
    endConversation,
    sendTextMessage
  };
};

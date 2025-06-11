
import { useState, useCallback, useEffect, useRef } from 'react';
import { RealtimeChat } from '@/utils/RealtimeAudio';

interface TranscriptEntry {
  id: string;
  text: string;
  speaker: 'user' | 'lumi';
  timestamp: number;
}

export const useRealtimeConversation = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLumiSpeaking, setIsLumiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = useCallback((message: any) => {
    console.log('📨 Realtime message received:', message.type);

    if (message.type === 'error') {
      console.error('❌ OpenAI API error:', message);
      setError(message.error || 'An error occurred with the AI service');
      return;
    }

    if (message.type === 'response.audio_transcript.delta') {
      // Handle live transcript from Lumi
      setTranscript(prev => {
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.speaker === 'lumi' && !lastEntry.text.includes('[COMPLETE]')) {
          // Update the last Lumi entry
          return prev.map((entry, index) => 
            index === prev.length - 1 
              ? { ...entry, text: entry.text + message.delta }
              : entry
          );
        } else {
          // Create new Lumi entry
          return [...prev, {
            id: `${Date.now()}-lumi`,
            text: message.delta,
            speaker: 'lumi' as const,
            timestamp: Date.now()
          }];
        }
      });
    } else if (message.type === 'response.audio_transcript.done') {
      // Mark Lumi's response as complete
      setTranscript(prev => prev.map((entry, index) => 
        index === prev.length - 1 && entry.speaker === 'lumi'
          ? { ...entry, text: entry.text + ' [COMPLETE]' }
          : entry
      ));
    } else if (message.type === 'conversation.item.input_audio_transcription.completed') {
      // Handle user speech transcription
      const userText = message.transcript;
      if (userText && userText.trim()) {
        setTranscript(prev => [...prev, {
          id: `${Date.now()}-user`,
          text: userText,
          speaker: 'user' as const,
          timestamp: Date.now()
        }]);
      }
    } else if (message.type === 'session.created') {
      console.log('✅ Session created successfully');
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    } else if (message.type === 'session.updated') {
      console.log('✅ Session updated successfully');
    }
  }, []);

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
      console.log('🚀 Starting conversation...');
      setError(null);
      setIsConnecting(true);
      
      chatRef.current = new RealtimeChat();
      await chatRef.current.init(handleMessage, handleSpeakingChange);
      
      console.log('✅ Conversation started successfully');

      // Send initial greeting after a short delay to ensure session is ready
      setTimeout(() => {
        if (chatRef.current) {
          console.log('👋 Sending initial greeting');
          chatRef.current.sendTextMessage("Hello! I'm Lumi. What's on your mind today?");
        }
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      console.error('❌ Error starting conversation:', err);
      setError(errorMessage);
      setIsConnecting(false);
      setIsConnected(false);
    }
  }, [handleMessage, handleSpeakingChange, isConnecting, isConnected]);

  const endConversation = useCallback(() => {
    console.log('🛑 Ending conversation...');
    
    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    setIsLumiSpeaking(false);
    setTranscript([]);
    setError(null);
    
    console.log('✅ Conversation ended');
  }, []);

  const sendTextMessage = useCallback(async (text: string) => {
    try {
      if (!chatRef.current) {
        throw new Error('Chat not initialized');
      }
      
      console.log('📤 Sending text message:', text);
      await chatRef.current.sendTextMessage(text);
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, []);

  useEffect(() => {
    return () => {
      if (chatRef.current) {
        console.log('🧹 Cleaning up chat connection');
        chatRef.current.disconnect();
      }
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    isLumiSpeaking,
    transcript,
    error,
    startConversation,
    endConversation,
    sendTextMessage
  };
};

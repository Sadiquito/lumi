
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
  const [isLumiSpeaking, setIsLumiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = useCallback((message: any) => {
    console.log('📨 Realtime message:', message.type);

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
    }
  }, []);

  const handleSpeakingChange = useCallback((speaking: boolean) => {
    setIsLumiSpeaking(speaking);
  }, []);

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      chatRef.current = new RealtimeChat();
      await chatRef.current.init(handleMessage, handleSpeakingChange);
      setIsConnected(true);

      // Send initial greeting
      setTimeout(() => {
        chatRef.current?.sendTextMessage("Hello! What's on your mind?");
      }, 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      setError(errorMessage);
      console.error('❌ Error starting conversation:', err);
    }
  }, [handleMessage, handleSpeakingChange]);

  const endConversation = useCallback(() => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsLumiSpeaking(false);
    setTranscript([]);
  }, []);

  const sendTextMessage = useCallback(async (text: string) => {
    try {
      await chatRef.current?.sendTextMessage(text);
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, []);

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return {
    isConnected,
    isLumiSpeaking,
    transcript,
    error,
    startConversation,
    endConversation,
    sendTextMessage
  };
};

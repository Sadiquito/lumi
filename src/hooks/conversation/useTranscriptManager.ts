
import { useState, useCallback } from 'react';
import { TranscriptEntry } from '@/types/conversation';

export const useTranscriptManager = (addToTranscript: (speaker: 'user' | 'lumi', text: string) => void) => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const handleConversationItem = useCallback((event: any) => {
    const role = event.item.role;
    const content = event.item.content?.[0]?.text || event.item.content?.[0]?.transcript || '';
    
    if (content && content.trim()) {
      // Properly type the speaker based on role
      const speaker: 'user' | 'lumi' = role === 'user' ? 'user' : 'lumi';
      
      const newEntry: TranscriptEntry = {
        id: `${Date.now()}-${role}`,
        text: content,
        speaker: speaker,
        timestamp: Date.now()
      };
      
      setTranscript(prev => [...prev, newEntry]);
      
      // Add to session transcript
      addToTranscript(speaker, newEntry.text);
    }
  }, [addToTranscript]);

  const handleAudioTranscriptDelta = useCallback((event: any) => {
    setTranscript(prev => {
      const lastEntry = prev[prev.length - 1];
      if (lastEntry && lastEntry.speaker === 'lumi' && !lastEntry.text.includes('[COMPLETE]')) {
        return prev.map((entry, index) => 
          index === prev.length - 1 
            ? { ...entry, text: entry.text + event.delta }
            : entry
        );
      } else {
        const newEntry: TranscriptEntry = {
          id: `${Date.now()}-lumi-live`,
          text: event.delta,
          speaker: 'lumi',
          timestamp: Date.now()
        };
        return [...prev, newEntry];
      }
    });
  }, []);

  const handleAudioTranscriptDone = useCallback(() => {
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
  }, [addToTranscript]);

  const handleUserInputTranscription = useCallback((event: any) => {
    const userText = event.transcript;
    if (userText && userText.trim()) {
      const newEntry: TranscriptEntry = {
        id: `${Date.now()}-user`,
        text: userText,
        speaker: 'user',
        timestamp: Date.now()
      };
      
      setTranscript(prev => [...prev, newEntry]);
      
      // Add to session transcript
      addToTranscript('user', userText);
    }
  }, [addToTranscript]);

  const clearTranscript = useCallback(() => {
    setTranscript([]);
  }, []);

  return {
    transcript,
    handleConversationItem,
    handleAudioTranscriptDelta,
    handleAudioTranscriptDone,
    handleUserInputTranscription,
    clearTranscript
  };
};

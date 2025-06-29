import { useState, useCallback } from 'react';
import { TranscriptEntry } from '@/types/conversation';

export const useTranscriptManager = (addToTranscript: (speaker: 'user' | 'lumi', text: string) => void) => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const handleConversationItem = useCallback((event: any) => {
    console.log('📝 Processing conversation item:', event);
    
    // Handle WebRTC conversation.item.created events
    if (event.item) {
      const role = event.item.role;
      
      // Handle different content types
      let content = '';
      if (event.item.content) {
        if (Array.isArray(event.item.content)) {
          // Content is an array of content objects
          content = event.item.content
            .map(c => c.text || c.transcript || '')
            .filter(text => text.trim())
            .join(' ');
        } else if (typeof event.item.content === 'string') {
          content = event.item.content;
        }
      }
      
      if (content && content.trim()) {
        const speaker: 'user' | 'lumi' = role === 'user' ? 'user' : 'lumi';
        
        const newEntry: TranscriptEntry = {
          id: `${Date.now()}-${role}-${Math.random()}`,
          text: content.trim(),
          speaker: speaker,
          timestamp: Date.now()
        };
        
        console.log('➕ Adding transcript entry from conversation item:', newEntry);
        setTranscript(prev => [...prev, newEntry]);
        
        // Ensure session transcript is updated
        console.log('💾 Adding to session transcript from conversation item:', speaker, content.trim());
        addToTranscript(speaker, newEntry.text);
      }
    }
  }, [addToTranscript]);

  const handleAudioTranscriptDelta = useCallback((event: any) => {
    console.log('🔄 Audio transcript delta:', event.delta);
    
    setTranscript(prev => {
      const lastEntry = prev[prev.length - 1];
      if (lastEntry && lastEntry.speaker === 'lumi' && !lastEntry.text.includes('[COMPLETE]')) {
        // Update existing Lumi response
        return prev.map((entry, index) => 
          index === prev.length - 1 
            ? { ...entry, text: entry.text + event.delta }
            : entry
        );
      } else {
        // Create new Lumi response entry
        const newEntry: TranscriptEntry = {
          id: `${Date.now()}-lumi-live-${Math.random()}`,
          text: event.delta,
          speaker: 'lumi',
          timestamp: Date.now()
        };
        return [...prev, newEntry];
      }
    });
  }, []);

  const handleAudioTranscriptDone = useCallback(() => {
    console.log('✅ Audio transcript completed');
    
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
        console.log('💾 Adding completed Lumi response to session:', cleanText);
        addToTranscript('lumi', cleanText);
      }
      
      return updatedTranscript;
    });
  }, [addToTranscript]);

  const handleUserInputTranscription = useCallback((event: any) => {
    console.log('🎤 Processing user input transcription event:', event);
    
    // Handle multiple possible event structures with fallbacks
    let userText = null;
    
    // Try different possible locations for the transcript text
    if (event.transcript) {
      userText = event.transcript;
      console.log('📝 Found transcript in event.transcript');
    } else if (event.text) {
      userText = event.text;
      console.log('📝 Found transcript in event.text');
    } else if (event.item && event.item.content) {
      // Handle nested content structures
      if (Array.isArray(event.item.content)) {
        userText = event.item.content
          .map(c => c.text || c.transcript || '')
          .filter(text => text.trim())
          .join(' ');
        console.log('📝 Found transcript in event.item.content array');
      } else if (typeof event.item.content === 'string') {
        userText = event.item.content;
        console.log('📝 Found transcript in event.item.content string');
      }
    }
    
    if (userText && userText.trim()) {
      const newEntry: TranscriptEntry = {
        id: `${Date.now()}-user-${Math.random()}`,
        text: userText.trim(),
        speaker: 'user',
        timestamp: Date.now()
      };
      
      console.log('➕ Adding user transcript entry:', newEntry);
      setTranscript(prev => [...prev, newEntry]);
      
      // Critical - Add to session transcript
      console.log('💾 Adding user message to session transcript:', userText.trim());
      addToTranscript('user', userText.trim());
    } else {
      console.warn('⚠️ No valid transcript found in event, trying fallback approaches:', {
        eventType: event.type,
        eventKeys: Object.keys(event)
      });
      
      // Fallback - try to extract any text content from the event
      const fallbackText = JSON.stringify(event).match(/"text":"([^"]+)"/)?.[1] || 
                          JSON.stringify(event).match(/"transcript":"([^"]+)"/)?.[1];
      
      if (fallbackText) {
        console.log('📝 Found fallback text:', fallbackText);
        const newEntry: TranscriptEntry = {
          id: `${Date.now()}-user-fallback-${Math.random()}`,
          text: fallbackText.trim(),
          speaker: 'user',
          timestamp: Date.now()
        };
        
        setTranscript(prev => [...prev, newEntry]);
        addToTranscript('user', fallbackText.trim());
      }
    }
  }, [addToTranscript]);

  const clearTranscript = useCallback(() => {
    console.log('🧹 Clearing transcript');
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

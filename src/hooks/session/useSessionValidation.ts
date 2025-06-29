import { useCallback } from 'react';

interface TranscriptEntry {
  speaker: 'user' | 'lumi';
  text: string;
  timestamp: number;
  [key: string]: unknown;
}

export const useSessionValidation = () => {
  // Lenient validation to capture meaningful conversations
  const MIN_CONVERSATION_DURATION = 1; // 1 second minimum
  const MIN_MESSAGES = 1; // At least 1 message

  const isConversationMeaningful = useCallback((transcript: TranscriptEntry[], duration: number) => {
    
    // Save if any message exists
    if (!transcript || transcript.length === 0) {
      return false;
    }

    // Check for any non-empty text
    const anyNonEmptyMessage = transcript.some(entry => 
      entry && entry.text && entry.text.trim().length > 0
    );

    if (!anyNonEmptyMessage) {
      return false;
    }

    return true;
  }, []); // Empty dependency array since we're not using the constants

  return {
    isConversationMeaningful
  };
};

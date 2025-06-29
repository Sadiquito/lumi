import { useCallback } from 'react';

export const useSessionValidation = () => {
  // Lenient validation to capture meaningful conversations
  const MIN_CONVERSATION_DURATION = 1; // 1 second minimum
  const MIN_MESSAGES = 1; // At least 1 message

  const isConversationMeaningful = useCallback((transcript: any[], duration: number) => {
    console.log('🔍 Session validation:', { 
      transcriptLength: transcript?.length || 0, 
      duration
    });

    // Save if any message exists
    if (!transcript || transcript.length === 0) {
      console.log('❌ No transcript - not saving');
      return false;
    }

    // Check for any non-empty text
    const anyNonEmptyMessage = transcript.some(entry => 
      entry && entry.text && entry.text.trim().length > 0
    );

    console.log('🔍 Message analysis:', {
      anyNonEmptyMessage,
      messageCount: transcript.length
    });

    if (!anyNonEmptyMessage) {
      console.log('❌ No non-empty messages - not saving');
      return false;
    }

    console.log('✅ Conversation validation passed - will save to database');
    return true;
  }, [MIN_CONVERSATION_DURATION, MIN_MESSAGES]);

  return {
    isConversationMeaningful
  };
};

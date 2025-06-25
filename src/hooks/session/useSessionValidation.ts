
import { useCallback } from 'react';

export const useSessionValidation = () => {
  // PHASE 3: Extremely lenient validation for debugging
  const MIN_CONVERSATION_DURATION = 1; // 1 second minimum (reduced for testing)
  const MIN_MESSAGES = 1; // At least 1 message (reduced for testing)

  const isConversationMeaningful = useCallback((transcript: any[], duration: number) => {
    console.log('🔍 PHASE 1 DEBUG - Session Validation:', { 
      transcriptLength: transcript?.length || 0, 
      duration,
      fullTranscript: transcript,
      validation: 'EXTREMELY_LENIENT_FOR_DEBUGGING'
    });

    // PHASE 3: Save if ANY message exists at all
    if (!transcript || transcript.length === 0) {
      console.log('❌ No transcript at all - not saving');
      return false;
    }

    // Check for any non-empty text
    const anyNonEmptyMessage = transcript.some(entry => 
      entry && entry.text && entry.text.trim().length > 0
    );

    console.log('🔍 PHASE 1 DEBUG - Message analysis:', {
      anyNonEmptyMessage,
      messages: transcript.map(entry => ({
        speaker: entry?.speaker,
        text: entry?.text,
        hasText: !!entry?.text,
        textLength: entry?.text?.length || 0
      }))
    });

    if (!anyNonEmptyMessage) {
      console.log('❌ No non-empty messages found - not saving');
      return false;
    }

    console.log('✅ PHASE 1 DEBUG - Conversation validation PASSED - will save to database');
    return true;
  }, [MIN_CONVERSATION_DURATION, MIN_MESSAGES]);

  return {
    isConversationMeaningful
  };
};

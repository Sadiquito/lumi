
import { useCallback } from 'react';

export const useSessionValidation = () => {
  // Reduced minimum requirements for better UX
  const MIN_CONVERSATION_DURATION = 5; // 5 seconds minimum (reduced from 10)
  const MIN_MESSAGES = 2; // At least 2 messages (1 user + 1 Lumi response)

  const isConversationMeaningful = useCallback((transcript: any[], duration: number) => {
    console.log('🔍 Validating conversation:', { 
      transcriptLength: transcript?.length || 0, 
      duration,
      transcript: transcript?.slice(0, 3) // Log first 3 entries for debugging
    });

    if (!transcript || transcript.length < MIN_MESSAGES) {
      console.log('❌ Conversation too short - not saving:', transcript?.length || 0, 'messages (need', MIN_MESSAGES, ')');
      return false;
    }

    if (duration < MIN_CONVERSATION_DURATION) {
      console.log('❌ Conversation duration too short - not saving:', duration, 'seconds (need', MIN_CONVERSATION_DURATION, ')');
      return false;
    }

    // Check if we have both user and lumi messages
    const userMessages = transcript.filter(entry => entry.speaker === 'user' && entry.text.trim().length > 0);
    const lumiMessages = transcript.filter(entry => entry.speaker === 'lumi' && entry.text.trim().length > 0);

    console.log('👥 Message breakdown:', { 
      userMessages: userMessages.length, 
      lumiMessages: lumiMessages.length,
      userTexts: userMessages.map(m => m.text.substring(0, 50) + '...'),
      lumiTexts: lumiMessages.map(m => m.text.substring(0, 50) + '...')
    });

    if (userMessages.length === 0 || lumiMessages.length === 0) {
      console.log('❌ Missing user or Lumi messages - not saving. User:', userMessages.length, 'Lumi:', lumiMessages.length);
      return false;
    }

    // More lenient meaningful content check
    const meaningfulMessages = transcript.filter(entry => 
      entry.text.trim().length > 3 // Reduced from 10 characters
    );

    if (meaningfulMessages.length === 0) {
      console.log('❌ No meaningful content found - not saving');
      return false;
    }

    console.log('✅ Conversation validation passed - will save to database');
    return true;
  }, [MIN_CONVERSATION_DURATION, MIN_MESSAGES]);

  return {
    isConversationMeaningful
  };
};


import { useCallback } from 'react';

export const useSessionValidation = () => {
  // Minimum conversation requirements
  const MIN_CONVERSATION_DURATION = 10; // 10 seconds minimum
  const MIN_MESSAGES = 2; // At least 2 messages (1 user + 1 Lumi response)

  const isConversationMeaningful = useCallback((transcript: any[], duration: number) => {
    if (!transcript || transcript.length < MIN_MESSAGES) {
      console.log('Conversation too short - not saving:', transcript?.length || 0, 'messages');
      return false;
    }

    if (duration < MIN_CONVERSATION_DURATION) {
      console.log('Conversation duration too short - not saving:', duration, 'seconds');
      return false;
    }

    // Check if we have both user and lumi messages
    const hasUserMessage = transcript.some(entry => entry.speaker === 'user' && entry.text.trim().length > 0);
    const hasLumiMessage = transcript.some(entry => entry.speaker === 'lumi' && entry.text.trim().length > 0);

    if (!hasUserMessage || !hasLumiMessage) {
      console.log('Missing user or Lumi messages - not saving. User:', hasUserMessage, 'Lumi:', hasLumiMessage);
      return false;
    }

    // Check for meaningful content (not just greetings)
    const meaningfulMessages = transcript.filter(entry => 
      entry.text.trim().length > 10 && // More than just "hello"
      !entry.text.toLowerCase().includes('hello') &&
      !entry.text.toLowerCase().includes('hi there')
    );

    if (meaningfulMessages.length === 0) {
      console.log('No meaningful content found - not saving');
      return false;
    }

    return true;
  }, [MIN_CONVERSATION_DURATION, MIN_MESSAGES]);

  return {
    isConversationMeaningful
  };
};


import { useConversationAnalysis } from './useConversationAnalysis';

export const useAIResponse = () => {
  const { triggerAnalysis } = useConversationAnalysis();

  const generateAIResponse = async (
    userInput: string,
    setThinkingProgress: (value: number | ((prev: number) => number)) => void,
    conversationId?: string
  ): Promise<string> => {
    setThinkingProgress(0);
    
    const thinkingInterval = setInterval(() => {
      setThinkingProgress(prev => Math.min(prev + 5, 90));
    }, 100);

    // Generate AI response using existing conversation context
    const mockResponse = `Thank you for sharing that with me. I can hear the thoughtfulness in your voice. Based on what you've said about "${userInput.slice(0, 50)}...", I think there's a lot to explore here. What aspect of this situation feels most important to you right now?`;
    
    clearInterval(thinkingInterval);
    setThinkingProgress(100);

    // Trigger conversation analysis after AI response is generated
    if (conversationId && userInput && mockResponse) {
      console.log('Triggering conversation analysis for conversation:', conversationId);
      
      // Use setTimeout to avoid blocking the response
      setTimeout(() => {
        triggerAnalysis(conversationId, userInput, mockResponse);
      }, 100);
    }
    
    return mockResponse;
  };

  return { generateAIResponse };
};

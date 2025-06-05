
export const useAIResponse = () => {
  const generateAIResponse = async (
    userInput: string,
    setThinkingProgress: (value: number | ((prev: number) => number)) => void
  ): Promise<string> => {
    setThinkingProgress(0);
    
    const thinkingInterval = setInterval(() => {
      setThinkingProgress(prev => Math.min(prev + 5, 90));
    }, 100);

    // Generate AI response using existing conversation context
    const mockResponse = `Thank you for sharing that with me. I can hear the thoughtfulness in your voice. Based on what you've said about "${userInput.slice(0, 50)}...", I think there's a lot to explore here. What aspect of this situation feels most important to you right now?`;
    
    clearInterval(thinkingInterval);
    setThinkingProgress(100);
    
    return mockResponse;
  };

  return { generateAIResponse };
};

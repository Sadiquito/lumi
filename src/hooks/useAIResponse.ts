
import { useConversationAnalysis } from './useConversationAnalysis';
import { type PersonaState } from '@/lib/persona-state';
import { LUMI_PERSONALITY, generateContextualResponse, detectEmotionalContext } from '@/utils/lumiPersonality';

export const useAIResponse = () => {
  const { triggerAnalysis } = useConversationAnalysis();

  const generateAIResponse = async (
    userInput: string,
    setThinkingProgress: (value: number | ((prev: number) => number)) => void,
    conversationId?: string,
    personaState?: PersonaState | null
  ): Promise<string> => {
    setThinkingProgress(0);
    
    const thinkingInterval = setInterval(() => {
      setThinkingProgress(prev => Math.min(prev + 5, 90));
    }, 100);

    // Detect emotional context for personalized response
    const emotionalContext = detectEmotionalContext(userInput);
    console.log('Detected emotional context:', emotionalContext);
    
    // Log persona state for AI context (placeholder for future AI integration)
    if (personaState) {
      console.log('Generating response with persona context:', {
        personaState,
        userInput: userInput.slice(0, 50) + '...',
        emotionalContext,
      });
      
      // TODO: Use persona state to inform AI response generation
      // - Previous conversation patterns
      // - User preferences and communication style
      // - Emotional state history
      // - Topics of interest
    }
    
    // Generate contextual system prompt (will be enhanced with persona data)
    const systemPrompt = generateContextualResponse(userInput, emotionalContext, 'reflection');
    
    // Generate AI response with Lumi's personality
    const responses = [
      `i can hear the thoughtfulness in what you're sharing. when you mention "${userInput.slice(0, 30)}...", it sounds like there's a lot happening beneath the surface. what feels most important to you about this right now?`,
      `thank you for trusting me with this. there's something really genuine in how you're describing this situation. i'm curious - what would it feel like if you could approach this with just a little more gentleness toward yourself?`,
      `it sounds like you're navigating something meaningful here. i notice how you're trying to make sense of this, and that takes real courage. what's one small thing that feels true for you in all of this?`,
      `i can sense the care you're putting into thinking about this. sometimes when we're in the middle of something complex, it can help to pause and ask - what does your inner wisdom already know about this situation?`,
      `there's something beautiful about how you're approaching this, even if it doesn't feel clear right now. what would it be like to trust that you're exactly where you need to be in figuring this out?`
    ];
    
    // Select response based on emotional context and persona (placeholder)
    let selectedResponse;
    if (emotionalContext === 'overwhelmed') {
      selectedResponse = `i can feel the weight of what you're carrying. it makes complete sense that you'd feel overwhelmed - there's a lot here. sometimes when everything feels like too much, it can help to focus on just this moment, just this breath. what's one small thing that feels manageable right now?`;
    } else if (emotionalContext === 'anxious') {
      selectedResponse = `i hear the anxiety in what you're sharing, and that's so understandable given what you're facing. anxiety often shows up when we care deeply about something. what would it feel like to acknowledge this worry as a part of you that's trying to protect something important?`;
    } else if (emotionalContext === 'sad') {
      selectedResponse = `i can sense the sadness in your words, and i want you to know that sadness has its place too. sometimes it's our heart's way of honoring what matters to us. i'm here with you in this feeling. what would it mean to be gentle with yourself right now?`;
    } else {
      // TODO: Use persona state to select more personalized responses
      selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    }
    
    clearInterval(thinkingInterval);
    setThinkingProgress(100);

    // Trigger conversation analysis after AI response is generated
    if (conversationId && userInput && selectedResponse) {
      console.log('Triggering conversation analysis for conversation:', conversationId);
      
      setTimeout(() => {
        triggerAnalysis(conversationId, userInput, selectedResponse);
      }, 100);
    }
    
    return selectedResponse;
  };

  return { generateAIResponse };
};

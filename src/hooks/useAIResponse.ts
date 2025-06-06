
import { useConversationAnalysis } from './useConversationAnalysis';
import { type PersonaState } from '@/lib/persona-state';
import { LUMI_PERSONALITY, generateContextualResponse, detectEmotionalContext } from '@/utils/lumiPersonality';
import { updatePersonaStateFromConversation } from '@/lib/updatePersonaState';
import { useAuth } from '@/components/SimpleAuthProvider';

export const useAIResponse = () => {
  const { triggerAnalysis } = useConversationAnalysis();
  const { user } = useAuth();

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
    
    // Log persona state for AI context
    if (personaState) {
      console.log('Generating response with persona context:', {
        preferred_name: personaState.preferred_name,
        tone_preferences: personaState.tone_preferences,
        reflection_focus: personaState.reflection_focus,
        personality_snapshot: personaState.personality_snapshot?.slice(0, 100) + '...',
        conversational_notes: personaState.conversational_notes,
        userInput: userInput.slice(0, 50) + '...',
        emotionalContext,
      });
    }
    
    // Generate contextual response using persona data
    const systemPrompt = generateContextualResponse(userInput, emotionalContext, 'reflection');
    
    // Generate AI response with Lumi's personality and persona awareness
    const responses = [
      `i can hear the thoughtfulness in what you're sharing. when you mention "${userInput.slice(0, 30)}...", it sounds like there's a lot happening beneath the surface. what feels most important to you about this right now?`,
      `thank you for trusting me with this. there's something really genuine in how you're describing this situation. i'm curious - what would it feel like if you could approach this with just a little more gentleness toward yourself?`,
      `it sounds like you're navigating something meaningful here. i notice how you're trying to make sense of this, and that takes real courage. what's one small thing that feels true for you in all of this?`,
      `i can sense the care you're putting into thinking about this. sometimes when we're in the middle of something complex, it can help to pause and ask - what does your inner wisdom already know about this situation?`,
      `there's something beautiful about how you're approaching this, even if it doesn't feel clear right now. what would it be like to trust that you're exactly where you need to be in figuring this out?`
    ];
    
    // Select response based on emotional context and persona preferences
    let selectedResponse;
    
    // Use preferred name if available
    const namePrefix = personaState?.preferred_name ? `${personaState.preferred_name}, ` : '';
    
    if (emotionalContext === 'overwhelmed') {
      selectedResponse = `${namePrefix}i can feel the weight of what you're carrying. it makes complete sense that you'd feel overwhelmed - there's a lot here. sometimes when everything feels like too much, it can help to focus on just this moment, just this breath. what's one small thing that feels manageable right now?`;
    } else if (emotionalContext === 'anxious') {
      selectedResponse = `${namePrefix}i hear the anxiety in what you're sharing, and that's so understandable given what you're facing. anxiety often shows up when we care deeply about something. what would it feel like to acknowledge this worry as a part of you that's trying to protect something important?`;
    } else if (emotionalContext === 'sad') {
      selectedResponse = `${namePrefix}i can sense the sadness in your words, and i want you to know that sadness has its place too. sometimes it's our heart's way of honoring what matters to us. i'm here with you in this feeling. what would it mean to be gentle with yourself right now?`;
    } else {
      // Use persona-aware response selection
      const baseResponse = responses[Math.floor(Math.random() * responses.length)];
      selectedResponse = namePrefix + baseResponse;
      
      // TODO: Further customize based on tone_preferences and reflection_focus
      if (personaState?.tone_preferences === 'playful') {
        // Could adjust tone here in future
      }
      if (personaState?.reflection_focus) {
        // Could guide conversation toward their focus area
      }
    }
    
    clearInterval(thinkingInterval);
    setThinkingProgress(100);

    // Update persona state after generating AI response
    if (user?.id && userInput && selectedResponse) {
      console.log('Updating persona state after conversation round');
      
      // Combine user input and AI response for context
      const conversationText = `User: ${userInput}\nLumi: ${selectedResponse}`;
      
      // Call persona state update in the background
      setTimeout(() => {
        updatePersonaStateFromConversation(
          user.id,
          conversationText,
          {
            user_message: userInput,
            ai_response: selectedResponse
          }
        ).then((result) => {
          if (result.success) {
            console.log('Persona state updated successfully:', result.updated_fields);
          } else {
            console.error('Failed to update persona state:', result.error);
          }
        });
      }, 100);
    }

    // Trigger conversation analysis after AI response is generated
    if (conversationId && userInput && selectedResponse) {
      console.log('Triggering conversation analysis for conversation:', conversationId);
      
      setTimeout(() => {
        triggerAnalysis(conversationId, userInput, selectedResponse);
      }, 200);
    }
    
    return selectedResponse;
  };

  return { generateAIResponse };
};

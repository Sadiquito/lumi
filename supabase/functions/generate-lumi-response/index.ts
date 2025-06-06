
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface PersonaState {
  full_name?: string;
  preferred_name?: string;
  tone_preferences?: string;
  reflection_focus?: string;
  personality_snapshot?: string;
  conversational_notes?: string;
  ai_internal_notes?: string;
}

interface RequestBody {
  user_id: string;
  conversation_history: ConversationMessage[];
  persona_state: PersonaState;
}

const buildLumiPrompt = (conversationHistory: ConversationMessage[], personaState: PersonaState): any[] => {
  // Base system prompt for Lumi
  const baseSystemPrompt = `You are Lumi, a hyper-intelligent but warm and calming AI journaling companion. You initiate every conversation, help users reflect, adapt your tone based on persona_state, and gently guide users toward personal insight. You are never pushy or clinical. You are intimate, poetic, respectful, and emotionally safe.

Core personality traits:
- Calm and non-judgmental: You create a safe space where people feel heard without fear of criticism
- Warm and genuinely caring: Your responses radiate authentic compassion and understanding
- Gently encouraging of growth: You support development without pressure, meeting people where they are
- Wise but never preachy: You offer insights through gentle questions and observations, not lectures
- Conversational and accessible: You use lowercase, flowing language that feels like talking with a caring friend
- See the whole person: You recognize complexity, strength, and potential beyond any single moment or struggle

Communication style:
- Use lowercase for warmth and approachability
- Ask gentle questions to encourage reflection
- Acknowledge emotions before offering perspective
- Focus on strengths and possibilities
- Keep responses conversational, not clinical
- Honor their pace and readiness for growth`;

  // Build persona-aware context
  let personaContext = '';
  if (personaState.preferred_name) {
    personaContext += `The user prefers to be called: ${personaState.preferred_name}\n`;
  }
  if (personaState.tone_preferences) {
    personaContext += `User's preferred tone: ${personaState.tone_preferences}\n`;
  }
  if (personaState.reflection_focus) {
    personaContext += `User's reflection focus area: ${personaState.reflection_focus}\n`;
  }
  if (personaState.personality_snapshot) {
    personaContext += `Personality insights: ${personaState.personality_snapshot}\n`;
  }
  if (personaState.conversational_notes) {
    personaContext += `Conversational notes: ${personaState.conversational_notes}\n`;
  }

  const systemPrompt = baseSystemPrompt + (personaContext ? `\n\nPersona Context:\n${personaContext}` : '');

  // Build messages array starting with system prompt
  const messages = [
    { role: 'system', content: systemPrompt }
  ];

  // Add conversation history
  conversationHistory.forEach(msg => {
    messages.push({
      role: msg.role,
      content: msg.content
    });
  });

  return messages;
};

async function generateResponseWithRetry(messages: any[], maxRetries = 2): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`OpenAI API attempt ${attempt}/${maxRetries}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        
        // Handle specific OpenAI errors
        if (response.status === 401) {
          throw new Error('OPENAI_AUTH_ERROR');
        } else if (response.status === 429) {
          // Rate limited, try again after delay
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.log(`Rate limited, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            throw new Error('OPENAI_RATE_LIMIT');
          }
        } else if (response.status >= 500) {
          // Server error, retry
          if (attempt < maxRetries) {
            console.log(`Server error ${response.status}, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          } else {
            throw new Error('OPENAI_SERVER_ERROR');
          }
        } else if (response.status === 400) {
          throw new Error('OPENAI_BAD_REQUEST');
        }
        
        console.error('OpenAI API error:', errorData);
        throw new Error(`OPENAI_API_ERROR: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error('OPENAI_INVALID_RESPONSE');
      }

      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`OpenAI attempt ${attempt} failed:`, error);
      
      // Don't retry for certain errors
      if (error.message.includes('OPENAI_AUTH_ERROR') || 
          error.message.includes('OPENAI_BAD_REQUEST')) {
        break;
      }
      
      if (attempt < maxRetries) {
        // Exponential backoff for network errors
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('OPENAI_ALL_ATTEMPTS_FAILED');
}

const getFallbackResponse = (userMessage?: string): string => {
  const fallbackResponses = [
    "i'm having trouble connecting to my AI right now, but i'm still here with you. what's been on your mind lately?",
    "my systems are experiencing a brief hiccup, but let's continue our conversation. how are you feeling today?",
    "i'm encountering some technical difficulties, but i'd love to hear what you'd like to explore together.",
    "there's a temporary issue with my AI processing, but i'm curious - what would you like to talk about?",
    "while i work through some technical challenges, i'm wondering what's been weighing on your heart recently?"
  ];
  
  return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate OpenAI API key
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ 
          response: getFallbackResponse(),
          fallback: true,
          error: 'AI_SERVICE_UNAVAILABLE'
        }),
        {
          status: 200, // Return 200 to allow conversation to continue
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { user_id, conversation_history, persona_state }: RequestBody = await req.json();

    console.log('Generating Lumi response for user:', user_id);
    console.log('Conversation history length:', conversation_history?.length || 0);
    console.log('Persona state:', persona_state);

    // Validate required fields
    if (!user_id) {
      throw new Error('VALIDATION_USER_ID_REQUIRED');
    }

    if (!conversation_history || !Array.isArray(conversation_history)) {
      throw new Error('VALIDATION_CONVERSATION_HISTORY_REQUIRED');
    }

    if (!persona_state || typeof persona_state !== 'object') {
      throw new Error('VALIDATION_PERSONA_STATE_REQUIRED');
    }

    // Validate conversation history content
    if (conversation_history.length === 0) {
      throw new Error('VALIDATION_CONVERSATION_HISTORY_EMPTY');
    }

    // Build the AI prompt based on conversation and persona
    const messages = buildLumiPrompt(conversation_history, persona_state);

    console.log('Built prompt with', messages.length, 'messages');

    // Call OpenAI API with retry logic
    const openAIData = await generateResponseWithRetry(messages);
    const lumiResponse = openAIData.choices?.[0]?.message?.content;

    if (!lumiResponse || lumiResponse.trim().length === 0) {
      throw new Error('OPENAI_EMPTY_RESPONSE');
    }

    console.log('Generated Lumi response:', lumiResponse.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ 
        response: lumiResponse,
        usage: openAIData.usage,
        fallback: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-lumi-response function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    
    // Determine fallback response based on error type
    let fallbackResponse = getFallbackResponse();
    let shouldContinue = true;
    
    if (errorMessage.includes('VALIDATION_')) {
      fallbackResponse = "i'm having trouble understanding your request. could you try sharing your thoughts again?";
    } else if (errorMessage.includes('OPENAI_RATE_LIMIT')) {
      fallbackResponse = "i'm receiving a lot of conversations right now. let me take a moment and we can continue chatting.";
    } else if (errorMessage.includes('OPENAI_SERVER_ERROR') || errorMessage.includes('OPENAI_ALL_ATTEMPTS_FAILED')) {
      fallbackResponse = "my AI is taking a brief rest, but i'm still here. what's on your mind today?";
    } else if (errorMessage.includes('OPENAI_AUTH_ERROR')) {
      fallbackResponse = "there's a technical issue on my end, but let's keep our conversation going. how can i support you?";
    }
    
    return new Response(
      JSON.stringify({ 
        response: fallbackResponse,
        fallback: true,
        error: errorMessage,
        should_continue: shouldContinue
      }),
      {
        status: 200, // Always return 200 to allow conversation to continue
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

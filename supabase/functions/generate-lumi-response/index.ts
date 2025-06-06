
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { user_id, conversation_history, persona_state }: RequestBody = await req.json();

    console.log('Generating Lumi response for user:', user_id);
    console.log('Conversation history length:', conversation_history?.length || 0);
    console.log('Persona state:', persona_state);

    // Validate required fields
    if (!user_id) {
      throw new Error('user_id is required');
    }

    if (!conversation_history || !Array.isArray(conversation_history)) {
      throw new Error('conversation_history must be an array');
    }

    if (!persona_state || typeof persona_state !== 'object') {
      throw new Error('persona_state must be an object');
    }

    // Build the AI prompt based on conversation and persona
    const messages = buildLumiPrompt(conversation_history, persona_state);

    console.log('Built prompt with', messages.length, 'messages');

    // Call OpenAI API
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const lumiResponse = openAIData.choices[0]?.message?.content;

    if (!lumiResponse) {
      throw new Error('No response generated from OpenAI');
    }

    console.log('Generated Lumi response:', lumiResponse.substring(0, 100) + '...');

    return new Response(
      JSON.stringify({ 
        response: lumiResponse,
        usage: openAIData.usage 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-lumi-response function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

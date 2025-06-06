
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  user_id: string;
  new_conversation_text: string;
  conversation_context?: {
    user_message: string;
    ai_response: string;
  };
}

interface PersonaState {
  full_name?: string;
  preferred_name?: string;
  tone_preferences?: string;
  reflection_focus?: string;
  personality_snapshot?: string;
  conversational_notes?: string;
  ai_internal_notes?: string;
  [key: string]: any;
}

const performAISummarization = async (
  currentState: PersonaState, 
  newConversationText: string,
  conversationContext?: { user_message: string; ai_response: string }
): Promise<Partial<PersonaState>> => {
  try {
    console.log('Starting AI summarization with OpenAI...');
    
    const systemPrompt = `You are Lumi's memory system. Your job is to gently update a user's psychological portrait based on their latest conversation. 

Current persona state:
- Personality Snapshot: ${currentState.personality_snapshot || 'No previous data'}
- Conversational Notes: ${currentState.conversational_notes || 'No previous data'}
- Tone Preferences: ${currentState.tone_preferences || 'No previous data'}
- Reflection Focus: ${currentState.reflection_focus || 'No previous data'}

Instructions:
1. Review the new conversation and identify key psychological insights
2. GENTLY evolve the personality_snapshot - add new insights while preserving valuable existing observations
3. Update conversational_notes with relevant communication patterns, preferences, and interaction style observations
4. Keep updates subtle and additive - don't overwrite good existing data
5. Focus on emotional patterns, communication style, values, goals, and personal growth areas
6. Maintain a warm, non-judgmental tone in all observations

Return a JSON object with only the fields that should be updated. If no meaningful updates are needed, return minimal changes.`;

    const userPrompt = `New conversation:
${newConversationText}

${conversationContext ? `
User said: "${conversationContext.user_message}"
Lumi responded: "${conversationContext.ai_response}"
` : ''}

Please provide thoughtful updates to help Lumi better understand and support this person. Focus on:
- What this conversation reveals about their personality, communication style, or current emotional state
- Any patterns in how they express themselves or what they care about
- Insights that would help Lumi provide more personalized support

Return only a JSON object with the fields to update.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiInsights = JSON.parse(data.choices[0].message.content);
    
    console.log('AI summarization successful:', aiInsights);

    // Add timestamp to track when insights were generated
    const timestamp = new Date().toISOString();
    const updatedInsights = {
      ...aiInsights,
      last_updated: timestamp,
    };

    // Ensure we don't overwrite existing good data - merge intelligently
    const safeUpdates: Partial<PersonaState> = {};
    
    if (aiInsights.personality_snapshot) {
      // Merge with existing personality snapshot
      const existing = currentState.personality_snapshot || '';
      safeUpdates.personality_snapshot = existing 
        ? `${existing}\n\n[${timestamp.slice(0, 10)}] ${aiInsights.personality_snapshot}`
        : aiInsights.personality_snapshot;
    }
    
    if (aiInsights.conversational_notes) {
      // Merge with existing conversational notes
      const existing = currentState.conversational_notes || '';
      safeUpdates.conversational_notes = existing
        ? `${existing}\n\n[${timestamp.slice(0, 10)}] ${aiInsights.conversational_notes}`
        : aiInsights.conversational_notes;
    }

    // Copy other fields directly
    Object.keys(aiInsights).forEach(key => {
      if (!['personality_snapshot', 'conversational_notes'].includes(key)) {
        safeUpdates[key] = aiInsights[key];
      }
    });

    safeUpdates.last_updated = timestamp;

    return safeUpdates;

  } catch (error) {
    console.error('AI summarization failed, falling back to basic updates:', error);
    
    // Fallback to basic timestamp update if AI fails
    return {
      last_updated: new Date().toISOString(),
      ai_internal_notes: `AI summarization failed at ${new Date().toISOString()}: ${error.message}`
    };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const { user_id, new_conversation_text, conversation_context }: RequestBody = await req.json();

    console.log('Updating persona state for user:', user_id);
    console.log('New conversation text length:', new_conversation_text?.length || 0);

    // Validate required fields
    if (!user_id) {
      throw new Error('user_id is required');
    }

    if (!new_conversation_text || new_conversation_text.trim().length === 0) {
      throw new Error('new_conversation_text is required and cannot be empty');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Retrieve current persona state
    const { data: currentPersonaData, error: fetchError } = await supabase
      .from('persona_state')
      .select('state_blob')
      .eq('user_id', user_id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching current persona state:', fetchError);
      throw new Error(`Failed to fetch persona state: ${fetchError.message}`);
    }

    const currentState: PersonaState = currentPersonaData?.state_blob || {};
    console.log('Current persona state keys:', Object.keys(currentState));

    // Generate new insights using AI summarization
    const newInsights = await performAISummarization(currentState, new_conversation_text, conversation_context);
    console.log('Generated AI insights:', newInsights);

    // Merge new insights with current state
    const updatedState: PersonaState = {
      ...currentState,
      ...newInsights,
    };

    // Update the persona state in the database
    const { error: updateError } = await supabase
      .from('persona_state')
      .upsert({
        user_id: user_id,
        state_blob: updatedState,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Error updating persona state:', updateError);
      throw new Error(`Failed to update persona state: ${updateError.message}`);
    }

    console.log('Persona state updated successfully with AI insights');

    return new Response(
      JSON.stringify({ 
        success: true,
        updated_fields: Object.keys(newInsights),
        persona_state: updatedState
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in update-persona-state function:', error);
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

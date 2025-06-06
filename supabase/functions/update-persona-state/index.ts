import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

const simulateAISummarization = (currentState: PersonaState, newConversationText: string): Partial<PersonaState> => {
  // Placeholder AI summarization logic
  const timestamp = new Date().toISOString();
  
  // Extract some basic patterns from the conversation (placeholder logic)
  const hasEmotionalContent = /feel|emotion|sad|happy|anxious|excited|worried/i.test(newConversationText);
  const hasGoalContent = /want|goal|hope|dream|plan|future/i.test(newConversationText);
  const hasRelationshipContent = /friend|family|partner|relationship|people/i.test(newConversationText);
  
  // Update personality snapshot with new insights
  let personalityUpdate = currentState.personality_snapshot || '';
  if (hasEmotionalContent) {
    personalityUpdate += ` [${timestamp.slice(0, 10)}] Shows emotional awareness and openness.`;
  }
  if (hasGoalContent) {
    personalityUpdate += ` [${timestamp.slice(0, 10)}] Demonstrates forward-thinking and goal orientation.`;
  }
  if (hasRelationshipContent) {
    personalityUpdate += ` [${timestamp.slice(0, 10)}] Values relationships and social connections.`;
  }
  
  // Update conversational notes
  const conversationLength = newConversationText.length;
  let conversationalNotes = currentState.conversational_notes || '';
  conversationalNotes += ` [${timestamp.slice(0, 10)}] Engaged in ${conversationLength > 200 ? 'detailed' : 'brief'} conversation.`;
  
  // Trim notes if they get too long (keep last 500 characters)
  if (conversationalNotes.length > 500) {
    conversationalNotes = '...' + conversationalNotes.slice(-497);
  }
  if (personalityUpdate.length > 1000) {
    personalityUpdate = '...' + personalityUpdate.slice(-997);
  }
  
  return {
    personality_snapshot: personalityUpdate.trim(),
    conversational_notes: conversationalNotes.trim(),
    last_updated: timestamp,
  };
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

    // Generate new insights using placeholder AI summarization
    const newInsights = simulateAISummarization(currentState, new_conversation_text);
    console.log('Generated insights:', newInsights);

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

    console.log('Persona state updated successfully');

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

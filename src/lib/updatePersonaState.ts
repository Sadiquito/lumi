
import { supabase } from '@/integrations/supabase/client';

export interface UpdatePersonaStateRequest {
  user_id: string;
  new_conversation_text: string;
  conversation_context?: {
    user_message: string;
    ai_response: string;
  };
}

export interface UpdatePersonaStateResponse {
  success: boolean;
  updated_fields: string[];
  persona_state: any;
  error?: string;
}

/**
 * Updates the persona state based on new conversation content
 */
export const updatePersonaStateFromConversation = async (
  userId: string,
  conversationText: string,
  context?: { user_message: string; ai_response: string }
): Promise<UpdatePersonaStateResponse> => {
  try {
    console.log('Calling update-persona-state function for user:', userId);
    
    const { data, error } = await supabase.functions.invoke('update-persona-state', {
      body: {
        user_id: userId,
        new_conversation_text: conversationText,
        conversation_context: context,
      },
    });

    if (error) {
      console.error('Error calling update-persona-state function:', error);
      throw error;
    }

    console.log('Persona state update response:', data);
    return data;

  } catch (error) {
    console.error('Failed to update persona state:', error);
    return {
      success: false,
      updated_fields: [],
      persona_state: null,
      error: error.message || 'Unknown error occurred'
    };
  }
};

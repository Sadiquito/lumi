
import { supabase } from '@/integrations/supabase/client';

export interface ConversationData {
  transcript: string;
  ai_response: string;
}

export interface SavedConversation {
  id: string;
  transcript: string;
  ai_response: string;
  created_at: string;
  user_id: string;
}

/**
 * Saves a completed conversation to the database
 */
export const saveConversation = async (conversationData: ConversationData): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        transcript: conversationData.transcript,
        ai_response: conversationData.ai_response,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error saving conversation:', error);
      return null;
    }

    console.log('Conversation saved successfully with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error in saveConversation:', error);
    return null;
  }
};

/**
 * Retrieves conversation history for the current user
 */
export const getConversationHistory = async (limit: number = 10): Promise<SavedConversation[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    return [];
  }
};

/**
 * Gets a specific conversation by ID
 */
export const getConversationById = async (conversationId: string): Promise<SavedConversation | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getConversationById:', error);
    return null;
  }
};

/**
 * Deletes a conversation by ID
 */
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    console.log('Conversation deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    return false;
  }
};


import { supabase } from '@/integrations/supabase/client';

export interface PersonaState {
  full_name?: string;
  preferred_name?: string;
  tone_preferences?: string; // e.g. "warm and encouraging", "playful"
  reflection_focus?: string; // e.g. "career growth", "relationships", "self-confidence"
  personality_snapshot?: string; // Lumi's ongoing psychological synthesis of user
  conversational_notes?: string; // lightweight notes Lumi uses to guide tone and pacing
  ai_internal_notes?: string; // optional metadata for Lumi's internal AI system to track key facts
  [key: string]: any; // Allow for additional dynamic fields
}

/**
 * Reads the persona state for the current logged-in user
 */
export const getPersonaState = async (): Promise<PersonaState | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('persona_state')
      .select('state_blob')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching persona state:', error);
      return null;
    }

    return (data?.state_blob as PersonaState) || {};
  } catch (error) {
    console.error('Error in getPersonaState:', error);
    return null;
  }
};

/**
 * Updates the persona state for the current logged-in user
 */
export const updatePersonaState = async (newState: PersonaState): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('persona_state')
      .upsert({
        user_id: user.id,
        state_blob: newState,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating persona state:', error);
      return false;
    }

    console.log('Persona state updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updatePersonaState:', error);
    return false;
  }
};

/**
 * Merges new data into existing persona state
 */
export const mergePersonaState = async (partialState: Partial<PersonaState>): Promise<boolean> => {
  try {
    const currentState = await getPersonaState();
    const mergedState = { ...currentState, ...partialState };
    return await updatePersonaState(mergedState);
  } catch (error) {
    console.error('Error in mergePersonaState:', error);
    return false;
  }
};

/**
 * Helper function to get a specific persona field
 */
export const getPersonaField = async (fieldName: keyof PersonaState): Promise<any> => {
  const state = await getPersonaState();
  return state?.[fieldName] || null;
};

/**
 * Helper function to update a specific persona field
 */
export const updatePersonaField = async (fieldName: keyof PersonaState, value: any): Promise<boolean> => {
  return await mergePersonaState({ [fieldName]: value });
};

/**
 * Initialize default persona state for new users
 */
export const initializePersonaState = async (): Promise<boolean> => {
  const defaultState: PersonaState = {
    full_name: '',
    preferred_name: '',
    tone_preferences: 'warm and encouraging',
    reflection_focus: '',
    personality_snapshot: '',
    conversational_notes: '',
    ai_internal_notes: ''
  };
  
  return await updatePersonaState(defaultState);
};

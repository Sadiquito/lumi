
import { supabase } from '@/integrations/supabase/client';

export interface PersonaState {
  [key: string]: any;
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

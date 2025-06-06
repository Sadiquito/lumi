
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';
import { getPersonaState, updatePersonaState, mergePersonaState, type PersonaState } from '@/lib/persona-state';
import { useToast } from '@/hooks/use-toast';

export const usePersonaState = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [personaState, setPersonaState] = useState<PersonaState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPersonaState = useCallback(async () => {
    if (!user?.id) {
      setPersonaState(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const state = await getPersonaState();
      setPersonaState(state || {});
      console.log('Persona state loaded:', state);
    } catch (error) {
      const errorMessage = 'Failed to load persona state';
      console.error(errorMessage, error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  const updatePersona = useCallback(async (updates: Partial<PersonaState>) => {
    if (!user?.id) return false;

    try {
      const success = await mergePersonaState(updates);
      if (success) {
        setPersonaState(prev => ({ ...prev, ...updates }));
        console.log('Persona state updated:', updates);
      }
      return success;
    } catch (error) {
      console.error('Failed to update persona state:', error);
      toast({
        title: "Error",
        description: "Failed to update persona state",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, toast]);

  const resetPersonaState = useCallback(async () => {
    if (!user?.id) return false;

    try {
      const success = await updatePersonaState({});
      if (success) {
        setPersonaState({});
        console.log('Persona state reset');
      }
      return success;
    } catch (error) {
      console.error('Failed to reset persona state:', error);
      return false;
    }
  }, [user?.id]);

  // Load persona state when user changes
  useEffect(() => {
    loadPersonaState();
  }, [loadPersonaState]);

  return {
    personaState,
    isLoading,
    error,
    loadPersonaState,
    updatePersona,
    resetPersonaState,
    hasPersonaData: personaState && Object.keys(personaState).length > 0,
  };
};

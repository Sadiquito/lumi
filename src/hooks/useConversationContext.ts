
import { useState, useCallback, useEffect } from 'react';
import { usePersonaState } from './usePersonaState';
import { type PersonaState } from '@/lib/persona-state';
import { updatePersonaStateFromConversation } from '@/lib/updatePersonaState';
import { useAuth } from '@/components/SimpleAuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface ConversationContext {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  totalDuration: number;
  topics: string[];
  personaState: PersonaState | null;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

interface UseConversationContextProps {
  sessionId?: string;
}

export const useConversationContext = ({ sessionId }: UseConversationContextProps = {}) => {
  const { personaState, isLoading: personaLoading, updatePersona } = usePersonaState();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [context, setContext] = useState<ConversationContext>({
    sessionId: sessionId || `session_${Date.now()}`,
    startTime: new Date(),
    lastActivity: new Date(),
    messageCount: 0,
    totalDuration: 0,
    topics: [],
    personaState: null,
    conversationHistory: [],
  });

  // Update context when persona state changes
  useEffect(() => {
    setContext(prev => ({
      ...prev,
      personaState,
    }));
  }, [personaState]);

  const updateContext = useCallback((updates: Partial<ConversationContext>) => {
    setContext(prev => ({
      ...prev,
      ...updates,
      lastActivity: new Date(),
    }));
  }, []);

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setContext(prev => {
      const newHistory = [
        ...prev.conversationHistory,
        {
          role,
          content,
          timestamp: new Date(),
        }
      ];

      console.log('Adding message to conversation history:', { role, content: content.substring(0, 100) + '...' });

      // Trigger persona state update when we have a complete user-assistant exchange
      if (user?.id && newHistory.length >= 2) {
        const lastTwoMessages = newHistory.slice(-2);
        if (lastTwoMessages[0].role === 'user' && lastTwoMessages[1].role === 'assistant') {
          const userMessage = lastTwoMessages[0].content;
          const aiMessage = lastTwoMessages[1].content;
          const conversationText = `User: ${userMessage}\nLumi: ${aiMessage}`;
          
          console.log('Triggering persona state update with conversation:', {
            userMessage: userMessage.substring(0, 50) + '...',
            aiMessage: aiMessage.substring(0, 50) + '...',
            userId: user.id
          });
          
          // Update persona state in background - don't await to avoid blocking UI
          updatePersonaStateFromConversation(
            user.id,
            conversationText,
            {
              user_message: userMessage,
              ai_response: aiMessage
            }
          ).then((result) => {
            if (result.success) {
              console.log('Persona state updated successfully:', {
                updatedFields: result.updated_fields,
                databaseUpdated: result.database_updated
              });
              
              // Show success toast
              toast({
                title: "Profile Updated",
                description: "Your conversation has been used to enhance Lumi's understanding of you.",
                duration: 3000,
              });

              // Refresh the persona state to reflect changes
              // This will trigger a re-fetch of persona data
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              console.warn('Persona state update failed:', result.error);
              
              // Only show error toast if it's not a fallback scenario
              if (!result.fallback) {
                toast({
                  title: "Profile Update Failed",
                  description: "Unable to update your profile. Conversation will continue normally.",
                  variant: "destructive",
                  duration: 5000,
                });
              }
            }
          }).catch((error) => {
            console.error('Error calling persona state update:', error);
            toast({
              title: "Profile Update Error",
              description: "An error occurred while updating your profile.",
              variant: "destructive",
              duration: 5000,
            });
          });
        }
      }

      return {
        ...prev,
        messageCount: prev.messageCount + 1,
        lastActivity: new Date(),
        conversationHistory: newHistory,
      };
    });
  }, [user?.id, toast]);

  const updatePersonaFromConversation = useCallback(async (insights: Partial<PersonaState>) => {
    console.log('Updating persona with manual insights:', insights);
    const success = await updatePersona(insights);
    if (success) {
      console.log('Manual persona update successful:', insights);
    } else {
      console.warn('Manual persona update failed:', insights);
    }
    return success;
  }, [updatePersona]);

  const resetContext = useCallback(() => {
    console.log('Resetting conversation context');
    setContext({
      sessionId: `session_${Date.now()}`,
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      totalDuration: 0,
      topics: [],
      personaState,
      conversationHistory: [],
    });
  }, [personaState]);

  return {
    context,
    updateContext,
    addMessage,
    resetContext,
    updatePersonaFromConversation,
    isPersonaLoading: personaLoading,
    hasPersonaData: personaState && Object.keys(personaState).length > 0,
  };
};

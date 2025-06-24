
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useSessionAnalysis = () => {
  const { user } = useAuth();

  const generateSessionSummary = useCallback(async (transcript: any[], userEndCommand?: string) => {
    if (!transcript.length) return null;

    try {
      console.log('Generating session summary and reflection...');

      // Prepare conversation text for analysis
      const conversationText = transcript
        .map(entry => `${entry.speaker}: ${entry.text}`)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('lumi-conversation', {
        body: {
          userTranscript: userEndCommand || 'Please provide a session summary and reflection',
          userId: user?.id,
          isSessionEnd: true,
          fullTranscript: conversationText,
          requestType: 'session_summary'
        }
      });

      if (error) {
        console.error('Error generating session summary:', error);
        return null;
      }

      return {
        summary: data.sessionSummary || 'Had a meaningful conversation today.',
        reflection: data.lumiReflection || 'Thank you for sharing your thoughts with me today.',
        followUpQuestion: data.followUpQuestion || 'What would you like to explore in our next conversation?'
      };

    } catch (error) {
      console.error('Error in generateSessionSummary:', error);
      return null;
    }
  }, [user]);

  return {
    generateSessionSummary
  };
};

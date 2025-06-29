import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TranscriptEntry {
  speaker: 'user' | 'lumi';
  text: string;
  timestamp: number;
  [key: string]: unknown;
}

interface SessionAnalysisResult {
  summary: string;
  reflection: string;
  followUpQuestion: string;
}

interface AnalysisResponse {
  sessionSummary?: string;
  lumiReflection?: string;
  followUpQuestion?: string;
}

export const useSessionAnalysis = () => {
  const { user } = useAuth();

  const generateSessionSummary = useCallback(async (transcript: TranscriptEntry[], userEndCommand?: string): Promise<SessionAnalysisResult | null> => {
    if (!transcript.length) return null;

    try {
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
        return null;
      }

      const analysisData = data as AnalysisResponse;

      return {
        summary: analysisData.sessionSummary || 'Had a meaningful conversation today.',
        reflection: analysisData.lumiReflection || 'Thank you for sharing your thoughts with me today.',
        followUpQuestion: analysisData.followUpQuestion || 'What would you like to explore in our next conversation?'
      };

    } catch (error) {
      return null;
    }
  }, [user]);

  return {
    generateSessionSummary
  };
};

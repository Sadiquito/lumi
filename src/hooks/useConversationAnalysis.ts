
import { useCallback } from 'react';
import { usePsychologicalPortrait } from './usePsychologicalPortrait';

interface UseConversationAnalysisProps {
  enabled?: boolean;
}

export const useConversationAnalysis = ({ enabled = true }: UseConversationAnalysisProps = {}) => {
  const { analyzeConversation, isAnalyzing } = usePsychologicalPortrait();

  const triggerAnalysis = useCallback(async (
    conversationId: string,
    transcript: string,
    aiResponse: string
  ) => {
    if (!enabled) {
      console.log('Conversation analysis is disabled');
      return;
    }

    if (!conversationId || !transcript || !aiResponse) {
      console.warn('Missing required data for conversation analysis');
      return;
    }

    try {
      console.log('Triggering conversation analysis for:', conversationId);
      analyzeConversation({
        conversationId,
        transcript,
        aiResponse,
      });
    } catch (error) {
      console.error('Failed to trigger conversation analysis:', error);
    }
  }, [analyzeConversation, enabled]);

  return {
    triggerAnalysis,
    isAnalyzing,
  };
};

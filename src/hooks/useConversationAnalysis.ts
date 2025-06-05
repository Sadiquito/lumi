
import { useCallback } from 'react';
import { usePsychologicalPortrait } from './usePsychologicalPortrait';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface UseConversationAnalysisProps {
  enabled?: boolean;
  respectPrivacySettings?: boolean;
}

export const useConversationAnalysis = ({ 
  enabled = true, 
  respectPrivacySettings = true 
}: UseConversationAnalysisProps = {}) => {
  const { analyzeConversation, isAnalyzing } = usePsychologicalPortrait();
  const { user } = useAuth();
  const { toast } = useToast();

  const triggerAnalysis = useCallback(async (
    conversationId: string,
    transcript: string,
    aiResponse: string
  ) => {
    if (!enabled) {
      console.log('Conversation analysis is disabled');
      return;
    }

    if (!user?.id) {
      console.warn('User not authenticated - skipping analysis');
      return;
    }

    if (!conversationId || !transcript || !aiResponse) {
      console.warn('Missing required data for conversation analysis');
      return;
    }

    // Check user's privacy preferences if respectPrivacySettings is true
    if (respectPrivacySettings) {
      try {
        // This would check user preferences - for now we'll assume consent
        const hasConsent = true; // In real implementation, check user_preferences
        
        if (!hasConsent) {
          console.log('User has not consented to psychological analysis');
          return;
        }
      } catch (error) {
        console.error('Failed to check privacy settings:', error);
        return;
      }
    }

    try {
      console.log('Triggering conversation analysis for:', conversationId);
      
      // Add privacy-aware metadata to the analysis
      analyzeConversation({
        conversationId,
        transcript,
        aiResponse,
        metadata: {
          userId: user.id,
          timestamp: new Date().toISOString(),
          privacyConsent: respectPrivacySettings,
          analysisVersion: '1.0'
        }
      });

      // Optional: Notify user about analysis
      if (process.env.NODE_ENV === 'development') {
        toast({
          title: "Psychological Analysis",
          description: "Your conversation has been analyzed to improve future interactions.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Failed to trigger conversation analysis:', error);
      
      // Don't show error to user unless critical
      if (process.env.NODE_ENV === 'development') {
        toast({
          title: "Analysis Error",
          description: "Failed to analyze conversation for insights.",
          variant: "destructive",
        });
      }
    }
  }, [analyzeConversation, enabled, respectPrivacySettings, user?.id, toast]);

  return {
    triggerAnalysis,
    isAnalyzing,
  };
};

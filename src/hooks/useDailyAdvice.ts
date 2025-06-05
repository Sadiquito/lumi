
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export const useDailyAdvice = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check user's privacy settings before generating advice
  const { data: privacySettings } = useQuery({
    queryKey: ['privacy-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('privacy_settings')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.privacy_settings || {
        psychological_analysis_consent: true,
        personalization_level: 'moderate',
        data_retention_days: 365
      };
    },
    enabled: !!user?.id,
  });

  const generateDailyAdvice = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Check if user has consented to psychological analysis
      const hasConsent = privacySettings?.psychological_analysis_consent !== false;
      const personalizationLevel = privacySettings?.personalization_level || 'moderate';

      console.log('Generating daily advice for user:', user.id, {
        hasConsent,
        personalizationLevel,
      });
      
      const { data, error } = await supabase.functions.invoke('generate-daily-advice', {
        body: {
          userId: user.id,
          privacySettings: {
            hasConsent,
            personalizationLevel,
            respectPrivacy: true,
          },
        },
      });

      if (error) {
        console.error('Daily advice generation error:', error);
        throw error;
      }

      console.log('Daily advice result:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate daily advice queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['daily-advice', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to generate daily advice:', error);
    },
  });

  return {
    generateDailyAdvice: generateDailyAdvice.mutate,
    isGenerating: generateDailyAdvice.isPending,
    generationError: generateDailyAdvice.error,
    privacySettings,
  };
};

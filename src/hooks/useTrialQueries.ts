
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTrialQueries = (userId: string | undefined) => {
  // Enhanced trial status loading with better error handling
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user-data', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('subscription_status, trial_start_date, created_at')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to fetch user subscription data');
      }
    },
    enabled: !!userId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Enhanced trial status check with timezone and grace period handling
  const { data: trialStatusData, isLoading: enhancedTrialLoading, error: trialStatusError } = useQuery({
    queryKey: ['enhanced-trial-status', userId, userData?.trial_start_date],
    queryFn: async () => {
      if (!userId || !userData) return null;
      
      try {
        // Use existing functions for now
        const { data: isExpired, error: expiredError } = await supabase
          .rpc('is_trial_expired', { user_id: userId });
        
        if (expiredError) throw expiredError;

        const { data: daysRemaining, error: daysError } = await supabase
          .rpc('get_trial_days_remaining', { user_id: userId });
        
        if (daysError) throw daysError;

        // Calculate grace period status locally for now
        let isInGracePeriod = false;
        let gracePeriodEndsAt = null;
        
        if (userData.trial_start_date && isExpired) {
          const startDate = new Date(userData.trial_start_date);
          const graceEndDate = new Date(startDate);
          graceEndDate.setDate(graceEndDate.getDate() + 8); // 7 days trial + 1 day grace
          
          const now = new Date();
          if (now < graceEndDate) {
            isInGracePeriod = true;
            gracePeriodEndsAt = graceEndDate.toISOString();
          }
        }

        // Calculate trial end date with timezone consideration
        let trialEndDate = null;
        if (userData.trial_start_date) {
          const startDate = new Date(userData.trial_start_date);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 7);
          trialEndDate = endDate.toISOString();
        }

        return {
          isTrialExpired: isExpired || false,
          daysRemaining: Math.max(0, daysRemaining || 0),
          trialEndDate,
          isInGracePeriod,
          gracePeriodEndsAt,
        };
      } catch (error) {
        console.error('Error checking trial status:', error);
        throw new Error('Failed to check trial status');
      }
    },
    enabled: !!userId && !!userData,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: hasPremiumAccess, isLoading: premiumAccessLoading } = useQuery({
    queryKey: ['premium-access', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      try {
        const { data, error } = await supabase
          .rpc('has_premium_access', { user_id: userId });
        
        if (error) throw error;
        return data || false;
      } catch (error) {
        console.error('Error checking premium access:', error);
        // Fallback: allow access if we can't check (degraded gracefully)
        return true;
      }
    },
    enabled: !!userId,
    retry: 1,
  });

  const { data: canUseTTS, isLoading: ttsLoading } = useQuery({
    queryKey: ['can-use-tts', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      try {
        const { data, error } = await supabase
          .rpc('can_use_tts', { user_id: userId });
        
        if (error) throw error;
        return data || false;
      } catch (error) {
        console.error('Error checking TTS access:', error);
        return false;
      }
    },
    enabled: !!userId,
  });

  const { data: canUseAIAdvice, isLoading: aiAdviceLoading } = useQuery({
    queryKey: ['can-use-ai-advice', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      try {
        const { data, error } = await supabase
          .rpc('can_use_ai_advice', { user_id: userId });
        
        if (error) throw error;
        return data || false;
      } catch (error) {
        console.error('Error checking AI advice access:', error);
        return false;
      }
    },
    enabled: !!userId,
  });

  const allQueriesLoading = userLoading || enhancedTrialLoading || 
                           premiumAccessLoading || ttsLoading || aiAdviceLoading;

  // Collect any errors
  const error = userError?.message || trialStatusError?.message || null;

  return {
    userData,
    trialStatusData,
    hasPremiumAccess,
    canUseTTS,
    canUseAIAdvice,
    isLoading: allQueriesLoading,
    error,
  };
};

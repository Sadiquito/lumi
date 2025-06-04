
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

interface TrialStatus {
  isTrialExpired: boolean;
  daysRemaining: number;
  hasPremiumAccess: boolean;
  canUseTTS: boolean;
  canUseAIAdvice: boolean;
  subscriptionStatus: string;
  trialStartDate: string | null;
  trialEndDate: string | null;
  isInGracePeriod: boolean;
  gracePeriodEndsAt: string | null;
  isLoading: boolean;
  error: string | null;
}

export const useTrialStatus = (): TrialStatus => {
  const { user } = useAuth();

  // Fetch user data and trial status with error handling
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('subscription_status, trial_start_date')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching user data:', error);
        throw new Error('Failed to fetch user subscription data');
      }
    },
    enabled: !!user?.id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Enhanced trial status check with timezone and grace period handling
  const { data: trialStatusData, isLoading: trialStatusLoading, error: trialStatusError } = useQuery({
    queryKey: ['enhanced-trial-status', user?.id, userData?.trial_start_date],
    queryFn: async () => {
      if (!user?.id || !userData) return null;
      
      try {
        // Use server-side function to ensure timezone-accurate calculations
        const { data: isExpired, error: expiredError } = await supabase
          .rpc('is_trial_expired_with_grace', { user_id: user.id });
        
        if (expiredError) throw expiredError;

        const { data: daysRemaining, error: daysError } = await supabase
          .rpc('get_trial_days_remaining_precise', { user_id: user.id });
        
        if (daysError) throw daysError;

        const { data: gracePeriodStatus, error: graceError } = await supabase
          .rpc('get_grace_period_status', { user_id: user.id });
        
        if (graceError) throw graceError;

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
          isInGracePeriod: gracePeriodStatus?.is_in_grace_period || false,
          gracePeriodEndsAt: gracePeriodStatus?.grace_period_ends_at || null,
        };
      } catch (error) {
        console.error('Error checking trial status:', error);
        throw new Error('Failed to check trial status');
      }
    },
    enabled: !!user?.id && !!userData,
    retry: 2,
    retryDelay: 1000,
  });

  // Check premium access with fallback
  const { data: hasPremiumAccess, isLoading: premiumAccessLoading } = useQuery({
    queryKey: ['premium-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        const { data, error } = await supabase
          .rpc('has_premium_access_with_grace', { user_id: user.id });
        
        if (error) throw error;
        return data || false;
      } catch (error) {
        console.error('Error checking premium access:', error);
        // Fallback: allow access if we can't check (degraded gracefully)
        return true;
      }
    },
    enabled: !!user?.id,
    retry: 1,
  });

  // Check TTS access
  const { data: canUseTTS, isLoading: ttsLoading } = useQuery({
    queryKey: ['can-use-tts', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        const { data, error } = await supabase
          .rpc('can_use_tts', { user_id: user.id });
        
        if (error) throw error;
        return data || false;
      } catch (error) {
        console.error('Error checking TTS access:', error);
        return false;
      }
    },
    enabled: !!user?.id,
  });

  // Check AI advice access
  const { data: canUseAIAdvice, isLoading: aiAdviceLoading } = useQuery({
    queryKey: ['can-use-ai-advice', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        const { data, error } = await supabase
          .rpc('can_use_ai_advice', { user_id: user.id });
        
        if (error) throw error;
        return data || false;
      } catch (error) {
        console.error('Error checking AI advice access:', error);
        return false;
      }
    },
    enabled: !!user?.id,
  });

  const isLoading = userLoading || trialStatusLoading || premiumAccessLoading || 
                   ttsLoading || aiAdviceLoading;

  // Collect any errors
  const error = userError?.message || trialStatusError?.message || null;

  return {
    isTrialExpired: trialStatusData?.isTrialExpired || false,
    daysRemaining: trialStatusData?.daysRemaining || 0,
    hasPremiumAccess: hasPremiumAccess || false,
    canUseTTS: canUseTTS || false,
    canUseAIAdvice: canUseAIAdvice || false,
    subscriptionStatus: userData?.subscription_status || 'trial',
    trialStartDate: userData?.trial_start_date || null,
    trialEndDate: trialStatusData?.trialEndDate || null,
    isInGracePeriod: trialStatusData?.isInGracePeriod || false,
    gracePeriodEndsAt: trialStatusData?.gracePeriodEndsAt || null,
    isLoading,
    error,
  };
};

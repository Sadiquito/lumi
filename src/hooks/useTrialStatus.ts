
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
  isLoading: boolean;
}

export const useTrialStatus = (): TrialStatus => {
  const { user } = useAuth();

  // Fetch user data and trial status
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user-data', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('subscription_status, trial_start_date')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Check if trial is expired
  const { data: isTrialExpired, isLoading: trialExpiredLoading } = useQuery({
    queryKey: ['trial-expired', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .rpc('is_trial_expired', { user_id: user.id });
      
      if (error) throw error;
      return data || false;
    },
    enabled: !!user?.id,
  });

  // Get days remaining in trial
  const { data: daysRemaining, isLoading: daysRemainingLoading } = useQuery({
    queryKey: ['trial-days-remaining', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      
      const { data, error } = await supabase
        .rpc('get_trial_days_remaining', { user_id: user.id });
      
      if (error) throw error;
      return data || 0;
    },
    enabled: !!user?.id,
  });

  // Check if user has premium access
  const { data: hasPremiumAccess, isLoading: premiumAccessLoading } = useQuery({
    queryKey: ['premium-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .rpc('has_premium_access', { user_id: user.id });
      
      if (error) throw error;
      return data || false;
    },
    enabled: !!user?.id,
  });

  // Check TTS access
  const { data: canUseTTS, isLoading: ttsLoading } = useQuery({
    queryKey: ['can-use-tts', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .rpc('can_use_tts', { user_id: user.id });
      
      if (error) throw error;
      return data || false;
    },
    enabled: !!user?.id,
  });

  // Check AI advice access
  const { data: canUseAIAdvice, isLoading: aiAdviceLoading } = useQuery({
    queryKey: ['can-use-ai-advice', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .rpc('can_use_ai_advice', { user_id: user.id });
      
      if (error) throw error;
      return data || false;
    },
    enabled: !!user?.id,
  });

  const isLoading = userLoading || trialExpiredLoading || daysRemainingLoading || 
                   premiumAccessLoading || ttsLoading || aiAdviceLoading;

  return {
    isTrialExpired: isTrialExpired || false,
    daysRemaining: daysRemaining || 0,
    hasPremiumAccess: hasPremiumAccess || false,
    canUseTTS: canUseTTS || false,
    canUseAIAdvice: canUseAIAdvice || false,
    subscriptionStatus: userData?.subscription_status || 'trial',
    trialStartDate: userData?.trial_start_date || null,
    isLoading,
  };
};

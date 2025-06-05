
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ActivityData {
  activity_date: string;
  activity_type: string;
  total_users: number;
  total_activities: number;
}

interface ConversionData {
  conversion_date: string;
  conversion_type: string;
  conversion_count: number;
  avg_days_to_conversion: number;
}

interface HealthData {
  metric_name: string;
  metric_date: string;
  avg_value: number;
  min_value: number;
  max_value: number;
  data_points: number;
}

export const useAnalytics = (isAdmin: boolean) => {
  // User activity analytics
  const { data: userActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['admin-user-activity'],
    queryFn: async (): Promise<ActivityData[]> => {
      const { data, error } = await supabase.rpc('get_daily_user_activity');
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Trial conversion analytics
  const { data: trialConversions, isLoading: isLoadingConversions } = useQuery({
    queryKey: ['admin-trial-conversions'],
    queryFn: async (): Promise<ConversionData[]> => {
      const { data, error } = await supabase.rpc('get_trial_conversion_stats');
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 5 * 60 * 1000,
  });

  // System health metrics
  const { data: systemHealth, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async (): Promise<HealthData[]> => {
      const { data, error } = await supabase.rpc('get_system_health_metrics');
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for health data
  });

  // Enhanced activity tracking functions
  const trackActivity = async (activityType: string) => {
    try {
      await supabase.rpc('track_user_activity', { activity_type: activityType });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  // Track conversation frequency (aggregated)
  const trackConversation = async (conversationLength: number) => {
    try {
      await trackActivity('conversation');
      // Track conversation quality metrics
      await supabase.rpc('track_user_activity', { 
        activity_type: conversationLength > 100 ? 'long_conversation' : 'short_conversation' 
      });
    } catch (error) {
      console.error('Error tracking conversation:', error);
    }
  };

  // Track trial conversion
  const trackTrialConversion = async (conversionType: 'subscription' | 'cancellation') => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('trial_start_date')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (userData?.trial_start_date) {
        const daysToConversion = Math.floor(
          (new Date().getTime() - new Date(userData.trial_start_date).getTime()) / (1000 * 60 * 60 * 24)
        );

        await supabase.from('trial_conversions').insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          trial_start_date: userData.trial_start_date,
          conversion_date: new Date().toISOString(),
          conversion_type: conversionType,
          days_to_conversion: daysToConversion,
        });
      }
    } catch (error) {
      console.error('Error tracking trial conversion:', error);
    }
  };

  // Track feature usage
  const trackFeatureUsage = async (feature: string) => {
    try {
      await trackActivity(`feature_${feature}`);
    } catch (error) {
      console.error('Error tracking feature usage:', error);
    }
  };

  // Track AI personalization effectiveness
  const trackPersonalizationEvent = async (eventType: 'advice_generated' | 'advice_rated' | 'portrait_updated') => {
    try {
      await trackActivity(`personalization_${eventType}`);
    } catch (error) {
      console.error('Error tracking personalization event:', error);
    }
  };

  // Track system health metrics
  const trackSystemHealth = async (metricName: string, value: number) => {
    try {
      await supabase.from('system_health').insert({
        metric_name: metricName,
        metric_value: value,
      });
    } catch (error) {
      console.error('Error tracking system health:', error);
    }
  };

  return {
    userActivity: userActivity || [],
    trialConversions: trialConversions || [],
    systemHealth: systemHealth || [],
    isLoadingActivity,
    isLoadingConversions,
    isLoadingHealth,
    // Enhanced tracking functions
    trackActivity,
    trackConversation,
    trackTrialConversion,
    trackFeatureUsage,
    trackPersonalizationEvent,
    trackSystemHealth,
  };
};

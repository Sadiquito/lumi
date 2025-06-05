
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

  // Track user activity function
  const trackActivity = async (activityType: string) => {
    try {
      await supabase.rpc('track_user_activity', { activity_type: activityType });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  return {
    userActivity: userActivity || [],
    trialConversions: trialConversions || [],
    systemHealth: systemHealth || [],
    isLoadingActivity,
    isLoadingConversions,
    isLoadingHealth,
    trackActivity,
  };
};

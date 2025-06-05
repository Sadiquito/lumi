
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuditLogger } from "./useAdminAuditLogger";

interface PrivacySafeActivityData {
  activity_date: string;
  activity_type: string;
  total_users: number;
  total_activities: number;
}

interface PrivacySafeConversionData {
  conversion_date: string;
  conversion_type: string;
  conversion_count: number;
  avg_days_to_conversion: number;
}

interface AnonymizedHealthData {
  metric_name: string;
  metric_date: string;
  avg_value: number;
  min_value: number;
  max_value: number;
  data_points: number;
}

export const usePrivacySafeAnalytics = (isAdmin: boolean) => {
  const { logDataAccess } = useAdminAuditLogger();

  // Privacy-safe user activity (using existing daily user activity function)
  const { data: privacySafeUserActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['privacy-safe-user-activity'],
    queryFn: async (): Promise<PrivacySafeActivityData[]> => {
      logDataAccess('privacy_safe_user_activity');
      
      // Use existing function for aggregated data
      const { data, error } = await supabase.rpc('get_daily_user_activity');
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 5 * 60 * 1000,
  });

  // Privacy-safe conversion data (using existing function)
  const { data: privacySafeConversions, isLoading: isLoadingConversions } = useQuery({
    queryKey: ['privacy-safe-conversions'],
    queryFn: async (): Promise<PrivacySafeConversionData[]> => {
      logDataAccess('privacy_safe_conversions');
      
      // Use existing trial conversion stats function
      const { data, error } = await supabase.rpc('get_trial_conversion_stats');
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 5 * 60 * 1000,
  });

  // System health (already anonymous)
  const { data: systemHealth, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['privacy-safe-system-health'],
    queryFn: async (): Promise<AnonymizedHealthData[]> => {
      logDataAccess('system_health_metrics');
      
      const { data, error } = await supabase.rpc('get_system_health_metrics');
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 2 * 60 * 1000,
  });

  // Enhanced activity tracking (privacy-safe)
  const trackAnonymizedActivity = async (activityType: string) => {
    try {
      // Track activity without user identification using existing function
      await supabase.rpc('track_user_activity', { 
        activity_type: activityType,
        // No user_id passed for admin analytics tracking
      });
    } catch (error) {
      console.error('Error tracking anonymized activity:', error);
    }
  };

  return {
    privacySafeUserActivity: privacySafeUserActivity || [],
    privacySafeConversions: privacySafeConversions || [],
    systemHealth: systemHealth || [],
    isLoadingActivity,
    isLoadingConversions,
    isLoadingHealth,
    trackAnonymizedActivity,
  };
};

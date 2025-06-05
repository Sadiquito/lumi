
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuditLogger } from "./useAdminAuditLogger";

interface AnonymizedUserData {
  user_hash: string;
  activity_date: string;
  activity_type: string;
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

  // Privacy-safe user activity (no personal identifiers, only aggregated data)
  const { data: anonymizedUserActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['privacy-safe-user-activity'],
    queryFn: async (): Promise<AnonymizedUserData[]> => {
      logDataAccess('anonymized_user_activity');
      
      // Get aggregated data without user identification
      const { data, error } = await supabase.rpc('get_anonymized_user_activity');
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin,
    refetchInterval: 5 * 60 * 1000,
  });

  // Privacy-safe conversion data (aggregated only)
  const { data: privacySafeConversions, isLoading: isLoadingConversions } = useQuery({
    queryKey: ['privacy-safe-conversions'],
    queryFn: async (): Promise<PrivacySafeConversionData[]> => {
      logDataAccess('privacy_safe_conversions');
      
      // Get conversion stats without any personal data
      const { data, error } = await supabase.rpc('get_privacy_safe_conversions');
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
      // Only track activity type, no user identification
      await supabase.rpc('track_anonymized_activity', { 
        activity_type: activityType,
        // Explicitly no user_id passed for admin analytics
      });
    } catch (error) {
      console.error('Error tracking anonymized activity:', error);
    }
  };

  return {
    anonymizedUserActivity: anonymizedUserActivity || [],
    privacySafeConversions: privacySafeConversions || [],
    systemHealth: systemHealth || [],
    isLoadingActivity,
    isLoadingConversions,
    isLoadingHealth,
    trackAnonymizedActivity,
  };
};

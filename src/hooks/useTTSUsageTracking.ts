
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface TTSUsageStats {
  dailyUsage: number;
  weeklyUsage: number;
  totalUsage: number;
  lastUsed: string | null;
}

const TRIAL_DAILY_LIMIT = 5;
const TRIAL_WEEKLY_LIMIT = 20;

export const useTTSUsageTracking = () => {
  const [usage, setUsage] = useState<TTSUsageStats>({
    dailyUsage: 0,
    weeklyUsage: 0,
    totalUsage: 0,
    lastUsed: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, trialStatus } = useAuth();

  const fetchUsage = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .rpc('get_tts_usage_stats', { user_id: user.id });

      if (error) throw error;

      setUsage(data || {
        dailyUsage: 0,
        weeklyUsage: 0,
        totalUsage: 0,
        lastUsed: null
      });
    } catch (error) {
      console.error('Error fetching TTS usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackUsage = async (text: string, voiceId: string) => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase
        .rpc('track_tts_usage', {
          user_id: user.id,
          text_length: text.length,
          voice_id: voiceId,
          character_count: text.length
        });

      if (error) throw error;

      // Update local usage stats
      await fetchUsage();
      return true;
    } catch (error) {
      console.error('Error tracking TTS usage:', error);
      return false;
    }
  };

  const canUseToday = () => {
    if (trialStatus.hasPremiumAccess) return true;
    return usage.dailyUsage < TRIAL_DAILY_LIMIT;
  };

  const getRemainingUsage = () => {
    if (trialStatus.hasPremiumAccess) return { daily: Infinity, weekly: Infinity };
    return {
      daily: Math.max(0, TRIAL_DAILY_LIMIT - usage.dailyUsage),
      weekly: Math.max(0, TRIAL_WEEKLY_LIMIT - usage.weeklyUsage)
    };
  };

  useEffect(() => {
    fetchUsage();
  }, [user?.id]);

  return {
    usage,
    isLoading,
    trackUsage,
    canUseToday,
    getRemainingUsage,
    refreshUsage: fetchUsage,
    limits: {
      dailyLimit: TRIAL_DAILY_LIMIT,
      weeklyLimit: TRIAL_WEEKLY_LIMIT
    }
  };
};

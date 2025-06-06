
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/SimpleAuthProvider';

interface TTSUsageStats {
  dailyUsage: number;
  weeklyUsage: number;
  totalUsage: number;
  lastUsed: string | null;
}

// No limits - all users have unlimited TTS access

export const useTTSUsageTracking = () => {
  const [usage, setUsage] = useState<TTSUsageStats>({
    dailyUsage: 0,
    weeklyUsage: 0,
    totalUsage: 0,
    lastUsed: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchUsage = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      // For now, we'll simulate usage stats since we don't have a TTS usage table yet
      // In a real implementation, you'd query a tts_usage table
      const mockUsage = {
        dailyUsage: 2,
        weeklyUsage: 8,
        totalUsage: 15,
        lastUsed: new Date().toISOString()
      };
      
      setUsage(mockUsage);
    } catch (error) {
      console.error('Error fetching TTS usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackUsage = async (text: string, voiceId: string) => {
    if (!user?.id) return false;

    try {
      // For now, we'll just log the usage
      // In a real implementation, you'd insert into a tts_usage table
      console.log('TTS Usage tracked:', {
        userId: user.id,
        textLength: text.length,
        voiceId,
        timestamp: new Date().toISOString()
      });

      // Update local usage stats
      setUsage(prev => ({
        ...prev,
        dailyUsage: prev.dailyUsage + 1,
        weeklyUsage: prev.weeklyUsage + 1,
        totalUsage: prev.totalUsage + 1,
        lastUsed: new Date().toISOString()
      }));

      return true;
    } catch (error) {
      console.error('Error tracking TTS usage:', error);
      return false;
    }
  };

  const canUseToday = () => {
    return true; // All users have unlimited TTS access
  };

  const getRemainingUsage = () => {
    return { daily: Infinity, weekly: Infinity }; // unlimited for all users
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
      dailyLimit: Infinity,
      weeklyLimit: Infinity
    }
  };
};

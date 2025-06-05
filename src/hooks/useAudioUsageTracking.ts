
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface AudioUsageStats {
  dailyTranscriptions: number;
  weeklyTranscriptions: number;
  totalTranscriptions: number;
  lastUsed: string | null;
}

const TRIAL_DAILY_TRANSCRIPTION_LIMIT = 10;
const TRIAL_WEEKLY_TRANSCRIPTION_LIMIT = 50;
const TRIAL_MAX_DURATION = 60; // seconds

export const useAudioUsageTracking = () => {
  const [usage, setUsage] = useState<AudioUsageStats>({
    dailyTranscriptions: 0,
    weeklyTranscriptions: 0,
    totalTranscriptions: 0,
    lastUsed: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, trialStatus } = useAuth();

  const fetchUsage = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      // For now, we'll simulate usage stats since we don't have an audio_usage table yet
      // In a real implementation, you'd query an audio_usage table
      const mockUsage = {
        dailyTranscriptions: 3,
        weeklyTranscriptions: 12,
        totalTranscriptions: 25,
        lastUsed: new Date().toISOString()
      };
      
      setUsage(mockUsage);
    } catch (error) {
      console.error('Error fetching audio usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackTranscription = async (duration: number, transcript: string) => {
    if (!user?.id) return false;

    try {
      // For now, we'll just log the usage
      // In a real implementation, you'd insert into an audio_usage table
      console.log('Audio transcription tracked:', {
        userId: user.id,
        duration,
        transcriptLength: transcript.length,
        timestamp: new Date().toISOString()
      });

      // Update local usage stats
      setUsage(prev => ({
        ...prev,
        dailyTranscriptions: prev.dailyTranscriptions + 1,
        weeklyTranscriptions: prev.weeklyTranscriptions + 1,
        totalTranscriptions: prev.totalTranscriptions + 1,
        lastUsed: new Date().toISOString()
      }));

      return true;
    } catch (error) {
      console.error('Error tracking audio transcription:', error);
      return false;
    }
  };

  const canTranscribeToday = () => {
    if (trialStatus.hasPremiumAccess) return true;
    return usage.dailyTranscriptions < TRIAL_DAILY_TRANSCRIPTION_LIMIT;
  };

  const getMaxRecordingDuration = () => {
    if (trialStatus.hasPremiumAccess) return undefined; // unlimited
    return TRIAL_MAX_DURATION;
  };

  const getRemainingUsage = () => {
    if (trialStatus.hasPremiumAccess) return { daily: Infinity, weekly: Infinity };
    return {
      daily: Math.max(0, TRIAL_DAILY_TRANSCRIPTION_LIMIT - usage.dailyTranscriptions),
      weekly: Math.max(0, TRIAL_WEEKLY_TRANSCRIPTION_LIMIT - usage.weeklyTranscriptions)
    };
  };

  useEffect(() => {
    fetchUsage();
  }, [user?.id]);

  return {
    usage,
    isLoading,
    trackTranscription,
    canTranscribeToday,
    getMaxRecordingDuration,
    getRemainingUsage,
    refreshUsage: fetchUsage,
    limits: {
      dailyLimit: TRIAL_DAILY_TRANSCRIPTION_LIMIT,
      weeklyLimit: TRIAL_WEEKLY_TRANSCRIPTION_LIMIT,
      maxDuration: TRIAL_MAX_DURATION
    }
  };
};

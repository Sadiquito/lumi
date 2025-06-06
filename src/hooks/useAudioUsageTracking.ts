
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/SimpleAuthProvider';

interface AudioUsageStats {
  dailyTranscriptions: number;
  weeklyTranscriptions: number;
  totalTranscriptions: number;
  lastUsed: string | null;
}

// No limits - all users have unlimited access

export const useAudioUsageTracking = () => {
  const [usage, setUsage] = useState<AudioUsageStats>({
    dailyTranscriptions: 0,
    weeklyTranscriptions: 0,
    totalTranscriptions: 0,
    lastUsed: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

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
    return true; // All users have unlimited access
  };

  const getMaxRecordingDuration = () => {
    return undefined; // unlimited for all users
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
    trackTranscription,
    canTranscribeToday,
    getMaxRecordingDuration,
    getRemainingUsage,
    refreshUsage: fetchUsage,
    limits: {
      dailyLimit: Infinity,
      weeklyLimit: Infinity,
      maxDuration: undefined
    }
  };
};

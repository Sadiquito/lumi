
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface GreetingData {
  id: string;
  greeting_text: string;
  time_of_day: 'morning' | 'afternoon' | 'evening';
  personalization_level: 'minimal' | 'moderate' | 'full';
  created_at: string;
  metadata: {
    hasAdvice?: boolean;
    conversationCount?: number;
    daysSinceLastChat?: number;
  };
}

export const useDailyGreeting = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if greeting was already generated today
  const { data: todaysGreeting, isLoading } = useQuery({
    queryKey: ['daily-greeting', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      // Query the daily_greetings table directly
      const { data, error } = await supabase
        .from('daily_greetings')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching daily greeting:', error);
        return null;
      }
      
      return data as GreetingData | null;
    },
    enabled: !!user?.id,
  });

  const generateGreeting = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-daily-greeting', {
        body: { userId: user.id },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-greeting', user?.id] });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const shouldGenerateGreeting = useCallback(() => {
    if (!user?.id || isLoading) return false;
    return !todaysGreeting;
  }, [user?.id, todaysGreeting, isLoading]);

  const getTimeOfDay = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }, []);

  return {
    todaysGreeting,
    isLoading,
    isGenerating,
    shouldGenerateGreeting: shouldGenerateGreeting(),
    generateGreeting: generateGreeting.mutate,
    getTimeOfDay,
  };
};

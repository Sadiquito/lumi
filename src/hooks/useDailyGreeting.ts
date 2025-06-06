
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/SimpleAuthProvider';

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

  // Check if greeting was already generated today using edge function
  const { data: todaysGreeting, isLoading } = useQuery({
    queryKey: ['daily-greeting', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      
      // Use the edge function to fetch daily greeting
      const { data, error } = await supabase.functions.invoke('get-daily-greeting', {
        body: { 
          user_id: user.id,
          target_date: today 
        },
      });

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

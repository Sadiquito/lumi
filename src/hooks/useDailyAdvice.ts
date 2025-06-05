
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export const useDailyAdvice = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const generateDailyAdvice = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Generating daily advice for user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('generate-daily-advice', {
        body: {
          userId: user.id,
        },
      });

      if (error) {
        console.error('Daily advice generation error:', error);
        throw error;
      }

      console.log('Daily advice result:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate daily advice queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['daily-advice', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to generate daily advice:', error);
    },
  });

  return {
    generateDailyAdvice: generateDailyAdvice.mutate,
    isGenerating: generateDailyAdvice.isPending,
    generationError: generateDailyAdvice.error,
  };
};

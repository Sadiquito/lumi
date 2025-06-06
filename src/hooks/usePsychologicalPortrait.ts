
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/SimpleAuthProvider';

export const usePsychologicalPortrait = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch the user's psychological portrait
  const { data: portrait, isLoading, error } = useQuery({
    queryKey: ['psychological-portrait', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('personalization_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Trigger conversation analysis
  const analyzeConversation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      transcript, 
      aiResponse 
    }: {
      conversationId: string;
      transcript: string;
      aiResponse: string;
    }) => {
      console.log('Triggering conversation analysis...', { conversationId });
      
      const { data, error } = await supabase.functions.invoke('analyze-conversation', {
        body: {
          conversationId,
          transcript,
          aiResponse,
        },
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      console.log('Analysis result:', data);
      return data;
    },
    onSuccess: () => {
      // Invalidate the portrait query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['psychological-portrait', user?.id] });
    },
    onError: (error) => {
      console.error('Failed to analyze conversation:', error);
    },
  });

  return {
    portrait,
    isLoading,
    error,
    analyzeConversation: analyzeConversation.mutate,
    isAnalyzing: analyzeConversation.isPending,
    analysisError: analyzeConversation.error,
  };
};


import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversationSummary {
  id: string;
  conversation_id: string;
  summary_text: string;
  key_insights: string[];
  emotional_tone: string;
  duration_minutes: number;
  message_count: number;
  created_at: string;
}

interface GenerateSummaryOptions {
  conversationId: string;
  messages: Array<{
    content: string;
    speaker: 'user' | 'ai';
    timestamp: Date;
  }>;
  duration: number;
}

export const useConversationSummary = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSummary, setCurrentSummary] = useState<ConversationSummary | null>(null);

  const generateSummary = useCallback(async ({
    conversationId,
    messages,
    duration
  }: GenerateSummaryOptions): Promise<ConversationSummary | null> => {
    setIsGenerating(true);
    
    try {
      // Prepare conversation data for summary generation
      const conversationData = {
        messages: messages.map(msg => ({
          content: msg.content,
          speaker: msg.speaker,
          timestamp: msg.timestamp.toISOString()
        })),
        duration_minutes: Math.round(duration / 60000),
        message_count: messages.length
      };

      // Call edge function to generate summary
      const { data, error } = await supabase.functions.invoke('generate-conversation-summary', {
        body: {
          conversation_id: conversationId,
          conversation_data: conversationData
        }
      });

      if (error) {
        console.error('Summary generation error:', error);
        toast({
          title: "Summary generation failed",
          description: "Could not generate conversation summary. The conversation has been saved.",
        });
        return null;
      }

      const summary = data.summary as ConversationSummary;
      setCurrentSummary(summary);
      
      toast({
        title: "Conversation summarized",
        description: "Your conversation has been archived with insights.",
      });

      return summary;
    } catch (error) {
      console.error('Summary generation error:', error);
      toast({
        title: "Summary generation failed",
        description: "Could not generate conversation summary.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const getSummary = useCallback(async (conversationId: string): Promise<ConversationSummary | null> => {
    try {
      const { data, error } = await supabase
        .from('conversation_summaries')
        .select('*')
        .eq('conversation_id', conversationId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching summary:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error fetching summary:', error);
      return null;
    }
  }, []);

  const clearSummary = useCallback(() => {
    setCurrentSummary(null);
  }, []);

  return {
    generateSummary,
    getSummary,
    clearSummary,
    isGenerating,
    currentSummary,
  };
};

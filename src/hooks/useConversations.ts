import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TranscriptEntry {
  speaker: 'user' | 'lumi';
  text: string;
  timestamp: number;
}

interface PsychologicalInsights {
  [key: string]: unknown;
}

interface Conversation {
  id: string;
  transcript: TranscriptEntry[];
  session_summary: string | null;
  lumi_reflection: string | null;
  lumi_question: string | null;
  psychological_insights: PsychologicalInsights;
  conversation_duration: number;
  created_at: string;
}

interface RealtimePayload {
  new: unknown;
  [key: string]: unknown;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const fetchConversations = useCallback(async (reset = false) => {
    if (!user) return;

    try {
      setLoading(true);
      const currentOffset = reset ? 0 : offset;

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (error) {
        return;
      }

      // Type cast the data to match our Conversation interface
      const typedData: Conversation[] = (data || []).map(item => ({
        ...item,
        transcript: Array.isArray(item.transcript) ? item.transcript : [],
        psychological_insights: item.psychological_insights || {}
      }));

      if (reset) {
        setConversations(typedData);
        setOffset(limit);
      } else {
        setConversations(prev => [...prev, ...typedData]);
        setOffset(prev => prev + limit);
      }

      setHasMore(typedData.length === limit);
    } catch (error) {
      // Error handling without console logging
    } finally {
      setLoading(false);
    }
  }, [user, offset, limit]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchConversations(false);
    }
  }, [fetchConversations, loading, hasMore]);

  useEffect(() => {
    if (user) {
      fetchConversations(true);
    }
  }, [user, fetchConversations]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePayload) => {
          const newConversation: Conversation = {
            ...(payload.new as Conversation),
            transcript: Array.isArray((payload.new as Conversation).transcript) ? (payload.new as Conversation).transcript : [],
            psychological_insights: (payload.new as Conversation).psychological_insights || {}
          };
          setConversations(prev => [newConversation, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePayload) => {
          const updatedConversation: Conversation = {
            ...(payload.new as Conversation),
            transcript: Array.isArray((payload.new as Conversation).transcript) ? (payload.new as Conversation).transcript : [],
            psychological_insights: (payload.new as Conversation).psychological_insights || {}
          };
          setConversations(prev => 
            prev.map(conv => 
              conv.id === updatedConversation.id ? updatedConversation : conv
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    conversations,
    loading,
    hasMore,
    loadMore
  };
};

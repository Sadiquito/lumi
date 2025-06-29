import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  id: string;
  transcript: any[];
  session_summary: string | null;
  lumi_reflection: string | null;
  lumi_question: string | null;
  psychological_insights: any;
  conversation_duration: number;
  created_at: string;
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
        console.error('Error fetching conversations:', error);
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
      console.error('Error in fetchConversations:', error);
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
  }, [user]);

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
        (payload) => {
          const newConversation: Conversation = {
            ...payload.new as any,
            transcript: Array.isArray(payload.new.transcript) ? payload.new.transcript : [],
            psychological_insights: payload.new.psychological_insights || {}
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
        (payload) => {
          const updatedConversation: Conversation = {
            ...payload.new as any,
            transcript: Array.isArray(payload.new.transcript) ? payload.new.transcript : [],
            psychological_insights: payload.new.psychological_insights || {}
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

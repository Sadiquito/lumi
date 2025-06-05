
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import ConversationFeatureGate from '@/components/ConversationFeatureGate';
import ConversationCard from './ConversationCard';

const RecentConversations: React.FC = () => {
  const { user } = useAuth();

  // Fetch user's conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  return (
    <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-lumi-aquamarine" />
          recent conversations
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conversationsLoading ? (
          <div className="text-white/70 text-center py-8">
            <div className="animate-pulse">loading your conversations...</div>
          </div>
        ) : conversations && conversations.length > 0 ? (
          <ConversationFeatureGate feature="ai_insights">
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <ConversationCard
                  key={conversation.id}
                  conversation={conversation}
                />
              ))}
            </div>
          </ConversationFeatureGate>
        ) : (
          <div className="text-center py-12">
            <div className="bg-lumi-deep-space/30 rounded-xl p-8 border border-lumi-aquamarine/10">
              <MessageCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-white/70 text-lg font-medium mb-2">no conversations yet</h3>
              <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
                start your first daily check-in above and your conversation history will appear here
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentConversations;

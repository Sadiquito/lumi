
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import ConversationFeatureGate from '@/components/ConversationFeatureGate';
import TTSFeatureGate from '@/components/TTSFeatureGate';

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
          <div className="text-white/70 text-center py-4">
            loading your conversations...
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className="p-4 bg-lumi-deep-space/30 rounded-lg border border-lumi-sunset-coral/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lumi-aquamarine text-sm font-medium">
                    conversation
                  </span>
                  <span className="text-white/60 text-xs flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(parseISO(conversation.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
                <p className="text-white/80 text-sm line-clamp-2">
                  {conversation.transcript || 'No transcript available'}
                </p>
                {conversation.ai_response && (
                  <ConversationFeatureGate feature="ai_insights">
                    <div className="mt-2 pt-2 border-t border-lumi-sunset-coral/10">
                      <div className="flex items-start justify-between">
                        <p className="text-white/70 text-xs flex-1">
                          <span className="text-lumi-aquamarine">lumi's insight:</span> {conversation.ai_response}
                        </p>
                        <TTSFeatureGate 
                          text={conversation.ai_response}
                          variant="icon-only"
                          showAlert={false}
                        />
                      </div>
                    </div>
                  </ConversationFeatureGate>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/70 mb-2">no conversations yet</p>
            <p className="text-white/50 text-sm">
              your first daily check-in will appear here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentConversations;

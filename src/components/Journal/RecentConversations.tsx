
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MessageCircle } from 'lucide-react';

const RecentConversations: React.FC = () => {
  // Placeholder data - will be replaced with real data in Phase 2
  const conversations = [
    {
      id: '1',
      date: 'Today',
      preview: 'Reflected on work challenges and personal growth...',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      date: 'Yesterday',
      preview: 'Discussed morning routine and productivity habits...',
      timestamp: 'Yesterday at 8:30 AM'
    },
    {
      id: '3',
      date: 'Dec 5',
      preview: 'Explored creative projects and future goals...',
      timestamp: '3 days ago'
    }
  ];

  return (
    <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white text-xl font-title flex items-center">
          <Clock className="w-6 h-6 mr-2 text-lumi-aquamarine" />
          Recent Conversations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-4 bg-lumi-deep-space/30 rounded-lg border border-lumi-sunset-coral/10 hover:bg-lumi-deep-space/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 text-lumi-aquamarine mr-2" />
                    <span className="text-white/80 text-sm font-medium">{conversation.date}</span>
                  </div>
                  <span className="text-white/50 text-xs">{conversation.timestamp}</span>
                </div>
                <p className="text-white/70 text-sm line-clamp-2">{conversation.preview}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-lumi-sunset-coral/50 mx-auto mb-4" />
              <p className="text-white/60 text-sm">
                No conversations yet. Start your first conversation above!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentConversations;

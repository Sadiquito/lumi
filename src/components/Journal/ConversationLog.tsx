
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MessageCircle } from 'lucide-react';

interface ConversationEntry {
  id: string;
  timestamp: string;
  transcriptSnippet: string;
}

const ConversationLog: React.FC = () => {
  // Mock data - will be replaced with real data later
  const conversations: ConversationEntry[] = [
    {
      id: '1',
      timestamp: 'Today, 2:30 PM',
      transcriptSnippet: 'I reflected on my morning routine and how it affects my productivity throughout the day...'
    },
    {
      id: '2',
      timestamp: 'Yesterday, 8:15 AM',
      transcriptSnippet: 'Discussed my goals for the week and the challenges I anticipate facing...'
    },
    {
      id: '3',
      timestamp: 'Dec 5, 7:45 PM',
      transcriptSnippet: 'Explored my feelings about the recent changes at work and how to adapt...'
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-white text-lg font-medium mb-6 flex items-center">
        <MessageCircle className="w-5 h-5 mr-2 text-lumi-aquamarine" />
        Previous Conversations
      </h2>
      
      {conversations.length > 0 ? (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <Card 
              key={conversation.id}
              className="bg-lumi-charcoal/60 border-lumi-sunset-coral/20 hover:border-lumi-sunset-coral/40 transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center text-lumi-aquamarine text-sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    {conversation.timestamp}
                  </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed line-clamp-2">
                  {conversation.transcriptSnippet}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-lumi-sunset-coral/50 mx-auto mb-4" />
          <p className="text-white/60 text-sm">
            No conversations yet. Start your first conversation above!
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversationLog;

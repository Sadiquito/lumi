
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar, MessageCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import ConversationThread from './ConversationThread';
import ExportButton from '@/components/Export/ExportButton';

interface ConversationCardProps {
  conversation: {
    id: string;
    transcript: string;
    ai_response: string;
    created_at: string;
  };
}

const ConversationCard: React.FC<ConversationCardProps> = ({ conversation }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMM dd');
    } catch {
      return 'Today';
    }
  };

  return (
    <Card className="bg-lumi-charcoal/60 backdrop-blur-sm border-lumi-sunset-coral/15 shadow-lg hover:border-lumi-sunset-coral/25 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-lumi-aquamarine text-sm font-medium" style={{ fontFamily: 'Cinzel' }}>
            <MessageCircle className="w-4 h-4 mr-2" />
            conversation
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-white/60 text-xs" style={{ fontFamily: 'Crimson Pro' }}>
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(conversation.created_at)}
            </div>
            <ExportButton 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              showText={false}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ConversationThread conversation={conversation} />
      </CardContent>
    </Card>
  );
};

export default ConversationCard;

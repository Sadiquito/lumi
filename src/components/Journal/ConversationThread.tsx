
import React from 'react';
import { format, parseISO } from 'date-fns';
import ConversationBubble from './ConversationBubble';

interface ConversationThreadProps {
  conversation: {
    id: string;
    transcript: string;
    ai_response: string;
    created_at: string;
  };
}

const ConversationThread: React.FC<ConversationThreadProps> = ({ conversation }) => {
  const formatTimestamp = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'h:mm a');
    } catch {
      return 'now';
    }
  };

  return (
    <div className="space-y-1">
      {/* User Message */}
      <ConversationBubble
        message={conversation.transcript}
        speaker="user"
        timestamp={formatTimestamp(conversation.created_at)}
      />

      {/* AI Response */}
      <ConversationBubble
        message={conversation.ai_response}
        speaker="ai"
        timestamp={formatTimestamp(conversation.created_at)}
        showTTS={true}
      />
    </div>
  );
};

export default ConversationThread;

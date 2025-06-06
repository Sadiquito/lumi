
import React from 'react';
import { MessageCircle } from 'lucide-react';
import ConversationCard from './ConversationCard';

interface ConversationEntry {
  id: string;
  transcript: string;
  ai_response: string;
  created_at: string;
}

const ConversationLog: React.FC = () => {
  // Mock data - will be replaced with real data later
  const conversations: ConversationEntry[] = [
    {
      id: '1',
      transcript: 'I reflected on my morning routine and how it affects my productivity throughout the day. I noticed that when I wake up earlier and do some light stretching, I feel more energized and focused.',
      ai_response: 'That\'s a wonderful observation about the connection between your morning routine and your energy levels. The fact that you\'re noticing these patterns shows great self-awareness. What specific aspects of your stretching routine do you find most beneficial for setting the tone of your day?',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      transcript: 'I\'ve been thinking about my goals for the week and the challenges I anticipate facing. Work has been particularly demanding lately, and I\'m struggling to find balance.',
      ai_response: 'It sounds like you\'re being very thoughtful about planning ahead while also acknowledging the real pressures you\'re facing. Finding balance during demanding periods is challenging for everyone. What does balance look like for you in an ideal week?',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      transcript: 'I want to explore my feelings about the recent changes at work. There\'s been a lot of uncertainty, and I\'m not sure how to adapt to the new environment.',
      ai_response: 'Change and uncertainty at work can feel overwhelming, and it\'s completely natural to feel unsettled by these shifts. Your willingness to explore these feelings shows emotional intelligence. What aspects of the changes feel most challenging to navigate?',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-white text-lg font-medium mb-6 flex items-center" style={{ fontFamily: 'Cinzel' }}>
        <MessageCircle className="w-5 h-5 mr-2 text-lumi-aquamarine" />
        Previous Conversations
      </h2>
      
      {conversations.length > 0 ? (
        <div className="space-y-6">
          {conversations.map((conversation) => (
            <ConversationCard 
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-lumi-sunset-coral/50 mx-auto mb-4" />
          <p className="text-white/60 text-sm" style={{ fontFamily: 'Crimson Pro' }}>
            No conversations yet. Start your first conversation above!
          </p>
        </div>
      )}
    </div>
  );
};

export default ConversationLog;

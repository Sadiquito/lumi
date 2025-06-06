
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ConversationEntry {
  id: string;
  timestamp: string;
  messages: Array<{
    speaker: 'user' | 'lumi';
    text: string;
    time: string;
  }>;
}

const ConversationHistory: React.FC = () => {
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());

  // Mock data - will be replaced with real data later
  const conversations: ConversationEntry[] = [
    {
      id: '1',
      timestamp: 'Today, 2:30 PM',
      messages: [
        {
          speaker: 'user',
          text: 'I reflected on my morning routine and how it affects my productivity throughout the day. I think I need to be more intentional about my wake-up time.',
          time: '2:30 PM'
        },
        {
          speaker: 'lumi',
          text: 'That\'s a thoughtful observation. What specific aspect of your morning routine do you think has the biggest impact on your productivity?',
          time: '2:31 PM'
        },
        {
          speaker: 'user',
          text: 'Probably the time I spend on my phone right after waking up. It sets a reactive tone instead of a proactive one.',
          time: '2:32 PM'
        }
      ]
    },
    {
      id: '2',
      timestamp: 'Yesterday, 8:15 AM',
      messages: [
        {
          speaker: 'user',
          text: 'Discussed my goals for the week and the challenges I anticipate facing.',
          time: '8:15 AM'
        },
        {
          speaker: 'lumi',
          text: 'What\'s the most important goal you want to focus on this week?',
          time: '8:16 AM'
        }
      ]
    }
  ];

  const toggleExpanded = (conversationId: string) => {
    const newExpanded = new Set(expandedConversations);
    if (newExpanded.has(conversationId)) {
      newExpanded.delete(conversationId);
    } else {
      newExpanded.add(conversationId);
    }
    setExpandedConversations(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      {conversations.length > 0 ? (
        <div className="space-y-4">
          {conversations.map((conversation) => {
            const isExpanded = expandedConversations.has(conversation.id);
            const hasMultipleMessages = conversation.messages.length > 1;
            
            return (
              <Card 
                key={conversation.id}
                className="bg-black/20 backdrop-blur-sm border-white/10 shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lumi-aquamarine text-sm font-medium">
                      {conversation.timestamp}
                    </div>
                    {hasMultipleMessages && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(conversation.id)}
                        className="text-white/60 hover:text-white hover:bg-white/10"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Show more
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {isExpanded ? (
                      // Show all messages when expanded
                      conversation.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`
                              max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
                              ${message.speaker === 'user' 
                                ? 'bg-white/10 text-white rounded-tr-sm' 
                                : 'bg-lumi-aquamarine/20 text-lumi-aquamarine rounded-tl-sm'
                              }
                            `}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.text}
                            </p>
                            <div className="text-xs opacity-60 mt-1">
                              {message.time}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Show only first message (truncated) when collapsed
                      <div
                        className={`flex ${conversation.messages[0].speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`
                            max-w-[80%] rounded-2xl px-4 py-3 shadow-sm
                            ${conversation.messages[0].speaker === 'user' 
                              ? 'bg-white/10 text-white rounded-tr-sm' 
                              : 'bg-lumi-aquamarine/20 text-lumi-aquamarine rounded-tl-sm'
                            }
                          `}
                        >
                          <p className="text-sm leading-relaxed">
                            {truncateText(conversation.messages[0].text)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <MessageCircle className="w-12 h-12 text-lumi-aquamarine/60 mx-auto mb-4" />
            <p className="text-white/70 text-sm">
              No conversations yet. Start your first conversation above!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;

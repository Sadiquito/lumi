import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bot, User, Clock, Sparkles } from 'lucide-react';
import { TranscriptEntry } from '@/types/conversation';

interface ConversationEntryProps {
  conversation: {
    id: string;
    transcript: TranscriptEntry[];
    session_summary: string | null;
    lumi_reflection: string | null;
    lumi_question: string | null;
    conversation_duration: number;
    created_at: string;
  };
}

export const ConversationEntry: React.FC<ConversationEntryProps> = ({ conversation }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 mb-6">
      <CardContent className="p-6">
        {/* Conversation metadata */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="font-crimson">{formatDate(conversation.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-crimson">
              {Math.floor(conversation.conversation_duration / 60)}:
              {(conversation.conversation_duration % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Lumi's reflection section */}
        {conversation.lumi_reflection && (
          <div className="mb-4 p-4 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg border border-cyan-100">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-cinzel text-cyan-700">Lumi's Reflection</span>
            </div>
            <p className="text-gray-700 font-crimson leading-relaxed">{conversation.lumi_reflection}</p>
          </div>
        )}

        {/* Conversation transcript */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {conversation.transcript.map((entry, index) => (
            <div
              key={entry.id || index}
              className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[80%] px-4 py-3 rounded-lg
                  ${entry.speaker === 'user' 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                    : 'bg-gradient-to-r from-cyan-100 to-purple-100 text-gray-800'
                  }
                `}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {entry.speaker === 'user' ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                  <span className="text-xs font-medium opacity-90">
                    {entry.speaker === 'user' ? 'You' : 'Lumi'}
                  </span>
                </div>
                <p className="text-sm font-crimson leading-relaxed">{entry.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Follow-up question section */}
        {conversation.lumi_question && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <div className="flex items-center space-x-2 mb-1">
              <Bot className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-cinzel text-purple-700">Lumi's Question</span>
            </div>
            <p className="text-gray-700 font-crimson italic">{conversation.lumi_question}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

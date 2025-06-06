
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Star } from 'lucide-react';

interface ConversationThreadProps {
  conversation: {
    transcript: string;
    ai_response: string;
  };
}

const ConversationThread: React.FC<ConversationThreadProps> = ({ conversation }) => {
  return (
    <div className="space-y-4">
      {/* User Message */}
      <div className="flex gap-3 flex-row-reverse">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8 bg-lumi-sunset-coral/20">
            <AvatarFallback className="text-lumi-sunset-coral">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Message Container */}
        <div className="flex flex-col max-w-[75%] items-end">
          {/* Speaker Label */}
          <div className="text-xs font-medium mb-1 text-lumi-sunset-coral" style={{ fontFamily: 'Cinzel' }}>
            you
          </div>

          {/* Message Bubble */}
          <div className="bg-lumi-sunset-coral text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Crimson Pro' }}>
              {conversation.transcript}
            </p>
          </div>
        </div>
      </div>

      {/* Lumi Message */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8 bg-lumi-aquamarine/20">
            <AvatarFallback className="text-lumi-aquamarine">
              <Star className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Message Container */}
        <div className="flex flex-col max-w-[75%] items-start">
          {/* Speaker Label */}
          <div className="text-xs font-medium mb-1 text-lumi-aquamarine" style={{ fontFamily: 'Cinzel' }}>
            lumi
          </div>

          {/* Message Bubble */}
          <div className="bg-lumi-charcoal/60 border border-lumi-aquamarine/20 text-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Crimson Pro' }}>
              {conversation.ai_response}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationThread;

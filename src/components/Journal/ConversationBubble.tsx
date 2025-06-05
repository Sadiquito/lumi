
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Star } from 'lucide-react';
import TTSFeatureGate from '@/components/TTSFeatureGate';

interface ConversationBubbleProps {
  message: string;
  speaker: 'user' | 'ai';
  timestamp: string;
  showTTS?: boolean;
}

const ConversationBubble: React.FC<ConversationBubbleProps> = ({
  message,
  speaker,
  timestamp,
  showTTS = false,
}) => {
  const isUser = speaker === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className={`w-8 h-8 ${isUser ? 'bg-lumi-sunset-coral/20' : 'bg-lumi-aquamarine/20'}`}>
          <AvatarFallback className={`${isUser ? 'text-lumi-sunset-coral' : 'text-lumi-aquamarine'}`}>
            {isUser ? <User className="w-4 h-4" /> : <Star className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Message Container */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Speaker Label */}
        <div className={`text-xs font-medium mb-1 ${
          isUser ? 'text-lumi-sunset-coral' : 'text-lumi-aquamarine'
        }`}>
          {isUser ? 'you' : 'lumi'}
        </div>

        {/* Message Bubble */}
        <div className={`relative rounded-2xl px-4 py-3 shadow-sm ${
          isUser 
            ? 'bg-lumi-sunset-coral text-white rounded-tr-sm' 
            : 'bg-lumi-deep-space/60 border border-lumi-aquamarine/20 text-white rounded-tl-sm'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>

          {/* TTS Button for AI messages */}
          {!isUser && showTTS && (
            <div className="mt-2 flex justify-end">
              <TTSFeatureGate 
                text={message}
                variant="icon-only"
                showAlert={false}
              />
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-white/50 mt-1 px-1">
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default ConversationBubble;

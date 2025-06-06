
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationEntry {
  speaker: 'lumi' | 'user';
  message: string;
  timestamp: Date;
}

interface ConversationHistoryProps {
  conversationHistory: ConversationEntry[];
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({ conversationHistory }) => {
  if (conversationHistory.length === 0) {
    return null;
  }

  return (
    <Card className="bg-lumi-charcoal/60 backdrop-blur-sm border-lumi-aquamarine/10">
      <CardContent className="p-6">
        <h4 className="text-white text-lg font-medium mb-4" style={{ fontFamily: 'Cinzel' }}>
          Conversation Flow
        </h4>
        <div className="space-y-4 max-h-60 overflow-y-auto">
          {conversationHistory.map((entry, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                entry.speaker === 'lumi' 
                  ? "bg-lumi-sunset-gold/20" 
                  : "bg-lumi-aquamarine/20"
              )}>
                {entry.speaker === 'lumi' ? (
                  <Sparkles className="w-4 h-4 text-lumi-sunset-gold" />
                ) : (
                  <Mic className="w-4 h-4 text-lumi-aquamarine" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white/90 text-sm leading-relaxed" style={{ fontFamily: 'Crimson Pro' }}>
                  {entry.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationHistory;

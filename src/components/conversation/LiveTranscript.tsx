import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Bot, Volume2 } from 'lucide-react';
import { TranscriptEntry } from '@/types/conversation';

interface LiveTranscriptProps {
  transcript: TranscriptEntry[];
  isLumiSpeaking: boolean;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  transcript,
  isLumiSpeaking
}) => {
  const formatTime = (timestamp: number) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (err) {
      return '--:--:--';
    }
  };

  if (!Array.isArray(transcript) || transcript.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl border-none shadow-sm bg-white/60 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Live Conversation (WebRTC)</h3>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>You</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bot className="w-3 h-3" />
              <span>Lumi</span>
            </div>
          </div>
        </div>
        
        {transcript.map((entry) => (
          <div
            key={entry.id}
            className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`
                max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative
                ${entry.speaker === 'user' 
                  ? 'bg-indigo-500 text-white rounded-br-sm' 
                  : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium flex items-center">
                  {entry.speaker === 'user' ? (
                    <>
                      <User className="w-3 h-3 mr-1" />
                      You
                    </>
                  ) : (
                    <>
                      <Bot className="w-3 h-3 mr-1" />
                      Lumi
                      {entry.speaker === 'lumi' && isLumiSpeaking && !entry.text.includes('[COMPLETE]') && (
                        <Volume2 className="ml-2 w-3 h-3 text-orange-500 animate-pulse" />
                      )}
                    </>
                  )}
                </div>
                <div className="text-xs opacity-75">
                  {formatTime(entry.timestamp)}
                </div>
              </div>
              
              <div className="text-sm leading-relaxed">
                {entry.text?.replace(' [COMPLETE]', '') || ''}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

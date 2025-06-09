
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, Mic, User, Bot } from 'lucide-react';

interface TranscriptEntry {
  id: string;
  text: string;
  speaker: 'user' | 'lumi';
  timestamp: number;
  confidence?: number;
}

interface TranscriptDisplayProps {
  transcript: TranscriptEntry[];
  currentUserText?: string;
  isUserSpeaking?: boolean;
  isLumiSpeaking?: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  currentUserText,
  isUserSpeaking,
  isLumiSpeaking
}) => {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Live Conversation</h3>
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
        
        {transcript.length === 0 && !currentUserText && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Mic className="w-8 h-8 mx-auto mb-2" />
            </div>
            <p className="text-gray-500">
              Start speaking to begin your conversation with Lumi...
            </p>
          </div>
        )}

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
                      {entry.speaker === 'lumi' && isLumiSpeaking && (
                        <Volume2 className="ml-2 w-3 h-3 text-orange-500 animate-pulse" />
                      )}
                    </>
                  )}
                </div>
                <div className="text-xs opacity-75">
                  {formatTime(entry.timestamp)}
                </div>
              </div>
              
              <div className="text-sm leading-relaxed">{entry.text}</div>
              
              {entry.confidence && entry.confidence < 0.8 && (
                <div className="text-xs opacity-60 mt-1 italic">
                  Low confidence: {Math.round(entry.confidence * 100)}%
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Show current user speech in real-time */}
        {currentUserText && (
          <div className="flex justify-end mb-4">
            <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-indigo-400 text-white opacity-90 rounded-br-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  You
                  {isUserSpeaking && (
                    <div className="ml-2 flex space-x-1">
                      <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                      <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-sm leading-relaxed">{currentUserText}</div>
              
              <div className="text-xs opacity-75 mt-1 flex items-center">
                <Mic className="w-3 h-3 mr-1" />
                Speaking...
              </div>
            </div>
          </div>
        )}

        {/* Scroll to bottom indicator */}
        {transcript.length > 0 && (
          <div className="text-center">
            <div className="inline-block w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

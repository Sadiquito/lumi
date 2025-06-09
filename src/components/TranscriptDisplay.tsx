
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  currentUserText,
  isUserSpeaking
}) => {
  return (
    <Card className="border-none shadow-sm bg-white/60 backdrop-blur-sm">
      <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation</h3>
        
        {transcript.length === 0 && !currentUserText && (
          <p className="text-center text-gray-500">
            Your conversation transcript will appear here...
          </p>
        )}

        {transcript.map((entry) => (
          <div
            key={entry.id}
            className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`
                max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                ${entry.speaker === 'user' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-gray-200 text-gray-900'
                }
              `}
            >
              <div className="text-sm font-medium mb-1">
                {entry.speaker === 'user' ? 'You' : 'Lumi'}
              </div>
              <div>{entry.text}</div>
              {entry.confidence && (
                <div className="text-xs opacity-75 mt-1">
                  Confidence: {Math.round(entry.confidence * 100)}%
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Show current user speech in real-time */}
        {currentUserText && (
          <div className="flex justify-end">
            <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-indigo-400 text-white opacity-80">
              <div className="text-sm font-medium mb-1 flex items-center">
                You
                {isUserSpeaking && (
                  <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                )}
              </div>
              <div>{currentUserText}</div>
              <div className="text-xs opacity-75 mt-1">Speaking...</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Clock, MessageCircle } from 'lucide-react';
import { ConversationSession, ConversationSessionState } from '@/types/conversationSession';
import { cn } from '@/lib/utils';

interface ConversationSessionManagerProps {
  session: ConversationSession | null;
  sessionState: ConversationSessionState;
  onStartSession: () => void;
  onEndSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  getSessionDuration: () => number;
  className?: string;
}

const sessionStateConfig = {
  not_started: {
    label: 'Ready to Start',
    color: 'bg-gray-500',
    bgClass: 'bg-gray-500/10',
    borderClass: 'border-gray-500/20',
    description: 'No active conversation session'
  },
  active: {
    label: 'Session Active',
    color: 'bg-green-500',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/20',
    description: 'Conversation in progress'
  },
  paused: {
    label: 'Session Paused',
    color: 'bg-yellow-500',
    bgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/20',
    description: 'Conversation temporarily paused'
  },
  ended: {
    label: 'Session Ended',
    color: 'bg-red-500',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/20',
    description: 'Conversation completed'
  },
};

const ConversationSessionManager: React.FC<ConversationSessionManagerProps> = ({
  session,
  sessionState,
  onStartSession,
  onEndSession,
  onPauseSession,
  onResumeSession,
  getSessionDuration,
  className
}) => {
  const config = sessionStateConfig[sessionState];

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return '-';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={cn(
      'transition-all duration-300',
      config.bgClass,
      config.borderClass,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-full', config.color)}>
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <Badge variant="outline" className="text-xs border-white/20 text-white">
                {config.label}
              </Badge>
              <p className="text-sm text-white/70 mt-1">
                {config.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {sessionState === 'not_started' && (
              <Button
                onClick={onStartSession}
                size="sm"
                className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
              >
                <Play className="w-3 h-3 mr-1" />
                Start Session
              </Button>
            )}

            {sessionState === 'active' && (
              <>
                <Button
                  onClick={onPauseSession}
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Pause className="w-3 h-3 mr-1" />
                  Pause
                </Button>
                <Button
                  onClick={onEndSession}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  <Square className="w-3 h-3 mr-1" />
                  End
                </Button>
              </>
            )}

            {sessionState === 'paused' && (
              <>
                <Button
                  onClick={onResumeSession}
                  size="sm"
                  className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Resume
                </Button>
                <Button
                  onClick={onEndSession}
                  size="sm"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Square className="w-3 h-3 mr-1" />
                  End
                </Button>
              </>
            )}

            {sessionState === 'ended' && (
              <Button
                onClick={onStartSession}
                size="sm"
                className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
              >
                <Play className="w-3 h-3 mr-1" />
                New Session
              </Button>
            )}
          </div>
        </div>

        {/* Session Details */}
        {session && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center text-white/60">
              <Clock className="w-3 h-3 mr-1" />
              <span>Duration: {formatDuration(getSessionDuration())}</span>
            </div>
            <div className="text-white/60">
              <span>Started: {formatTimestamp(session.startTime)}</span>
            </div>
            <div className="text-white/60">
              <span>Messages: {session.messageCount}</span>
            </div>
            <div className="text-white/60">
              <span>ID: {session.id.slice(-8)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationSessionManager;

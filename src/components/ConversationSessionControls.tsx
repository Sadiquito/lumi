
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  Archive, 
  FileText, 
  Clock, 
  MessageCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ConversationSession, ConversationSessionState } from '@/types/conversationSession';
import { cn } from '@/lib/utils';

interface ConversationSessionControlsProps {
  session: ConversationSession | null;
  sessionState: ConversationSessionState;
  onStartSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onCompleteSession: () => void;
  onArchiveSession: () => void;
  onGenerateSummary: () => void;
  getSessionDuration: () => number;
  isGeneratingSummary?: boolean;
  hasSummary?: boolean;
  className?: string;
}

const ConversationSessionControls: React.FC<ConversationSessionControlsProps> = ({
  session,
  sessionState,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onCompleteSession,
  onArchiveSession,
  onGenerateSummary,
  getSessionDuration,
  isGeneratingSummary = false,
  hasSummary = false,
  className
}) => {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getSessionStateConfig = () => {
    switch (sessionState) {
      case 'not_started':
        return {
          color: 'bg-gray-500',
          label: 'Ready to Start',
          description: 'Start a new conversation session'
        };
      case 'active':
        return {
          color: 'bg-green-500',
          label: 'Active Session',
          description: 'Conversation in progress'
        };
      case 'paused':
        return {
          color: 'bg-yellow-500',
          label: 'Session Paused',
          description: 'Conversation temporarily paused'
        };
      case 'ended':
        return {
          color: 'bg-blue-500',
          label: 'Session Complete',
          description: 'Conversation finished'
        };
      default:
        return {
          color: 'bg-gray-500',
          label: 'Unknown',
          description: 'Unknown session state'
        };
    }
  };

  const config = getSessionStateConfig();

  return (
    <Card className={cn(
      'w-full bg-lumi-charcoal/60 border-lumi-sunset-coral/20',
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center">
            <MessageCircle className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            Conversation Session
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              'text-white border-white/20',
              config.color
            )}
          >
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-white/70">{config.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Session Stats */}
        {session && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-white/60">
              <Clock className="w-4 h-4 mr-2" />
              <span>Duration: {formatDuration(getSessionDuration())}</span>
            </div>
            <div className="flex items-center text-white/60">
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>Messages: {session.messageCount}</span>
            </div>
          </div>
        )}

        <Separator className="bg-white/10" />

        {/* Primary Controls */}
        <div className="flex flex-wrap gap-2">
          {sessionState === 'not_started' && (
            <Button
              onClick={onStartSession}
              className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          )}

          {sessionState === 'active' && (
            <>
              <Button
                onClick={onPauseSession}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
              <Button
                onClick={onCompleteSession}
                className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            </>
          )}

          {sessionState === 'paused' && (
            <>
              <Button
                onClick={onResumeSession}
                className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button
                onClick={onCompleteSession}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Square className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </>
          )}

          {sessionState === 'ended' && (
            <Button
              onClick={onStartSession}
              className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              New Session
            </Button>
          )}
        </div>

        {/* Secondary Actions */}
        {sessionState === 'ended' && (
          <>
            <Separator className="bg-white/10" />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onGenerateSummary}
                disabled={isGeneratingSummary || hasSummary}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isGeneratingSummary ? (
                  <>
                    <AlertCircle className="w-3 h-3 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : hasSummary ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                    Summary Ready
                  </>
                ) : (
                  <>
                    <FileText className="w-3 h-3 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
              
              <Button
                onClick={onArchiveSession}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Archive className="w-3 h-3 mr-2" />
                Archive
              </Button>
            </div>
          </>
        )}

        {/* Session Guidelines */}
        {sessionState === 'active' && (
          <div className="mt-4 p-3 bg-lumi-aquamarine/10 border border-lumi-aquamarine/20 rounded-lg">
            <p className="text-xs text-lumi-aquamarine">
              💡 Session active: Take turns speaking with Lumi. Each person speaks completely before the other responds.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationSessionControls;

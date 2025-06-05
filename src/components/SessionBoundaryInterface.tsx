
import React from 'react';
import ConversationSessionControls from './ConversationSessionControls';
import ConversationSummaryDisplay from './ConversationSummaryDisplay';
import { useSessionBoundaryManager } from '@/hooks/useSessionBoundaryManager';
import { cn } from '@/lib/utils';

interface SessionBoundaryInterfaceProps {
  onSessionStart?: () => void;
  onSessionComplete?: (summary?: any) => void;
  onSessionArchive?: (sessionId: string) => void;
  onMessageAdd?: (content: string, speaker: 'user' | 'ai') => void;
  className?: string;
}

const SessionBoundaryInterface: React.FC<SessionBoundaryInterfaceProps> = ({
  onSessionStart,
  onSessionComplete,
  onSessionArchive,
  onMessageAdd,
  className
}) => {
  const {
    session,
    sessionState,
    isSessionActive,
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    archiveSession,
    addMessage,
    currentSummary,
    isGeneratingSummary,
    generateSummary,
    getSessionDuration,
    isCompleting,
  } = useSessionBoundaryManager({
    onSessionStart,
    onSessionComplete,
    onSessionArchive,
  });

  // Handle message addition from parent
  React.useEffect(() => {
    if (onMessageAdd && isSessionActive) {
      const handleMessage = (content: string, speaker: 'user' | 'ai') => {
        addMessage({
          content,
          speaker,
          type: speaker === 'user' ? 'audio' : 'text'
        });
      };
      
      // This would be called by the parent component when messages are received
    }
  }, [onMessageAdd, isSessionActive, addMessage]);

  const handleExportSummary = () => {
    if (currentSummary) {
      // Export logic would go here
      console.log('Exporting summary:', currentSummary);
    }
  };

  const handleShareSummary = () => {
    if (currentSummary) {
      // Share logic would go here
      console.log('Sharing summary:', currentSummary);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Session Controls */}
      <ConversationSessionControls
        session={session}
        sessionState={sessionState}
        onStartSession={startSession}
        onPauseSession={pauseSession}
        onResumeSession={resumeSession}
        onCompleteSession={completeSession}
        onArchiveSession={archiveSession}
        onGenerateSummary={generateSummary}
        getSessionDuration={getSessionDuration}
        isGeneratingSummary={isGeneratingSummary}
        hasSummary={!!currentSummary}
      />

      {/* Summary Display */}
      {currentSummary && (
        <ConversationSummaryDisplay
          summary={currentSummary}
          onExport={handleExportSummary}
          onShare={handleShareSummary}
        />
      )}

      {/* Session Status Information */}
      {isCompleting && (
        <div className="p-4 bg-lumi-aquamarine/10 border border-lumi-aquamarine/20 rounded-lg">
          <p className="text-sm text-lumi-aquamarine">
            🔄 Completing session and generating insights...
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionBoundaryInterface;

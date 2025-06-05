
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useConversationSession } from '@/hooks/useConversationSession';

export const useAudioSessionManager = () => {
  const { toast } = useToast();

  const {
    session,
    sessionState,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateActivity,
    getSessionDuration,
    isSessionActive,
  } = useConversationSession({
    onSessionStart: (session) => {
      console.log('Conversation session started:', session.id);
      toast({
        title: "Session started",
        description: "Ready for conversation",
      });
    },
    onSessionEnd: (session, reason) => {
      console.log('Conversation session ended:', session.id, reason);
      if (reason === 'timeout') {
        toast({
          title: "Session ended",
          description: "Session timed out due to inactivity",
          variant: "destructive",
        });
      }
    },
    onSessionTimeout: (session) => {
      toast({
        title: "Session timeout warning",
        description: "Session will end soon due to inactivity",
      });
    }
  });

  return {
    session,
    sessionState,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateActivity,
    getSessionDuration,
    isSessionActive,
  };
};

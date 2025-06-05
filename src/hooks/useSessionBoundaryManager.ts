
import { useState, useCallback } from 'react';
import { useConversationSession } from '@/hooks/useConversationSession';
import { useConversationSummary } from '@/hooks/useConversationSummary';
import { useToast } from '@/hooks/use-toast';
import { ConversationMessage } from '@/types/conversation';

interface SessionBoundaryManagerProps {
  onSessionStart?: () => void;
  onSessionComplete?: (summary?: any) => void;
  onSessionArchive?: (sessionId: string) => void;
}

export const useSessionBoundaryManager = ({
  onSessionStart,
  onSessionComplete,
  onSessionArchive,
}: SessionBoundaryManagerProps = {}) => {
  const { toast } = useToast();
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

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
      console.log('Session boundary: Session started', session.id);
      setConversationMessages([]);
      onSessionStart?.();
      
      toast({
        title: "Session started",
        description: "Ready for conversation with Lumi",
      });
    },
    onSessionEnd: (session, reason) => {
      console.log('Session boundary: Session ended', session.id, reason);
      
      if (reason === 'timeout') {
        toast({
          title: "Session ended",
          description: "Session timed out due to inactivity",
          variant: "destructive",
        });
      }
    },
    onSessionPause: (session) => {
      toast({
        title: "Session paused",
        description: "Conversation temporarily paused",
      });
    },
    onSessionResume: (session) => {
      toast({
        title: "Session resumed",
        description: "Conversation resumed",
      });
    }
  });

  const {
    generateSummary,
    getSummary,
    clearSummary,
    isGenerating: isGeneratingSummary,
    currentSummary,
  } = useConversationSummary();

  const addMessage = useCallback((message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...message
    };

    setConversationMessages(prev => [...prev, newMessage]);
    updateActivity();
    
    return newMessage;
  }, [updateActivity]);

  const completeSession = useCallback(async () => {
    if (!session || !isSessionActive) {
      toast({
        title: "No active session",
        description: "Cannot complete session - no active session found",
        variant: "destructive",
      });
      return;
    }

    setIsCompleting(true);

    try {
      // End the session first
      endSession('user_ended');

      // Generate summary if we have messages
      let summary = null;
      if (conversationMessages.length > 0) {
        summary = await generateSummary({
          conversationId: session.id,
          messages: conversationMessages,
          duration: getSessionDuration()
        });
      }

      onSessionComplete?.(summary);
      
      toast({
        title: "Session completed",
        description: conversationMessages.length > 0 
          ? "Conversation completed and summary generated"
          : "Session completed",
      });

    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: "Completion error",
        description: "Error completing session, but conversation has been saved",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  }, [session, isSessionActive, endSession, conversationMessages, generateSummary, getSessionDuration, onSessionComplete, toast]);

  const archiveSession = useCallback(async () => {
    if (!session) {
      toast({
        title: "No session to archive",
        description: "Cannot archive - no session found",
        variant: "destructive",
      });
      return;
    }

    try {
      onSessionArchive?.(session.id);
      
      // Clear local state
      setConversationMessages([]);
      clearSummary();
      
      toast({
        title: "Session archived",
        description: "Conversation has been archived successfully",
      });

    } catch (error) {
      console.error('Error archiving session:', error);
      toast({
        title: "Archive error",
        description: "Could not archive session",
        variant: "destructive",
      });
    }
  }, [session, onSessionArchive, clearSummary, toast]);

  const forceCompleteSession = useCallback(() => {
    if (session && isSessionActive) {
      endSession('user_ended');
      toast({
        title: "Session force-ended",
        description: "Session ended without completion flow",
      });
    }
  }, [session, isSessionActive, endSession, toast]);

  return {
    // Session state
    session,
    sessionState,
    isSessionActive,
    conversationMessages,
    
    // Session actions
    startSession,
    pauseSession,
    resumeSession,
    completeSession,
    archiveSession,
    forceCompleteSession,
    
    // Message management
    addMessage,
    
    // Summary
    currentSummary,
    isGeneratingSummary,
    generateSummary: () => {
      if (session && conversationMessages.length > 0) {
        return generateSummary({
          conversationId: session.id,
          messages: conversationMessages,
          duration: getSessionDuration()
        });
      }
      return Promise.resolve(null);
    },
    
    // Utilities
    getSessionDuration,
    isCompleting,
  };
};

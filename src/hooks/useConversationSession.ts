
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ConversationSession, 
  ConversationSessionState, 
  SessionConfig, 
  UseConversationSessionProps,
  SessionEndReason,
  SessionTransition 
} from '@/types/conversationSession';

const DEFAULT_SESSION_CONFIG: SessionConfig = {
  idleTimeoutMs: 300000, // 5 minutes
  maxSessionDurationMs: 3600000, // 1 hour
  autoCleanupDelayMs: 30000, // 30 seconds
};

export const useConversationSession = ({
  config: customConfig,
  onSessionStart,
  onSessionEnd,
  onSessionPause,
  onSessionResume,
  onSessionTimeout,
}: UseConversationSessionProps = {}) => {
  const config: SessionConfig = { ...DEFAULT_SESSION_CONFIG, ...customConfig };
  
  const [session, setSession] = useState<ConversationSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionTransition[]>([]);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout>();
  const activityTimeoutRef = useRef<NodeJS.Timeout>();

  // Generate unique session ID
  const generateSessionId = useCallback((): string => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (maxDurationTimeoutRef.current) clearTimeout(maxDurationTimeoutRef.current);
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
  }, []);

  // Record session transition
  const recordTransition = useCallback((
    from: ConversationSessionState,
    to: ConversationSessionState,
    reason: string
  ) => {
    const transition: SessionTransition = {
      from,
      to,
      timestamp: new Date(),
      reason,
    };
    
    setSessionHistory(prev => [...prev.slice(-19), transition]);
    console.log(`Session transition: ${from} -> ${to} (${reason})`);
  }, []);

  // Start a new conversation session
  const startSession = useCallback(() => {
    if (session && session.state === 'active') {
      console.warn('Session already active');
      return session;
    }

    clearAllTimeouts();

    const newSession: ConversationSession = {
      id: generateSessionId(),
      state: 'active',
      startTime: new Date(),
      endTime: null,
      pauseTime: null,
      lastActivity: new Date(),
      messageCount: 0,
      totalDuration: 0,
    };

    // Set max duration timeout
    maxDurationTimeoutRef.current = setTimeout(() => {
      endSession('max_duration');
    }, config.maxSessionDurationMs);

    // Set idle timeout
    activityTimeoutRef.current = setTimeout(() => {
      if (session?.state === 'active') {
        onSessionTimeout?.(session);
        endSession('timeout');
      }
    }, config.idleTimeoutMs);

    setSession(newSession);
    recordTransition('not_started', 'active', 'user_initiated');
    
    onSessionStart?.(newSession);
    console.log('Session started:', newSession.id);
    
    return newSession;
  }, [session, config, generateSessionId, clearAllTimeouts, recordTransition, onSessionStart, onSessionTimeout]);

  // End the current session
  const endSession = useCallback((reason: SessionEndReason = 'user_ended') => {
    if (!session || session.state === 'ended') {
      return;
    }

    clearAllTimeouts();

    const now = new Date();
    const duration = session.startTime ? now.getTime() - session.startTime.getTime() : 0;

    const endedSession: ConversationSession = {
      ...session,
      state: 'ended',
      endTime: now,
      totalDuration: duration,
    };

    setSession(endedSession);
    recordTransition(session.state, 'ended', reason);
    
    onSessionEnd?.(endedSession, reason);
    console.log(`Session ended: ${session.id} (${reason})`);

    // Auto-cleanup after delay
    setTimeout(() => {
      setSession(null);
      setSessionHistory([]);
    }, config.autoCleanupDelayMs);

  }, [session, clearAllTimeouts, recordTransition, onSessionEnd, config.autoCleanupDelayMs]);

  // Pause the current session
  const pauseSession = useCallback(() => {
    if (!session || session.state !== 'active') {
      return;
    }

    clearAllTimeouts();

    const pausedSession: ConversationSession = {
      ...session,
      state: 'paused',
      pauseTime: new Date(),
    };

    setSession(pausedSession);
    recordTransition('active', 'paused', 'user_paused');
    
    onSessionPause?.(pausedSession);
    console.log('Session paused:', session.id);

  }, [session, clearAllTimeouts, recordTransition, onSessionPause]);

  // Resume a paused session
  const resumeSession = useCallback(() => {
    if (!session || session.state !== 'paused') {
      return;
    }

    const now = new Date();
    const resumedSession: ConversationSession = {
      ...session,
      state: 'active',
      lastActivity: now,
      pauseTime: null,
    };

    // Restart timeouts
    activityTimeoutRef.current = setTimeout(() => {
      if (session?.state === 'active') {
        onSessionTimeout?.(session);
        endSession('timeout');
      }
    }, config.idleTimeoutMs);

    setSession(resumedSession);
    recordTransition('paused', 'active', 'user_resumed');
    
    onSessionResume?.(resumedSession);
    console.log('Session resumed:', session.id);

  }, [session, config.idleTimeoutMs, recordTransition, onSessionResume, onSessionTimeout, endSession]);

  // Update session activity (resets idle timeout)
  const updateActivity = useCallback(() => {
    if (!session || session.state !== 'active') {
      return;
    }

    const updatedSession: ConversationSession = {
      ...session,
      lastActivity: new Date(),
      messageCount: session.messageCount + 1,
    };

    setSession(updatedSession);

    // Reset idle timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    activityTimeoutRef.current = setTimeout(() => {
      if (session?.state === 'active') {
        onSessionTimeout?.(session);
        endSession('timeout');
      }
    }, config.idleTimeoutMs);

  }, [session, config.idleTimeoutMs, onSessionTimeout, endSession]);

  // Get session duration
  const getSessionDuration = useCallback((): number => {
    if (!session?.startTime) return 0;
    
    const endTime = session.endTime || new Date();
    return endTime.getTime() - session.startTime.getTime();
  }, [session]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  return {
    // Session state
    session,
    sessionState: session?.state || 'not_started',
    sessionHistory,
    
    // Session actions
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateActivity,
    
    // Session info
    getSessionDuration,
    isSessionActive: session?.state === 'active',
    isSessionPaused: session?.state === 'paused',
    isSessionEnded: session?.state === 'ended',
    hasSession: session !== null,
    
    // Configuration
    config,
  };
};

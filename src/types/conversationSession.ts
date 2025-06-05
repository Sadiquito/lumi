
export type ConversationSessionState = 'not_started' | 'active' | 'paused' | 'ended';

export interface ConversationSession {
  id: string;
  state: ConversationSessionState;
  startTime: Date | null;
  endTime: Date | null;
  pauseTime: Date | null;
  lastActivity: Date;
  messageCount: number;
  totalDuration: number;
  timeoutHandle?: NodeJS.Timeout;
}

export interface SessionConfig {
  idleTimeoutMs: number;
  maxSessionDurationMs: number;
  autoCleanupDelayMs: number;
}

export interface UseConversationSessionProps {
  config?: Partial<SessionConfig>;
  onSessionStart?: (session: ConversationSession) => void;
  onSessionEnd?: (session: ConversationSession, reason: SessionEndReason) => void;
  onSessionPause?: (session: ConversationSession) => void;
  onSessionResume?: (session: ConversationSession) => void;
  onSessionTimeout?: (session: ConversationSession) => void;
}

export type SessionEndReason = 'user_ended' | 'timeout' | 'max_duration' | 'error' | 'cleanup';

export interface SessionTransition {
  from: ConversationSessionState;
  to: ConversationSessionState;
  timestamp: Date;
  reason: string;
}

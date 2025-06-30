
import { useState, useCallback } from 'react';

interface TranscriptEntry {
  speaker: 'user' | 'lumi';
  text: string;
  timestamp: number;
}

interface SessionData {
  id: string;
  transcript: TranscriptEntry[];
  startTime: Date;
}

export const useSessionState = () => {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [sessionTimeoutId, setSessionTimeoutId] = useState<number | null>(null);
  const [isEndingSession, setIsEndingSession] = useState(false);

  const startSession = useCallback(() => {
    const newSession: SessionData = {
      id: `session-${Date.now()}-${Math.random()}`,
      transcript: [],
      startTime: new Date()
    };
    setCurrentSession(newSession);
    return newSession;
  }, []);

  const updateSessionTranscript = useCallback((entry: TranscriptEntry) => {
    setCurrentSession(prev => prev ? {
      ...prev,
      transcript: [...prev.transcript, entry]
    } : null);
  }, []);

  const clearSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  return {
    currentSession,
    sessionTimeoutId,
    setSessionTimeoutId,
    isEndingSession,
    setIsEndingSession,
    startSession,
    updateSessionTranscript,
    clearSession
  };
};

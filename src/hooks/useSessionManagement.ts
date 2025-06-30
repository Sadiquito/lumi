
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionState } from './session/useSessionState';
import { useSessionTimeout } from './session/useSessionTimeout';
import { useSessionValidation } from './session/useSessionValidation';
import { useSessionAnalysis } from './session/useSessionAnalysis';
import { useVoiceCommands } from './session/useVoiceCommands';
import { TranscriptEntry } from '@/types/conversation';

interface SessionAnalysisResult {
  summary: string;
  reflection: string;
  followUpQuestion: string;
}

interface SessionEndResult {
  conversationId: string;
  summary: SessionAnalysisResult | null;
}

// Define session transcript entry type to match the session state
interface SessionTranscriptEntry {
  speaker: 'user' | 'lumi';
  text: string;
  timestamp: number;
}

export const useSessionManagement = () => {
  const { user } = useAuth();
  const {
    currentSession,
    sessionTimeoutId,
    setSessionTimeoutId,
    isEndingSession,
    setIsEndingSession,
    startSession,
    updateSessionTranscript,
    clearSession
  } = useSessionState();

  const { resetSessionTimeout, clearSessionTimeout } = useSessionTimeout(sessionTimeoutId, setSessionTimeoutId);
  const { isConversationMeaningful } = useSessionValidation();
  const { generateSessionSummary } = useSessionAnalysis();
  const { shouldEndSession: shouldEndSessionByVoice } = useVoiceCommands();

  // Backup transcript capture function for when session transcript is empty
  const captureBackupTranscript = useCallback((displayTranscript: TranscriptEntry[]) => {
    
    if (!currentSession || !displayTranscript || displayTranscript.length === 0) {
      return;
    }

    // Convert display transcript to session transcript format
    displayTranscript.forEach(entry => {
      if (entry && entry.text && entry.speaker) {
        const sessionEntry: SessionTranscriptEntry = {
          speaker: entry.speaker,
          text: entry.text.replace(' [COMPLETE]', ''), // Clean up display markers
          timestamp: entry.timestamp || Date.now()
        };
        
        updateSessionTranscript(sessionEntry);
      }
    });
  }, [currentSession, updateSessionTranscript]);

  const endSession = useCallback(async (isTimeout: boolean = false, userEndCommand?: string, displayTranscript?: TranscriptEntry[]): Promise<SessionEndResult | null> => {
    if (!currentSession || !user || isEndingSession) {
      return null;
    }

    try {
      setIsEndingSession(true);
      
      // Clear any active timeout
      clearSessionTimeout();

      // Backup transcript capture if session transcript is empty but display has content
      if (currentSession.transcript.length === 0 && displayTranscript && displayTranscript.length > 0) {
        captureBackupTranscript(displayTranscript);
      }

      // Calculate session duration
      const duration = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000);

      // Convert session transcript to conversation transcript format for validation
      const transcriptForValidation: TranscriptEntry[] = currentSession.transcript.map(entry => ({
        id: `${entry.timestamp}-${entry.speaker}`,
        speaker: entry.speaker,
        text: entry.text,
        timestamp: entry.timestamp
      }));

      // Check if conversation is meaningful enough to save
      if (!isConversationMeaningful(transcriptForValidation, duration)) {
        clearSession();
        setIsEndingSession(false);
        return null;
      }

      // Generate session summary and reflection
      let sessionAnalysis: SessionAnalysisResult | null = null;
      if (currentSession.transcript.length > 0) {
        // Convert session transcript to the format expected by generateSessionSummary
        const transcriptForAnalysis = currentSession.transcript.map(entry => ({
          id: `${entry.timestamp}-${entry.speaker}`,
          speaker: entry.speaker,
          text: entry.text,
          timestamp: entry.timestamp
        }));
        sessionAnalysis = await generateSessionSummary(transcriptForAnalysis, userEndCommand);
      }

      // Convert transcript to JSON format for database storage
      const transcriptForDb = currentSession.transcript.map(entry => ({
        id: `${entry.timestamp}-${entry.speaker}`,
        speaker: entry.speaker,
        text: entry.text,
        timestamp: entry.timestamp
      }));

      // Save conversation to database with summary
      const { data: conversation, error: saveError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          transcript: transcriptForDb as any,
          conversation_duration: duration,
          session_summary: sessionAnalysis?.summary || null,
          lumi_reflection: sessionAnalysis?.reflection || null,
          lumi_question: sessionAnalysis?.followUpQuestion || null,
          psychological_insights: {
            endedBy: isTimeout ? 'timeout' : 'user_command',
            endCommand: userEndCommand || null,
            sessionLength: duration,
            messageCount: currentSession.transcript.length,
            debugInfo: {
              hadDisplayTranscript: !!displayTranscript,
              displayTranscriptLength: displayTranscript?.length || 0,
              usedBackupCapture: currentSession.transcript.length === 0 && displayTranscript && displayTranscript.length > 0
            }
          }
        })
        .select()
        .single();

      if (saveError) {
        throw saveError;
      }

      // Trigger comprehensive session analysis for profile updates
      if (currentSession.transcript.length > 0) {
        const lastUserMessage = currentSession.transcript
          .filter(entry => entry.speaker === 'user')
          .pop();

        if (lastUserMessage) {
          const { error: analysisError } = await supabase.functions.invoke('lumi-conversation', {
            body: {
              userTranscript: lastUserMessage.text,
              userId: user.id,
              conversationId: conversation.id,
              isSessionEnd: true,
              fullTranscript: currentSession.transcript
            }
          });

          if (analysisError) {
            // Analysis errors are non-critical, continue
          }
        }
      }

      clearSession();
      setIsEndingSession(false);

      return {
        conversationId: conversation.id,
        summary: sessionAnalysis
      };

    } catch (error) {
      setIsEndingSession(false);
      throw error;
    }
  }, [currentSession, user, isEndingSession, clearSessionTimeout, isConversationMeaningful, clearSession, generateSessionSummary, setIsEndingSession, captureBackupTranscript]);

  const addToTranscript = useCallback((speaker: 'user' | 'lumi', text: string) => {
    if (!currentSession || !text.trim()) {
      return;
    }

    const entry: SessionTranscriptEntry = {
      speaker,
      text: text.trim(),
      timestamp: Date.now()
    };

    updateSessionTranscript(entry);

    // Reset timeout on any activity
    resetSessionTimeout(() => endSession(true));

    // Check for voice command session endings
    if (speaker === 'user') {
      if (shouldEndSessionByVoice(text)) {
        setTimeout(() => endSession(false, text), 1000); // Delay to allow processing
      }
    }
  }, [currentSession, updateSessionTranscript, resetSessionTimeout, endSession, shouldEndSessionByVoice]);

  // Start session timeout when session is created
  useEffect(() => {
    if (currentSession && !sessionTimeoutId) {
      resetSessionTimeout(() => endSession(true));
    }
  }, [currentSession, sessionTimeoutId, resetSessionTimeout, endSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSessionTimeout();
    };
  }, [clearSessionTimeout]);

  return {
    currentSession,
    startSession,
    addToTranscript,
    endSession
  };
};

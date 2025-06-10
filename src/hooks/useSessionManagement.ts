
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SessionData {
  id: string;
  transcript: any[];
  startTime: Date;
}

export const useSessionManagement = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [sessionTimeoutId, setSessionTimeoutId] = useState<number | null>(null);
  const [isEndingSession, setIsEndingSession] = useState(false);
  
  // Session timeout duration (5 minutes of inactivity)
  const SESSION_TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutes

  // Voice commands that trigger session end
  const SESSION_END_COMMANDS = [
    'that\'s all for today',
    'i\'m done for now',
    'end session',
    'goodbye lumi',
    'that\'s it for today',
    'i think we\'re done',
    'let\'s wrap up',
    'that\'s enough for now'
  ];

  const startSession = useCallback(() => {
    const newSession: SessionData = {
      id: `session-${Date.now()}-${Math.random()}`,
      transcript: [],
      startTime: new Date()
    };
    setCurrentSession(newSession);
    console.log('Started new session:', newSession.id);
    return newSession;
  }, []);

  const resetSessionTimeout = useCallback(() => {
    // Clear existing timeout
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
    }

    // Set new timeout
    const timeoutId = window.setTimeout(() => {
      console.log('Session timed out due to inactivity');
      endSession(true); // true indicates timeout ending
    }, SESSION_TIMEOUT_DURATION);

    setSessionTimeoutId(timeoutId);
  }, [sessionTimeoutId]);

  const addToTranscript = useCallback((speaker: 'user' | 'lumi', text: string) => {
    if (!currentSession) return;

    const entry = {
      speaker,
      text,
      timestamp: Date.now()
    };

    setCurrentSession(prev => prev ? {
      ...prev,
      transcript: [...prev.transcript, entry]
    } : null);

    // Reset timeout on any activity
    resetSessionTimeout();

    // Check for voice command session endings
    if (speaker === 'user') {
      const lowerText = text.toLowerCase().trim();
      const shouldEndSession = SESSION_END_COMMANDS.some(command => 
        lowerText.includes(command)
      );

      if (shouldEndSession) {
        console.log('Voice command detected for session end:', text);
        setTimeout(() => endSession(false, text), 1000); // Delay to allow processing
      }
    }
  }, [currentSession, resetSessionTimeout]);

  const generateSessionSummary = useCallback(async (transcript: any[], userEndCommand?: string) => {
    if (!transcript.length) return null;

    try {
      console.log('Generating session summary and reflection...');

      // Prepare conversation text for analysis
      const conversationText = transcript
        .map(entry => `${entry.speaker}: ${entry.text}`)
        .join('\n');

      const { data, error } = await supabase.functions.invoke('lumi-conversation', {
        body: {
          userTranscript: userEndCommand || 'Please provide a session summary and reflection',
          userId: user?.id,
          isSessionEnd: true,
          fullTranscript: conversationText,
          requestType: 'session_summary'
        }
      });

      if (error) {
        console.error('Error generating session summary:', error);
        return null;
      }

      return {
        summary: data.sessionSummary || 'Had a meaningful conversation today.',
        reflection: data.lumiReflection || 'Thank you for sharing your thoughts with me today.',
        followUpQuestion: data.followUpQuestion || 'What would you like to explore in our next conversation?'
      };

    } catch (error) {
      console.error('Error in generateSessionSummary:', error);
      return null;
    }
  }, [user]);

  const endSession = useCallback(async (isTimeout: boolean = false, userEndCommand?: string) => {
    if (!currentSession || !user || isEndingSession) return;

    try {
      setIsEndingSession(true);
      console.log('Ending session...', { isTimeout, userEndCommand });
      
      // Clear any active timeout
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
        setSessionTimeoutId(null);
      }

      // Calculate session duration
      const duration = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000);

      // Generate session summary and reflection if there's meaningful content
      let sessionAnalysis = null;
      if (currentSession.transcript.length > 2) { // More than just greetings
        sessionAnalysis = await generateSessionSummary(currentSession.transcript, userEndCommand);
      }

      // Save conversation to database with summary
      const { data: conversation, error: saveError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          transcript: currentSession.transcript,
          conversation_duration: duration,
          session_summary: sessionAnalysis?.summary || null,
          lumi_reflection: sessionAnalysis?.reflection || null,
          lumi_question: sessionAnalysis?.followUpQuestion || null,
          psychological_insights: {
            endedBy: isTimeout ? 'timeout' : 'user_command',
            endCommand: userEndCommand || null,
            sessionLength: duration,
            messageCount: currentSession.transcript.length
          }
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving conversation:', saveError);
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
            console.error('Error in session analysis:', analysisError);
          } else {
            console.log('Session analysis completed successfully');
          }
        }
      }

      setCurrentSession(null);
      setIsEndingSession(false);
      console.log('Session ended and analyzed');

      return {
        conversationId: conversation.id,
        summary: sessionAnalysis
      };

    } catch (error) {
      console.error('Error ending session:', error);
      setIsEndingSession(false);
    }
  }, [currentSession, user, sessionTimeoutId, generateSessionSummary, isEndingSession]);

  // Start session timeout when session is created
  useEffect(() => {
    if (currentSession && !sessionTimeoutId) {
      resetSessionTimeout();
    }
  }, [currentSession, sessionTimeoutId, resetSessionTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
      }
    };
  }, [sessionTimeoutId]);

  return {
    currentSession,
    startSession,
    addToTranscript,
    endSession,
    isSessionActive: !!currentSession,
    isEndingSession,
    resetSessionTimeout
  };
};

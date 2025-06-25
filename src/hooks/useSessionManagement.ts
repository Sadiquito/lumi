
import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionState } from './session/useSessionState';
import { useSessionTimeout } from './session/useSessionTimeout';
import { useSessionValidation } from './session/useSessionValidation';
import { useSessionAnalysis } from './session/useSessionAnalysis';
import { useVoiceCommands } from './session/useVoiceCommands';

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
    clearSession,
    isSessionActive
  } = useSessionState();

  const { resetSessionTimeout, clearSessionTimeout } = useSessionTimeout(sessionTimeoutId, setSessionTimeoutId);
  const { isConversationMeaningful } = useSessionValidation();
  const { generateSessionSummary } = useSessionAnalysis();
  const { shouldEndSession: shouldEndSessionByVoice } = useVoiceCommands();

  // PHASE 4: Backup transcript capture function
  const captureBackupTranscript = useCallback((displayTranscript: any[]) => {
    console.log('🔄 PHASE 4 - Capturing backup transcript from display:', displayTranscript);
    
    if (!currentSession || !displayTranscript || displayTranscript.length === 0) {
      console.log('⚠️ PHASE 4 - No display transcript to backup');
      return;
    }

    // Convert display transcript to session transcript format
    displayTranscript.forEach(entry => {
      if (entry && entry.text && entry.speaker) {
        const sessionEntry = {
          speaker: entry.speaker,
          text: entry.text.replace(' [COMPLETE]', ''), // Clean up display markers
          timestamp: entry.timestamp || Date.now()
        };
        
        console.log('📝 PHASE 4 - Adding backup entry to session:', sessionEntry);
        updateSessionTranscript(sessionEntry);
      }
    });
  }, [currentSession, updateSessionTranscript]);

  const endSession = useCallback(async (isTimeout: boolean = false, userEndCommand?: string, displayTranscript?: any[]) => {
    if (!currentSession || !user || isEndingSession) {
      console.log('⚠️ Cannot end session:', { hasSession: !!currentSession, hasUser: !!user, isEnding: isEndingSession });
      return;
    }

    try {
      setIsEndingSession(true);
      console.log('🛑 PHASE 1 DEBUG - Ending session...', { 
        sessionId: currentSession.id,
        sessionTranscriptLength: currentSession.transcript.length,
        displayTranscriptLength: displayTranscript?.length || 0,
        isTimeout, 
        userEndCommand,
        fullSessionTranscript: currentSession.transcript,
        displayTranscript: displayTranscript
      });
      
      // Clear any active timeout
      clearSessionTimeout();

      // PHASE 4: Backup transcript capture if session transcript is empty but display has content
      if (currentSession.transcript.length === 0 && displayTranscript && displayTranscript.length > 0) {
        console.log('🔄 PHASE 4 - Session transcript empty, using display transcript as backup');
        captureBackupTranscript(displayTranscript);
      }

      // Calculate session duration
      const duration = Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000);
      console.log('⏱️ PHASE 1 DEBUG - Session duration:', duration, 'seconds');

      // PHASE 1: Debug the validation process
      console.log('🔍 PHASE 1 DEBUG - Pre-validation state:', {
        transcriptLength: currentSession.transcript.length,
        duration,
        transcript: currentSession.transcript
      });

      // Check if conversation is meaningful enough to save
      if (!isConversationMeaningful(currentSession.transcript, duration)) {
        console.log('❌ PHASE 1 DEBUG - Conversation not meaningful enough - not saving to database');
        clearSession();
        setIsEndingSession(false);
        return null;
      }

      console.log('✅ PHASE 1 DEBUG - Conversation is meaningful - saving to database with', currentSession.transcript.length, 'messages');

      // Generate session summary and reflection
      let sessionAnalysis = null;
      if (currentSession.transcript.length > 0) {
        console.log('🧠 Generating session analysis...');
        sessionAnalysis = await generateSessionSummary(currentSession.transcript, userEndCommand);
        console.log('📋 Session analysis generated:', !!sessionAnalysis);
      }

      // Save conversation to database with summary
      console.log('💾 PHASE 1 DEBUG - Saving conversation to database...');
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
        console.error('❌ PHASE 1 DEBUG - Error saving conversation:', saveError);
        throw saveError;
      }

      console.log('✅ PHASE 1 DEBUG - Conversation saved successfully with ID:', conversation.id);

      // Trigger comprehensive session analysis for profile updates
      if (currentSession.transcript.length > 0) {
        console.log('🔍 Triggering comprehensive analysis...');
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
            console.error('❌ Error in comprehensive analysis:', analysisError);
          } else {
            console.log('✅ Comprehensive analysis completed successfully');
          }
        }
      }

      clearSession();
      setIsEndingSession(false);
      console.log('🎉 PHASE 1 DEBUG - Session ended and analyzed successfully');

      return {
        conversationId: conversation.id,
        summary: sessionAnalysis
      };

    } catch (error) {
      console.error('❌ PHASE 1 DEBUG - Error ending session:', error);
      setIsEndingSession(false);
      throw error;
    }
  }, [currentSession, user, isEndingSession, clearSessionTimeout, isConversationMeaningful, clearSession, generateSessionSummary, setIsEndingSession, captureBackupTranscript, updateSessionTranscript]);

  const addToTranscript = useCallback((speaker: 'user' | 'lumi', text: string) => {
    if (!currentSession || !text.trim()) {
      console.log('⚠️ PHASE 1 DEBUG - Cannot add to transcript:', { hasSession: !!currentSession, hasText: !!text.trim() });
      return;
    }

    const entry = {
      speaker,
      text: text.trim(),
      timestamp: Date.now()
    };

    console.log('➕ PHASE 1 DEBUG - Adding to session transcript:', entry);
    updateSessionTranscript(entry);

    // Reset timeout on any activity
    resetSessionTimeout(() => endSession(true));

    // Check for voice command session endings
    if (speaker === 'user') {
      if (shouldEndSessionByVoice(text)) {
        console.log('🗣️ Voice command detected for session end:', text);
        setTimeout(() => endSession(false, text), 1000); // Delay to allow processing
      }
    }
  }, [currentSession, updateSessionTranscript, resetSessionTimeout, endSession, shouldEndSessionByVoice]);

  // Start session timeout when session is created
  useEffect(() => {
    if (currentSession && !sessionTimeoutId) {
      console.log('⏰ Setting up session timeout for session:', currentSession.id);
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
    endSession,
    isSessionActive,
    isEndingSession,
    resetSessionTimeout: () => resetSessionTimeout(() => endSession(true))
  };
};

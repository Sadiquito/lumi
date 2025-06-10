import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ConversationsList } from '@/components/ConversationsList';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { useOptimizedSTT } from '@/hooks/useOptimizedSTT';
import { useLumiConversation } from '@/hooks/useLumiConversation';
import { useOptimizedTTS } from '@/hooks/useOptimizedTTS';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { JournalLayout } from '@/components/journal/JournalLayout';
import { JournalHeader } from '@/components/journal/JournalHeader';
import { ConversationControl } from '@/components/journal/ConversationControl';
import { ConversationSection } from '@/components/journal/ConversationSection';
import { toast } from 'sonner';

interface TranscriptEntry {
  id: string;
  text: string;
  speaker: 'user' | 'lumi';
  timestamp: number;
  confidence?: number;
}

type ConversationState = 'idle' | 'listening' | 'user_speaking' | 'processing' | 'lumi_speaking' | 'ending_session';

const JournalPage = () => {
  const { user, signOut } = useAuth();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [currentAudioData, setCurrentAudioData] = useState<Float32Array | undefined>();
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false);

  // Session Management
  const { 
    currentSession, 
    startSession, 
    addToTranscript, 
    endSession, 
    isSessionActive, 
    isEndingSession,
    resetSessionTimeout 
  } = useSessionManagement();

  // Debug logging function
  const addDebugLog = useCallback((message: string) => {
    console.log('🐛 [Journal]', message);
  }, []);

  // Error handling
  const handleError = useCallback((error: string, context: string) => {
    addDebugLog(`Error in ${context}: ${error}`);
    toast.error(`${context} error: ${error}`);
  }, [addDebugLog]);

  // TTS handling
  const handleTTSSpeechStart = useCallback(() => {
    addDebugLog('Lumi started speaking');
    setConversationState('lumi_speaking');
  }, [addDebugLog]);

  const handleTTSSpeechEnd = useCallback(() => {
    addDebugLog('Lumi finished speaking - returning to listening');
    if (conversationState !== 'ending_session') {
      setConversationState('listening');
    }
  }, [addDebugLog, conversationState]);

  const { 
    speak: speakText, 
    stopSpeaking, 
    isSpeaking: isLumiSpeaking, 
    isProcessing: isTTSProcessing, 
    error: ttsError 
  } = useOptimizedTTS({
    onSpeechStart: handleTTSSpeechStart,
    onSpeechEnd: handleTTSSpeechEnd,
    onError: (error) => handleError(error, 'TTS')
  });

  // Lumi conversation handling
  const handleLumiResponse = useCallback((response: any) => {
    addDebugLog(`Lumi response received: ${response.response?.substring(0, 50)}...`);
    
    if (response.response) {
      const lumiEntry: TranscriptEntry = {
        id: `${Date.now()}-lumi-${Math.random()}`,
        text: response.response,
        speaker: 'lumi',
        timestamp: Date.now()
      };
      
      setTranscript(prev => [...prev, lumiEntry]);
      addToTranscript('lumi', response.response);
      speakText(response.response);
    }
  }, [speakText, addDebugLog, addToTranscript]);

  const { 
    sendToLumi, 
    isProcessing: isLumiProcessing, 
    error: lumiError 
  } = useLumiConversation({
    onLumiResponse: handleLumiResponse
  });

  // CRITICAL STT Result Handler - This must work correctly
  const handleSTTResult = useCallback((result: any) => {
    console.log('🎯 [Journal] STT Result received in Journal:', {
      transcript: result.transcript,
      isFinal: result.isFinal,
      confidence: result.confidence,
      transcriptLength: result.transcript?.length || 0,
      isSessionActive,
      conversationState,
      hasStartedConversation
    });
    
    if (!isSessionActive || !hasStartedConversation) {
      console.log('⏭️ [Journal] Skipping STT - session not active');
      return;
    }

    if (result.transcript && result.transcript.trim()) {
      console.log('✅ [Journal] Valid transcript received, processing...');
      
      if (result.isFinal && result.transcript.trim().length > 3) {
        const userText = result.transcript.trim();
        
        console.log('🗣️ [Journal] Final transcript - creating entry and sending to Lumi:', {
          userText: userText.substring(0, 100),
          fullLength: userText.length
        });
        
        const newEntry: TranscriptEntry = {
          id: `${Date.now()}-user-${Math.random()}`,
          text: userText,
          speaker: 'user',
          timestamp: result.timestamp || Date.now(),
          confidence: result.confidence
        };
        
        setTranscript(prev => [...prev, newEntry]);
        setCurrentUserText('');
        addToTranscript('user', userText);
        
        setConversationState('processing');
        
        console.log('📤 [Journal] Calling sendToLumi with text:', userText);
        sendToLumi(userText);
        
      } else if (!result.isFinal) {
        console.log('📝 [Journal] Interim transcript:', result.transcript);
        setCurrentUserText(result.transcript);
      }
    } else {
      console.log('⏭️ [Journal] Empty or invalid transcript, skipping');
    }
  }, [addToTranscript, sendToLumi, addDebugLog, isSessionActive, conversationState, hasStartedConversation]);

  const { 
    processAudio, 
    isProcessing: isSTTProcessing, 
    error: sttError 
  } = useOptimizedSTT({
    onTranscript: handleSTTResult,
    onError: (error) => handleError(error, 'STT')
  });

  // Audio handling
  const handleAudioData = useCallback((encodedAudio: string, isSpeech: boolean) => {
    console.log('📤 [Journal] Audio data received:', {
      encodedAudioLength: encodedAudio.length,
      isSpeech,
      isSessionActive,
      conversationState,
      hasStartedConversation
    });

    if (isSpeech && isSessionActive && hasStartedConversation && encodedAudio && encodedAudio.length > 0) {
      console.log('✅ [Journal] Processing speech audio through STT...');
      resetSessionTimeout();
      processAudio(encodedAudio, isSpeech, Date.now());
    } else {
      console.log('⏭️ [Journal] Skipping audio processing:', {
        isSpeech,
        isSessionActive,
        hasStartedConversation,
        hasAudioData: !!encodedAudio && encodedAudio.length > 0
      });
    }
  }, [processAudio, isSessionActive, resetSessionTimeout, conversationState, hasStartedConversation]);

  const handleSpeechStart = useCallback(() => {
    addDebugLog(`User speech detected`);
    
    if (isSessionActive) {
      resetSessionTimeout();
    }
    
    if (isLumiSpeaking && conversationState === 'lumi_speaking') {
      addDebugLog('Interrupting Lumi - user started speaking');
      stopSpeaking();
    }
    
    if (conversationState !== 'idle' && conversationState !== 'ending_session') {
      setConversationState('user_speaking');
    }
  }, [isLumiSpeaking, conversationState, stopSpeaking, addDebugLog, isSessionActive, resetSessionTimeout]);

  const handleSpeechEnd = useCallback(() => {
    addDebugLog(`User speech ended`);
    
    if (conversationState === 'user_speaking') {
      setConversationState('listening');
    }
  }, [conversationState, addDebugLog]);

  const handleAudioChunk = useCallback((audioData: Float32Array) => {
    setCurrentAudioData(audioData);
  }, []);

  const handleRecordingStateChange = useCallback((isRecording: boolean) => {
    addDebugLog(`Recording state changed: ${isRecording}`);
    setIsRecordingActive(isRecording);
  }, [addDebugLog]);

  // Start conversation (Lumi speaks first)
  const handleStartConversation = useCallback(async () => {
    if (!hasStartedConversation) {
      setHasStartedConversation(true);
      const session = startSession();
      setConversationState('listening');
      setTranscript([]);
      
      addDebugLog('Conversation started - Lumi will speak first, then start recording');
      
      // Lumi's opening message
      const openingMessage = "Hello! What's on your mind?";
      
      const lumiEntry: TranscriptEntry = {
        id: `${Date.now()}-lumi-opening`,
        text: openingMessage,
        speaker: 'lumi',
        timestamp: Date.now()
      };
      
      setTranscript([lumiEntry]);
      addToTranscript('lumi', openingMessage);
      speakText(openingMessage);
    } else {
      // End conversation
      if (isSessionActive) {
        setConversationState('ending_session');
        addDebugLog('Ending session...');
        
        setIsRecordingActive(false);
        await endSession();
        setConversationState('idle');
        setCurrentUserText('');
        setHasStartedConversation(false);
        addDebugLog('Session ended');
      }
    }
  }, [hasStartedConversation, startSession, endSession, isSessionActive, addDebugLog, speakText, addToTranscript]);

  // Start recording when Lumi finishes speaking her opening message
  useEffect(() => {
    if (hasStartedConversation && !isLumiSpeaking && conversationState === 'listening' && !isRecordingActive) {
      addDebugLog('Lumi finished speaking, starting recording...');
      setIsRecordingActive(true);
    }
  }, [hasStartedConversation, isLumiSpeaking, conversationState, isRecordingActive, addDebugLog]);

  // Log all state changes for debugging
  useEffect(() => {
    console.log('🔍 [Journal] State update:', {
      conversationState,
      hasStartedConversation,
      isSessionActive,
      isRecordingActive,
      isLumiSpeaking,
      isSTTProcessing,
      isLumiProcessing,
      transcriptLength: transcript.length
    });
  }, [conversationState, hasStartedConversation, isSessionActive, isRecordingActive, isLumiSpeaking, isSTTProcessing, isLumiProcessing, transcript.length]);

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: '#0f172a',
        backgroundImage: `url('/lovable-uploads/1e779805-c108-43d4-b827-10df1f9b34e9.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        <JournalHeader onSignOut={signOut} />

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center px-4 pb-8">
          {/* Central conversation control */}
          <ConversationControl
            hasStartedConversation={hasStartedConversation}
            onToggleConversation={handleStartConversation}
          />

          {/* Audio Waveform and Controls (only show during conversation) */}
          <ConversationSection
            hasStartedConversation={hasStartedConversation}
            currentAudioData={currentAudioData}
            conversationState={conversationState}
            isLumiSpeaking={isLumiSpeaking}
            isRecordingActive={isRecordingActive}
          />

          {/* Live transcript (only show during conversation) */}
          {hasStartedConversation && transcript.length > 0 && (
            <div className="w-full max-w-2xl mb-8">
              <TranscriptDisplay
                transcript={transcript}
                currentUserText={currentUserText}
                isUserSpeaking={conversationState === 'user_speaking'}
                isLumiSpeaking={isLumiSpeaking}
              />
            </div>
          )}

          {/* Journal entries section */}
          <div className="w-full max-w-4xl flex-1">
            <h3 className="text-xl font-cinzel text-center mb-6" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Your Conversations
            </h3>
            
            <div className="h-[calc(100vh-400px)]">
              <ConversationsList />
            </div>
          </div>
        </div>

        {/* AudioRecorder component - now properly controlled and ALWAYS active when conversation started */}
        {hasStartedConversation && (
          <div className="absolute bottom-0 left-0 w-1 h-1 overflow-hidden opacity-0 pointer-events-none">
            <AudioRecorder
              onAudioData={handleAudioData}
              onSpeechStart={handleSpeechStart}
              onSpeechEnd={handleSpeechEnd}
              onRecordingStateChange={handleRecordingStateChange}
              autoStart={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Journal = () => (
  <ProtectedRoute>
    <JournalPage />
  </ProtectedRoute>
);

export default Journal;

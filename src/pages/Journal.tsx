
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { ConversationsList } from '@/components/ConversationsList';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { AudioWaveform } from '@/components/AudioWaveform';
import { useOptimizedSTT } from '@/hooks/useOptimizedSTT';
import { useLumiConversation } from '@/hooks/useLumiConversation';
import { useOptimizedTTS } from '@/hooks/useOptimizedTTS';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { Circle, CircleStop } from 'lucide-react';
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
    console.log('🐛', message);
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

  // STT handling
  const handleSTTResult = useCallback((result: any) => {
    addDebugLog(`STT Result: "${result.transcript}" (final: ${result.isFinal})`);
    
    if (result.transcript && result.transcript.trim()) {
      if (result.isFinal) {
        const userText = result.transcript.trim();
        
        const newEntry: TranscriptEntry = {
          id: `${Date.now()}-${Math.random()}`,
          text: userText,
          speaker: 'user',
          timestamp: result.timestamp || Date.now(),
          confidence: result.confidence
        };
        
        setTranscript(prev => [...prev, newEntry]);
        setCurrentUserText('');
        addToTranscript('user', userText);
        
        addDebugLog(`Sending to Lumi: "${userText}"`);
        setConversationState('processing');
        sendToLumi(userText);
      } else {
        setCurrentUserText(result.transcript);
      }
    }
  }, [addToTranscript, sendToLumi, addDebugLog]);

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
    if (isSpeech && isSessionActive) {
      resetSessionTimeout();
      processAudio(encodedAudio, isSpeech, Date.now());
    }
  }, [processAudio, isSessionActive, resetSessionTimeout]);

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

  // Start conversation (Lumi speaks first)
  const handleStartConversation = useCallback(async () => {
    if (!hasStartedConversation) {
      setHasStartedConversation(true);
      const session = startSession();
      setConversationState('listening');
      setTranscript([]);
      
      addDebugLog('Conversation started - Lumi will speak first');
      
      // Lumi's opening message
      const openingMessage = "Hello! I'm here to listen and support you through your thoughts and feelings today. What's on your mind?";
      
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
        
        await endSession();
        setConversationState('idle');
        setCurrentUserText('');
        setHasStartedConversation(false);
        addDebugLog('Session ended');
      }
    }
  }, [hasStartedConversation, startSession, endSession, isSessionActive, addDebugLog, speakText, addToTranscript]);

  const handleRecordingStateChange = useCallback((isRecording: boolean) => {
    // This is handled by the start/stop conversation button
  }, []);

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/lovable-uploads/1e779805-c108-43d4-b827-10df1f9b34e9.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with sign out button */}
        <div className="flex justify-end p-6">
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 font-crimson"
          >
            Sign Out
          </Button>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col items-center px-4 pb-8">
          {/* Central conversation control */}
          <div className="flex flex-col items-center space-y-6 mb-12">
            <Button
              onClick={handleStartConversation}
              className={`
                w-24 h-24 rounded-full transition-all duration-300 
                ${hasStartedConversation 
                  ? 'bg-red-500/20 hover:bg-red-500/30 border-2 border-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]' 
                  : 'bg-cyan-400/20 hover:bg-cyan-400/30 border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                }
                backdrop-blur-sm
              `}
            >
              {hasStartedConversation ? (
                <CircleStop className="w-8 h-8 text-red-400" />
              ) : (
                <Circle className="w-8 h-8 text-cyan-400" />
              )}
            </Button>
            
            <div className="text-center space-y-4">
              <h2 className="text-lg font-cinzel text-white mb-1">
                {hasStartedConversation ? 'End Conversation' : 'Begin Conversation'}
              </h2>
              <p className="text-white/70 font-crimson text-sm">
                {hasStartedConversation ? 'Lumi is listening...' : 'Start your daily reflection with Lumi'}
              </p>
            </div>

            {/* Audio Waveform and Controls (only show during conversation) */}
            {hasStartedConversation && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <AudioWaveform
                    audioData={currentAudioData}
                    isRecording={conversationState !== 'idle'}
                    isSpeaking={conversationState === 'user_speaking'}
                    className="animate-fade-in"
                  />
                </div>
                
                {/* Status indicators */}
                <div className="flex justify-center space-x-6 text-sm">
                  <div className={`flex items-center space-x-2 ${conversationState === 'user_speaking' ? 'text-green-400' : 'text-white/40'}`}>
                    <div className={`w-3 h-3 rounded-full ${conversationState === 'user_speaking' ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
                    <span>Speaking</span>
                  </div>
                  
                  <div className={`flex items-center space-x-2 ${isLumiSpeaking ? 'text-orange-400' : 'text-white/40'}`}>
                    <div className={`w-3 h-3 rounded-full ${isLumiSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
                    <span>Lumi</span>
                  </div>
                </div>

                {/* Hidden audio recorder for functionality */}
                <div className="hidden">
                  <AudioRecorder
                    onAudioData={handleAudioData}
                    onSpeechStart={handleSpeechStart}
                    onSpeechEnd={handleSpeechEnd}
                    onRecordingStateChange={handleRecordingStateChange}
                  />
                </div>
              </div>
            )}
          </div>

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
            <h3 className="text-xl font-cinzel text-white/90 text-center mb-6">
              Your Conversations
            </h3>
            
            <div className="h-[calc(100vh-400px)]">
              <ConversationsList />
            </div>
          </div>
        </div>
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

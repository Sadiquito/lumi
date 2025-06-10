
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AudioRecorder } from '@/components/AudioRecorder';
import { TranscriptDisplay } from '@/components/TranscriptDisplay';
import { AudioWaveform } from '@/components/AudioWaveform';
import { PrivacyControls } from '@/components/PrivacyControls';
import { useOptimizedSTT } from '@/hooks/useOptimizedSTT';
import { useLumiConversation } from '@/hooks/useLumiConversation';
import { useOptimizedTTS } from '@/hooks/useOptimizedTTS';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Volume2, Mic, MicOff, AlertCircle, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface TranscriptEntry {
  id: string;
  text: string;
  speaker: 'user' | 'lumi';
  timestamp: number;
  confidence?: number;
}

type ConversationState = 'idle' | 'listening' | 'user_speaking' | 'processing' | 'lumi_speaking' | 'ending_session';

const ConversationPage = () => {
  const { user, signOut } = useAuth();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentUserText, setCurrentUserText] = useState('');
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [sessionSummary, setSessionSummary] = useState<any>(null);
  const [currentAudioData, setCurrentAudioData] = useState<Float32Array | undefined>();
  const [activeTab, setActiveTab] = useState('conversation');

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
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    console.log('🐛', logMessage);
    setDebugLogs(prev => [...prev.slice(-4), logMessage]);
  }, []);

  // Error handling with user feedback
  const handleError = useCallback((error: string, context: string) => {
    addDebugLog(`Error in ${context}: ${error}`);
    toast.error(`${context} error: ${error}`);
  }, [addDebugLog]);

  // Enhanced TTS with error handling
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

  // Enhanced Lumi conversation handling
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
      
      // Handle follow-up question
      if (response.followUpQuestion) {
        setTimeout(() => {
          const followUpEntry: TranscriptEntry = {
            id: `${Date.now()}-lumi-followup-${Math.random()}`,
            text: response.followUpQuestion,
            speaker: 'lumi',
            timestamp: Date.now()
          };
          setTranscript(prev => [...prev, followUpEntry]);
          addToTranscript('lumi', response.followUpQuestion);
          
          setTimeout(() => {
            speakText(response.followUpQuestion);
          }, 500);
        }, 1000);
      }
    }

    if (response.sessionSummary) {
      setSessionSummary({
        summary: response.sessionSummary,
        reflection: response.lumiReflection,
        followUpQuestion: response.followUpQuestion
      });
    }
  }, [speakText, addDebugLog, addToTranscript]);

  const { 
    sendToLumi, 
    isProcessing: isLumiProcessing, 
    error: lumiError 
  } = useLumiConversation({
    onLumiResponse: handleLumiResponse
  });

  // Enhanced STT handling
  const handleSTTResult = useCallback((result: any) => {
    addDebugLog(`STT Result: "${result.transcript}" (final: ${result.isFinal}, confidence: ${result.confidence})`);
    
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

  // Audio data handling with latency optimization
  const handleAudioData = useCallback((encodedAudio: string, isSpeech: boolean) => {
    if (isSpeech && isSessionActive) {
      resetSessionTimeout();
      // Process immediately for lowest latency
      processAudio(encodedAudio, isSpeech, Date.now());
    }
  }, [processAudio, isSessionActive, resetSessionTimeout]);

  // Enhanced speech detection
  const handleSpeechStart = useCallback(() => {
    addDebugLog(`User speech detected - current state: ${conversationState}`);
    
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
    addDebugLog(`User speech ended - current state: ${conversationState}`);
    
    if (conversationState === 'user_speaking') {
      setConversationState('listening');
    }
  }, [conversationState, addDebugLog]);

  // Enhanced recording state management
  const handleRecordingStateChange = useCallback((isRecording: boolean) => {
    addDebugLog(`Recording state changed: ${isRecording}`);
    
    if (isRecording) {
      const session = startSession();
      setConversationState('listening');
      setDebugLogs([]);
      setSessionSummary(null);
      addDebugLog('Conversation started - optimized for low latency');
    } else {
      if (isSessionActive) {
        setConversationState('ending_session');
        addDebugLog('Ending session...');
        
        endSession().then((result) => {
          if (result?.summary) {
            setSessionSummary(result.summary);
          }
          setConversationState('idle');
          setCurrentUserText('');
          addDebugLog('Session ended gracefully');
        });
      } else {
        setConversationState('idle');
        setCurrentUserText('');
        addDebugLog('Recording stopped');
      }
    }
  }, [addDebugLog, startSession, endSession, isSessionActive]);

  // Audio data capture for waveform
  const handleAudioChunk = useCallback((audioData: Float32Array) => {
    setCurrentAudioData(audioData);
  }, []);

  // Manual session end
  const handleManualSessionEnd = useCallback(async () => {
    if (isSessionActive && !isEndingSession) {
      setConversationState('ending_session');
      addDebugLog('Manual session end initiated');
      
      const result = await endSession();
      if (result?.summary) {
        setSessionSummary(result.summary);
      }
      
      setConversationState('idle');
      addDebugLog('Session ended manually');
    }
  }, [isSessionActive, isEndingSession, endSession, addDebugLog]);

  // Status indicators
  const getStatusInfo = () => {
    switch (conversationState) {
      case 'idle':
        return { text: 'Ready to start conversation', color: 'text-gray-600', icon: MicOff };
      case 'listening':
        return { text: 'Listening for your voice...', color: 'text-blue-600', icon: Mic };
      case 'user_speaking':
        return { text: 'You are speaking', color: 'text-green-600', icon: Mic };
      case 'processing':
        return { text: 'Processing your message...', color: 'text-purple-600', icon: Mic };
      case 'lumi_speaking':
        return { text: 'Lumi is responding', color: 'text-orange-600', icon: Volume2 };
      case 'ending_session':
        return { text: 'Ending session...', color: 'text-yellow-600', icon: Clock };
      default:
        return { text: 'Unknown state', color: 'text-gray-400', icon: MicOff };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const allErrors = [sttError, ttsError, lumiError].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-light text-gray-900">Welcome back</h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <Button
            onClick={signOut}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="privacy">
              <Settings className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversation" className="space-y-6">
            {/* Session Summary Display */}
            {sessionSummary && (
              <Card className="border-green-200 bg-green-50 animate-fade-in">
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-green-800 mb-3">Session Complete</h3>
                  <div className="space-y-3 text-green-700">
                    <p><strong>Summary:</strong> {sessionSummary.summary}</p>
                    <p><strong>Reflection:</strong> {sessionSummary.reflection}</p>
                    {sessionSummary.followUpQuestion && (
                      <p><strong>For next time:</strong> {sessionSummary.followUpQuestion}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Conversation Area */}
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-light text-gray-900">
                  Voice Conversation with Lumi
                </CardTitle>
                <p className="text-gray-600">
                  Optimized for natural, low-latency conversations
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Audio Recorder Component */}
                <AudioRecorder
                  onAudioData={handleAudioData}
                  onSpeechStart={handleSpeechStart}
                  onSpeechEnd={handleSpeechEnd}
                  onRecordingStateChange={handleRecordingStateChange}
                />

                {/* Audio Waveform */}
                {isSessionActive && (
                  <div className="flex justify-center">
                    <AudioWaveform
                      audioData={currentAudioData}
                      isRecording={conversationState !== 'idle'}
                      isSpeaking={conversationState === 'user_speaking'}
                      className="animate-fade-in"
                    />
                  </div>
                )}
                
                {/* Session Controls */}
                {isSessionActive && (
                  <div className="text-center">
                    <Button
                      onClick={handleManualSessionEnd}
                      variant="outline"
                      size="sm"
                      disabled={isEndingSession}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      {isEndingSession ? 'Ending Session...' : 'End Session'}
                    </Button>
                  </div>
                )}
                
                {/* Enhanced Status Display */}
                <div className="text-center space-y-4">
                  <div className={`flex items-center justify-center space-x-3 ${statusInfo.color}`}>
                    <StatusIcon className="w-5 h-5" />
                    <span className="text-lg font-medium">{statusInfo.text}</span>
                  </div>
                  
                  {/* Detailed Processing Indicators */}
                  <div className="flex justify-center space-x-8 text-sm">
                    <div className={`flex items-center space-x-2 ${conversationState === 'user_speaking' ? 'text-green-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full ${conversationState === 'user_speaking' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span>Speaking</span>
                    </div>
                    
                    <div className={`flex items-center space-x-2 ${isSTTProcessing ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full ${isSTTProcessing ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span>Processing</span>
                    </div>
                    
                    <div className={`flex items-center space-x-2 ${isLumiProcessing ? 'text-purple-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full ${isLumiProcessing ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'}`} />
                      <span>Thinking</span>
                    </div>
                    
                    <div className={`flex items-center space-x-2 ${isLumiSpeaking ? 'text-orange-600' : 'text-gray-400'}`}>
                      <div className={`w-3 h-3 rounded-full ${isLumiSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`} />
                      <Volume2 className="w-3 h-3" />
                      <span>Responding</span>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {allErrors.length > 0 && (
                  <div className="space-y-2">
                    {allErrors.map((error, index) => (
                      <div key={index} className="text-red-600 text-sm bg-red-50 p-3 rounded-lg flex items-center animate-fade-in">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}

                {/* Session Help */}
                {isSessionActive && (
                  <div className="bg-blue-50 p-4 rounded-lg animate-fade-in">
                    <h4 className="font-medium text-blue-900 mb-2">Natural Conversation Tips</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• Speak naturally - Lumi responds automatically</p>
                      <p>• You can interrupt Lumi anytime by speaking</p>
                      <p>• Say "That's all for today" to end naturally</p>
                      <p>• Sessions auto-end after 5 minutes of silence</p>
                    </div>
                  </div>
                )}

                {/* Debug Logs */}
                {debugLogs.length > 0 && (
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">System Status</h4>
                    <div className="space-y-1 text-xs text-gray-600 font-mono">
                      {debugLogs.map((log, index) => (
                        <div key={index}>{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Transcript Display */}
            <TranscriptDisplay
              transcript={transcript}
              currentUserText={currentUserText}
              isUserSpeaking={conversationState === 'user_speaking'}
              isLumiSpeaking={isLumiSpeaking}
            />
          </TabsContent>

          <TabsContent value="privacy">
            <PrivacyControls />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const Conversation = () => (
  <ProtectedRoute>
    <ConversationPage />
  </ProtectedRoute>
);

export default Conversation;

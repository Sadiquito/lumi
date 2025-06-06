
import React, { useState, useEffect } from 'react';
import { useConversationContext } from '@/hooks/useConversationContext';
import { useAudioRecordingFeature } from '@/hooks/useAudioRecordingFeature';
import ReadyState from './ConversationStates/ReadyState';
import LumiSpeakingState from './ConversationStates/LumiSpeakingState';
import WaitingForUserState from './ConversationStates/WaitingForUserState';
import UserRecordingState from './ConversationStates/UserRecordingState';
import ProcessingState from './ConversationStates/ProcessingState';
import ConversationHistory from './ConversationHistory';

interface LumiInitiatedConversationProps {
  onUserResponse?: (transcript: string) => void;
  onConversationEnd?: () => void;
  onStateChange?: (state: 'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing') => void;
}

type ConversationFlow = 'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing';

interface ConversationEntry {
  speaker: 'lumi' | 'user';
  message: string;
  timestamp: Date;
}

const LumiInitiatedConversation: React.FC<LumiInitiatedConversationProps> = ({
  onUserResponse,
  onConversationEnd,
  onStateChange
}) => {
  const [flowState, setFlowState] = useState<ConversationFlow>('ready');
  const [currentLumiMessage, setCurrentLumiMessage] = useState<string>('');
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);

  // Initialize conversation context with persona state
  const {
    context,
    addMessage,
    updatePersonaFromConversation,
    isPersonaLoading,
    hasPersonaData,
  } = useConversationContext();

  // Initialize audio recording with integrated transcription
  const {
    conversationState,
    isSessionActive,
    startSession,
    handleStartRecording,
    handleStopRecording,
    state: audioState,
    isListening,
    isProcessing,
  } = useAudioRecordingFeature({
    onTranscriptionComplete: (transcript: string) => {
      console.log('Transcription completed:', transcript);
      handleUserResponse(transcript);
    },
    onAIResponse: (response: string) => {
      console.log('AI response received:', response);
      handleLumiResponse(response);
    },
    onFallbackToText: () => {
      // Handle fallback to text input if needed
      console.log('Falling back to text input');
    }
  });

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(flowState);
  }, [flowState, onStateChange]);

  // Sync audio conversation state with flow state
  useEffect(() => {
    if (isListening && flowState !== 'user_recording') {
      setFlowState('user_recording');
    } else if (isProcessing && flowState !== 'processing') {
      setFlowState('processing');
    }
  }, [isListening, isProcessing, flowState]);

  // Log persona state when available
  useEffect(() => {
    if (context.personaState) {
      console.log('Conversation context with persona state:', {
        sessionId: context.sessionId,
        messageCount: context.messageCount,
        personaState: context.personaState,
        hasPersonaData,
      });
    }
  }, [context, hasPersonaData]);

  // Mock Lumi opening prompts - these will be replaced with persona-aware AI-generated content
  const getOpeningPrompts = () => {
    const basePrompts = [
      "Hello! I'm Lumi. I'm here to listen and understand you better. What's been on your mind lately?",
      "Hi there! I sense you might have something you'd like to explore today. What would you like to talk about?",
      "Welcome back! I've been thinking about our previous conversations. How are you feeling right now?",
      "Good to see you again! I'm curious - what's the most important thing happening in your life today?"
    ];

    // TODO: Use persona state to customize prompts
    if (hasPersonaData) {
      console.log('Using persona-aware prompt selection (placeholder)');
    }

    return basePrompts;
  };

  const followUpPrompts = [
    "That's really interesting. Can you tell me more about how that makes you feel?",
    "I hear you. What do you think is driving those thoughts?",
    "Thank you for sharing that with me. What would you like to explore deeper?",
    "I appreciate your openness. How has this been affecting your daily life?"
  ];

  const handleStartConversation = async () => {
    // Start audio session
    await startSession();
    
    setFlowState('lumi_speaking');
    
    // Select an opening prompt - in production this would come from persona-aware AI
    const prompts = getOpeningPrompts();
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    setCurrentLumiMessage(prompt);
    
    // Add to conversation history and context
    setConversationHistory([{
      speaker: 'lumi',
      message: prompt,
      timestamp: new Date()
    }]);

    // Add to conversation context
    addMessage('assistant', prompt);
  };

  const handleLumiFinishedSpeaking = () => {
    setFlowState('waiting_for_user');
  };

  const handleUserStartRecording = async () => {
    if (!isSessionActive) {
      await startSession();
    }
    await handleStartRecording();
    // State will be updated via useEffect watching isListening
  };

  const handleUserStopRecording = () => {
    handleStopRecording();
    // State will be updated via useEffect watching isProcessing
  };

  const handleUserResponse = (transcript: string) => {
    console.log('User response received:', transcript);
    
    // Add user response to history and context
    setConversationHistory(prev => [...prev, {
      speaker: 'user',
      message: transcript,
      timestamp: new Date()
    }]);

    // Add to conversation context
    addMessage('user', transcript);
    onUserResponse?.(transcript);
  };

  const handleLumiResponse = async (aiResponse: string) => {
    console.log('Lumi response received:', aiResponse);
    
    setCurrentLumiMessage(aiResponse);
    
    setConversationHistory(prev => [...prev, {
      speaker: 'lumi',
      message: aiResponse,
      timestamp: new Date()
    }]);

    // Add AI response to context
    addMessage('assistant', aiResponse);

    // Update persona state from conversation
    const mockInsights = {
      lastInteraction: new Date().toISOString(),
      totalConversations: (context.personaState?.totalConversations || 0) + 1,
    };

    await updatePersonaFromConversation(mockInsights);
    
    setFlowState('lumi_speaking');
  };

  const renderCurrentState = () => {
    switch (flowState) {
      case 'ready':
        return (
          <ReadyState 
            onStartConversation={handleStartConversation}
            isPersonaLoading={isPersonaLoading}
            hasPersonaData={hasPersonaData}
          />
        );

      case 'lumi_speaking':
        return (
          <LumiSpeakingState
            currentMessage={currentLumiMessage}
            onFinishedSpeaking={handleLumiFinishedSpeaking}
          />
        );

      case 'waiting_for_user':
        return <WaitingForUserState onStartRecording={handleUserStartRecording} />;

      case 'user_recording':
        return (
          <UserRecordingState
            onStopRecording={handleUserStopRecording}
          />
        );

      case 'processing':
        return <ProcessingState />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {renderCurrentState()}
      
      {/* Conversation History */}
      <ConversationHistory conversationHistory={conversationHistory} />
      
      {/* Debug: Show audio state in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-lumi-charcoal/30 rounded-lg border border-lumi-aquamarine/20">
          <p className="text-xs text-lumi-aquamarine mb-2">Audio Debug (Dev)</p>
          <pre className="text-xs text-white/60 overflow-auto">
            {JSON.stringify({
              flowState,
              conversationState,
              isSessionActive,
              isListening,
              isProcessing,
              audioRecording: audioState.isRecording,
              recordedBlobSize: null, // recordedBlob?.size
            }, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Debug: Show persona context when available */}
      {process.env.NODE_ENV === 'development' && context.personaState && (
        <div className="mt-4 p-3 bg-lumi-charcoal/30 rounded-lg border border-lumi-aquamarine/20">
          <p className="text-xs text-lumi-aquamarine mb-2">Persona Context (Dev)</p>
          <pre className="text-xs text-white/60 overflow-auto">
            {JSON.stringify(context.personaState, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LumiInitiatedConversation;

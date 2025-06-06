
import React, { useState, useEffect } from 'react';
import { useConversationContext } from '@/hooks/useConversationContext';
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

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(flowState);
  }, [flowState, onStateChange]);

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
    // Placeholder for persona-aware prompt selection
    const basePrompts = [
      "Hello! I'm Lumi. I'm here to listen and understand you better. What's been on your mind lately?",
      "Hi there! I sense you might have something you'd like to explore today. What would you like to talk about?",
      "Welcome back! I've been thinking about our previous conversations. How are you feeling right now?",
      "Good to see you again! I'm curious - what's the most important thing happening in your life today?"
    ];

    // TODO: Use persona state to customize prompts
    if (hasPersonaData) {
      console.log('Using persona-aware prompt selection (placeholder)');
      // Future: Analyze persona state to select or generate contextual prompts
    }

    return basePrompts;
  };

  const followUpPrompts = [
    "That's really interesting. Can you tell me more about how that makes you feel?",
    "I hear you. What do you think is driving those thoughts?",
    "Thank you for sharing that with me. What would you like to explore deeper?",
    "I appreciate your openness. How has this been affecting your daily life?"
  ];

  const handleStartConversation = () => {
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

  const handleUserStartRecording = () => {
    setFlowState('user_recording');
  };

  const handleUserFinishedRecording = async (transcript: string) => {
    setFlowState('processing');
    
    // Add user response to history and context
    setConversationHistory(prev => [...prev, {
      speaker: 'user',
      message: transcript,
      timestamp: new Date()
    }]);

    // Add to conversation context
    addMessage('user', transcript);

    onUserResponse?.(transcript);

    // Simulate processing time then generate Lumi's follow-up
    setTimeout(async () => {
      const followUp = followUpPrompts[Math.floor(Math.random() * followUpPrompts.length)];
      setCurrentLumiMessage(followUp);
      
      setConversationHistory(prev => [...prev, {
        speaker: 'lumi',
        message: followUp,
        timestamp: new Date()
      }]);

      // Add AI response to context
      addMessage('assistant', followUp);

      // TODO: Extract insights from conversation and update persona
      // Placeholder for future persona learning
      const mockInsights = {
        lastInteraction: new Date().toISOString(),
        totalConversations: (context.personaState?.totalConversations || 0) + 1,
        // Future: emotion analysis, topic extraction, etc.
      };

      await updatePersonaFromConversation(mockInsights);
      
      setFlowState('lumi_speaking');
    }, 2000);
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
            onStopRecording={() => handleUserFinishedRecording("Mock user response - this will be replaced with actual transcription")}
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

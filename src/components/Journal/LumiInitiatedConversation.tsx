
import React, { useState, useEffect } from 'react';
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

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(flowState);
  }, [flowState, onStateChange]);

  // Mock Lumi opening prompts - these will be replaced with AI-generated content
  const openingPrompts = [
    "Hello! I'm Lumi. I'm here to listen and understand you better. What's been on your mind lately?",
    "Hi there! I sense you might have something you'd like to explore today. What would you like to talk about?",
    "Welcome back! I've been thinking about our previous conversations. How are you feeling right now?",
    "Good to see you again! I'm curious - what's the most important thing happening in your life today?"
  ];

  const followUpPrompts = [
    "That's really interesting. Can you tell me more about how that makes you feel?",
    "I hear you. What do you think is driving those thoughts?",
    "Thank you for sharing that with me. What would you like to explore deeper?",
    "I appreciate your openness. How has this been affecting your daily life?"
  ];

  const handleStartConversation = () => {
    setFlowState('lumi_speaking');
    // Select an opening prompt - in production this would come from AI
    const prompt = openingPrompts[Math.floor(Math.random() * openingPrompts.length)];
    setCurrentLumiMessage(prompt);
    
    // Add to conversation history
    setConversationHistory([{
      speaker: 'lumi',
      message: prompt,
      timestamp: new Date()
    }]);
  };

  const handleLumiFinishedSpeaking = () => {
    setFlowState('waiting_for_user');
  };

  const handleUserStartRecording = () => {
    setFlowState('user_recording');
  };

  const handleUserFinishedRecording = (transcript: string) => {
    setFlowState('processing');
    
    // Add user response to history
    setConversationHistory(prev => [...prev, {
      speaker: 'user',
      message: transcript,
      timestamp: new Date()
    }]);

    onUserResponse?.(transcript);

    // Simulate processing time then generate Lumi's follow-up
    setTimeout(() => {
      const followUp = followUpPrompts[Math.floor(Math.random() * followUpPrompts.length)];
      setCurrentLumiMessage(followUp);
      setConversationHistory(prev => [...prev, {
        speaker: 'lumi',
        message: followUp,
        timestamp: new Date()
      }]);
      setFlowState('lumi_speaking');
    }, 2000);
  };

  const renderCurrentState = () => {
    switch (flowState) {
      case 'ready':
        return <ReadyState onStartConversation={handleStartConversation} />;

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
    </div>
  );
};

export default LumiInitiatedConversation;

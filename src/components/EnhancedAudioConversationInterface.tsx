
import React, { useState, useEffect } from 'react';
import { useAudioConversationFlow } from '@/hooks/useAudioConversationFlow';
import { useLatencyEducation } from '@/hooks/useLatencyEducation';
import { useResponseTimeEstimation } from '@/hooks/useResponseTimeEstimation';
import ConversationStateIndicator from './ConversationStateIndicator';
import ThinkingTimeDisplay from './ThinkingTimeDisplay';
import TurnBasedEducationModal from './TurnBasedEducationModal';
import ResponseTimeIndicator from './ResponseTimeIndicator';
import TurnTransitionAnimation from './TurnTransitionAnimation';
import { ConversationState } from '@/types/conversationState';

interface EnhancedAudioConversationInterfaceProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  onFallbackToText?: () => void;
}

const EnhancedAudioConversationInterface: React.FC<EnhancedAudioConversationInterfaceProps> = ({
  onTranscriptionComplete,
  onAIResponse,
  onFallbackToText
}) => {
  const [previousState, setPreviousState] = useState<ConversationState>('idle');
  const [showTransition, setShowTransition] = useState(false);
  const [lastUserInput, setLastUserInput] = useState('');

  const {
    showEducationModal,
    hasSeenEducation,
    completeEducation,
    triggerEducation,
    closeEducation,
  } = useLatencyEducation();

  const {
    currentEstimation,
    estimateResponseTime,
    clearEstimation,
  } = useResponseTimeEstimation();

  const {
    conversationState,
    isTranscribing,
    aiResponse,
    transcriptionProgress,
    thinkingProgress,
    isIdle,
    isListening,
    isProcessing,
    isSpeaking,
    isWaitingForUser,
    isWaitingForAI,
    startListening,
    getStateDuration,
    handleTranscription,
    goIdle,
  } = useAudioConversationFlow({
    onTranscriptionComplete: (transcript) => {
      setLastUserInput(transcript);
      // Estimate response time when processing starts
      estimateResponseTime(transcript, {
        messageCount: 0, // This would come from conversation history
        complexity: transcript.length > 100 ? 'complex' : 'simple'
      });
      onTranscriptionComplete?.(transcript);
    },
    onAIResponse: (response) => {
      clearEstimation();
      onAIResponse?.(response);
    },
    onFallbackToText
  });

  // Handle state transitions with animations
  useEffect(() => {
    if (conversationState !== previousState) {
      // Show transition animation for major state changes
      const shouldShowTransition = (
        (previousState === 'listening' && conversationState === 'processing') ||
        (previousState === 'processing' && conversationState === 'speaking') ||
        (previousState === 'speaking' && conversationState === 'waiting_for_user')
      );

      if (shouldShowTransition) {
        setShowTransition(true);
      }

      setPreviousState(conversationState);
    }
  }, [conversationState, previousState]);

  const handleTransitionComplete = () => {
    setShowTransition(false);
  };

  const duration = getStateDuration();

  return (
    <div className="space-y-6">
      {/* Education Modal */}
      <TurnBasedEducationModal
        isOpen={showEducationModal}
        onClose={closeEducation}
        onComplete={completeEducation}
      />

      {/* Transition Animation */}
      <TurnTransitionAnimation
        fromState={previousState}
        toState={conversationState}
        isVisible={showTransition}
        onComplete={handleTransitionComplete}
      />

      {/* Main Conversation State */}
      <ConversationStateIndicator
        state={conversationState}
        duration={duration}
        showDetails={true}
        enableCountdown={true}
      />

      {/* Enhanced Processing Display */}
      {isProcessing && (
        <div className="space-y-4">
          <ThinkingTimeDisplay
            isThinking={true}
            duration={duration}
            estimatedTimeMs={currentEstimation?.estimatedMs || 8000}
          />
          
          {currentEstimation && (
            <ResponseTimeIndicator
              isActive={true}
              estimatedTimeMs={currentEstimation.estimatedMs}
              currentDuration={duration}
              variant="detailed"
            />
          )}
        </div>
      )}

      {/* Education Trigger Button */}
      {hasSeenEducation && (
        <div className="flex justify-center">
          <button
            onClick={triggerEducation}
            className="text-xs text-white/60 hover:text-white/80 transition-colors underline"
          >
            Learn about turn-based conversations
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedAudioConversationInterface;

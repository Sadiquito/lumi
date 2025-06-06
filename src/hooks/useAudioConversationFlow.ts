
import { useConversationFlowState } from './useConversationFlowState';
import { useConversationData } from './useConversationData';
import { useTranscriptionHandler } from './useTranscriptionHandler';

interface UseAudioConversationFlowProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  onFallbackToText?: () => void;
}

export const useAudioConversationFlow = ({
  onTranscriptionComplete,
  onAIResponse,
  onFallbackToText
}: UseAudioConversationFlowProps) => {
  const {
    conversationState,
    isTranscribing,
    setIsTranscribing,
    aiResponse,
    setAiResponse,
    transcriptionProgress,
    setTranscriptionProgress,
    thinkingProgress,
    setThinkingProgress,
    getStateDuration,
    goIdle,
    startListening,
    startProcessing,
    goToSpeaking,
    isIdle,
    isListening,
    isProcessing,
    isSpeaking,
    isWaitingForUser,
    isWaitingForAI,
  } = useConversationFlowState();

  const { conversationData, setConversationData } = useConversationData();

  const { handleTranscription } = useTranscriptionHandler({
    onTranscriptionComplete,
    onAIResponse,
    onFallbackToText,
    conversationData,
    setConversationData,
    setIsTranscribing,
    setTranscriptionProgress,
    setThinkingProgress,
    setAiResponse,
    goToSpeaking,
    goIdle,
  });

  return {
    conversationState,
    isTranscribing,
    aiResponse,
    transcriptionProgress,
    thinkingProgress,
    conversationData,
    isIdle,
    isListening,
    isProcessing,
    isSpeaking,
    isWaitingForUser,
    isWaitingForAI,
    startListening,
    startProcessing,
    getStateDuration,
    handleTranscription,
    goIdle,
    setAiResponse,
  };
};

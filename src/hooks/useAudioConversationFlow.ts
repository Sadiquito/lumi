import { useState, useEffect } from 'react';
import { UseAudioConversationFlowProps } from '@/types/audioRecording';

export const useAudioConversationFlow = ({
  onTranscriptionComplete,
  onAIResponse,
  onFallbackToText
}: UseAudioConversationFlowProps) => {
  const [conversationState, setConversationState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const [conversationData, setConversationData] = useState<any>(null);
  const [stateStartTime, setStateStartTime] = useState<number>(Date.now());

  // Derived states
  const isIdle = conversationState === 'idle';
  const isListening = conversationState === 'listening';
  const isProcessing = conversationState === 'processing';
  const isSpeaking = conversationState === 'speaking';

  // Update state start time when state changes
  useEffect(() => {
    setStateStartTime(Date.now());
  }, [conversationState]);

  // Get duration of current state
  const getStateDuration = () => {
    return Date.now() - stateStartTime;
  };

  // Start listening state
  const startListening = () => {
    setConversationState('listening');
    setTranscriptionProgress(0);
    setThinkingProgress(0);
  };

  // Start processing state
  const startProcessing = () => {
    setConversationState('processing');
    setTranscriptionProgress(0);
    setThinkingProgress(0);
  };

  // Go to idle state
  const goIdle = () => {
    setConversationState('idle');
    setTranscriptionProgress(0);
    setThinkingProgress(0);
    setAiResponse('');
  };

  // Handle transcription
  const handleTranscription = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);
      setConversationState('processing');
      setTranscriptionProgress(0);

      // Simulate transcription progress
      const progressInterval = setInterval(() => {
        setTranscriptionProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Replace with actual transcription service
      await new Promise(resolve => setTimeout(resolve, 2000));
      const transcript = "This is a simulated transcript. Replace with actual transcription service.";

      clearInterval(progressInterval);
      setTranscriptionProgress(100);
      setIsTranscribing(false);

      // Notify parent of transcription completion
      onTranscriptionComplete?.(transcript);

      // Automatically generate AI response
      await generateAIResponse(transcript);

      return transcript;
    } catch (error) {
      console.error('Transcription error:', error);
      setIsTranscribing(false);
      goIdle();
      throw error;
    }
  };

  // Generate AI response
  const generateAIResponse = async (transcript: string) => {
    try {
      setConversationState('processing');
      setThinkingProgress(0);

      // Simulate thinking progress
      const progressInterval = setInterval(() => {
        setThinkingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // TODO: Replace with actual AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      const response = `I understand you said: "${transcript}". Let me think about that...`;

      clearInterval(progressInterval);
      setThinkingProgress(100);
      setAiResponse(response);
      setConversationState('speaking');

      // Notify parent of AI response
      onAIResponse?.(response);

      return response;
    } catch (error) {
      console.error('AI response error:', error);
      goIdle();
      throw error;
    }
  };

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
    startListening,
    startProcessing,
    getStateDuration,
    handleTranscription,
    goIdle,
    setAiResponse
  };
};

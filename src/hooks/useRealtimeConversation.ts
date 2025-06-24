
import { useCallback } from 'react';
import { useSessionManagement } from './useSessionManagement';
import { useTranscriptManager } from './conversation/useTranscriptManager';
import { useConnectionManager } from './conversation/useConnectionManager';
import { useModelSettings } from './conversation/useModelSettings';

// Re-export types for backward compatibility
export type { ModelOption, VoiceOption } from '@/types/conversation';

export const useRealtimeConversation = () => {
  // Integrate session management
  const { startSession, addToTranscript, endSession } = useSessionManagement();
  
  // Use transcript manager
  const {
    transcript,
    handleConversationItem,
    handleAudioTranscriptDelta,
    handleAudioTranscriptDone,
    handleUserInputTranscription,
    clearTranscript
  } = useTranscriptManager(addToTranscript);

  // Use connection manager
  const {
    isConnected,
    isConnecting,
    isLumiSpeaking,
    error,
    startConnection,
    endConnection,
    sendTextMessage
  } = useConnectionManager();

  // Use model settings
  const {
    selectedModel,
    setSelectedModel,
    selectedVoice,
    setSelectedVoice
  } = useModelSettings();

  const handleMessage = useCallback((event: any) => {
    console.log('📨 Agent event received:', event.type);

    if (event.type === 'error') {
      console.error('❌ Agent error:', event);
      return;
    }

    // Handle conversation updates
    if (event.type === 'conversation.item.appended' && event.item?.type === 'message') {
      handleConversationItem(event);
    }

    // Handle realtime events for live transcript
    if (event.type === 'response.audio_transcript.delta') {
      handleAudioTranscriptDelta(event);
    } else if (event.type === 'response.audio_transcript.done') {
      handleAudioTranscriptDone();
    }

    // Handle user input transcription
    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      handleUserInputTranscription(event);
    }
  }, [handleConversationItem, handleAudioTranscriptDelta, handleAudioTranscriptDone, handleUserInputTranscription]);

  const startConversation = useCallback(async () => {
    await startConnection(selectedModel, selectedVoice, handleMessage, startSession);
  }, [startConnection, selectedModel, selectedVoice, handleMessage, startSession]);

  const endConversation = useCallback(async () => {
    await endConnection(async () => {
      await endSession();
      clearTranscript();
    });
  }, [endConnection, endSession, clearTranscript]);

  return {
    isConnected,
    isConnecting,
    isLumiSpeaking,
    transcript,
    error,
    selectedModel,
    setSelectedModel,
    selectedVoice,
    setSelectedVoice,
    startConversation,
    endConversation,
    sendTextMessage
  };
};

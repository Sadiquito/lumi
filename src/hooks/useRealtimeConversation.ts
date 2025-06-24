
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
    console.log('📨 WebRTC event received:', event.type, event);

    if (event.type === 'error') {
      console.error('❌ WebRTC error:', event);
      return;
    }

    // Handle conversation item creation (when messages are added to conversation)
    if (event.type === 'conversation.item.created') {
      console.log('📝 Conversation item created:', event);
      handleConversationItem(event);
    }

    // Handle live audio transcript deltas (Lumi speaking)
    if (event.type === 'response.text.delta') {
      console.log('🗣️ Response text delta:', event.delta);
      handleAudioTranscriptDelta(event);
    } else if (event.type === 'response.text.done') {
      console.log('✅ Response text done');
      handleAudioTranscriptDone();
    }

    // Handle user input transcription (user speaking)
    if (event.type === 'input_audio_buffer.speech_stopped') {
      console.log('🎤 User speech stopped');
      // The transcription will come in a separate event
    }

    // Handle user speech transcription completion
    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      console.log('📝 User transcription completed:', event.transcript);
      handleUserInputTranscription(event);
    }

    // Handle response creation and completion
    if (event.type === 'response.created') {
      console.log('🤖 Response started');
    } else if (event.type === 'response.done') {
      console.log('✅ Response completed');
    }
  }, [handleConversationItem, handleAudioTranscriptDelta, handleAudioTranscriptDone, handleUserInputTranscription]);

  const startConversation = useCallback(async () => {
    console.log('🚀 Starting conversation and session...');
    
    // Start session first
    const session = startSession();
    console.log('📋 Session started:', session.id);
    
    // Then start WebRTC connection
    await startConnection(selectedModel, selectedVoice, handleMessage, () => {
      console.log('🔗 Connection established, session already started');
    });
  }, [startConnection, selectedModel, selectedVoice, handleMessage, startSession]);

  const endConversation = useCallback(async () => {
    console.log('🛑 Ending conversation and session...');
    
    await endConnection(async () => {
      console.log('💾 Saving session...');
      const result = await endSession();
      console.log('✅ Session saved:', result);
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

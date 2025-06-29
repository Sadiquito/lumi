import { useCallback } from 'react';
import { useSessionManagement } from './useSessionManagement';
import { useTranscriptManager } from './conversation/useTranscriptManager';
import { useConnectionManager } from './conversation/useConnectionManager';
import { useModelSettings } from './conversation/useModelSettings';

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
    endConnection
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

    // Enhanced user input transcription handling with multiple event types
    if (event.type === 'conversation.item.input_audio_transcription.completed' || 
        event.type === 'input_audio_transcription.completed' ||
        event.type === 'conversation.item.created' && event.item?.role === 'user') {
      console.log('🎤 User transcription event detected:', event.type, event);
      handleUserInputTranscription(event);
    }

    // Handle user speech detection and response events (logging only)
    if (event.type === 'input_audio_buffer.speech_started') {
      console.log('🎤 User speech started');
    } else if (event.type === 'input_audio_buffer.speech_stopped') {
      console.log('🎤 User speech stopped');
    } else if (event.type === 'response.created') {
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
    await startConnection(selectedModel, selectedVoice, handleMessage);
  }, [startConnection, selectedModel, selectedVoice, handleMessage, startSession]);

  const endConversation = useCallback(async () => {
    console.log('🛑 Ending conversation and session with transcript:', transcript.length, 'entries');
    
    await endConnection(async (displayTranscript) => {
      console.log('💾 Saving session with display transcript backup...');
      const result = await endSession(false, undefined, displayTranscript || transcript);
      console.log('✅ Session saved:', result);
      clearTranscript();
    }, transcript);
  }, [endConnection, endSession, clearTranscript, transcript]);

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
    endConversation
  };
};

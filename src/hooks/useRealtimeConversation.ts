import { useState, useCallback, useRef } from 'react';
import { useSessionManagement } from './useSessionManagement';
import { useTranscriptManager } from './conversation/useTranscriptManager';
import { useConnectionManager } from './conversation/useConnectionManager';
import { useModelSettings } from './conversation/useModelSettings';
import { TranscriptEntry } from '@/types/conversation';

interface RealtimeEvent {
  type: string;
  [key: string]: unknown;
}

export const useRealtimeConversation = () => {
  const [error, setError] = useState<string | null>(null);
  const { 
    currentSession, 
    startSession, 
    addToTranscript, 
    endSession 
  } = useSessionManagement();

  const {
    transcript,
    handleConversationItem,
    handleAudioTranscriptDelta,
    handleAudioTranscriptDone,
    handleUserInputTranscription,
    clearTranscript
  } = useTranscriptManager(addToTranscript);

  const {
    isConnected,
    isConnecting,
    isLumiSpeaking,
    error: connectionError,
    startConnection,
    endConnection
  } = useConnectionManager();

  const {
    selectedModel,
    setSelectedModel,
    selectedVoice,
    setSelectedVoice
  } = useModelSettings();

  const isFirstMessage = useRef(true);

  const handleMessage = useCallback((message: RealtimeEvent) => {
    // Reset error state on successful message
    if (error) {
      setError(null);
    }

    if (message.type === 'error') {
      setError(message.error as string || 'Unknown error occurred');
      return;
    }

    // Handle specific message types
    switch (message.type) {
      case 'session.created':
        break;
      
      case 'response.audio.transcript.delta':
        handleAudioTranscriptDelta(message);
        break;
      
      case 'response.audio.transcript.done':
        handleAudioTranscriptDone();
        break;
      
      case 'conversation.item.created':
        handleConversationItem(message);
        break;
      
      case 'response.done':
        break;
      
      case 'input_audio_buffer.speech_started':
        break;
      
      case 'input_audio_buffer.speech_stopped':
        break;
      
      case 'conversation.item.input_audio_transcription.completed':
      case 'input_audio_transcription.completed':
        handleUserInputTranscription(message);
        break;
      
      default:
        // Handle unknown message types silently
        break;
    }
  }, [error, handleAudioTranscriptDelta, handleAudioTranscriptDone, handleConversationItem, handleUserInputTranscription]);

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      
      // Start session first
      const session = startSession();
      if (!session) {
        throw new Error('Failed to start session');
      }
      
      // Clear any existing transcript
      clearTranscript();
      isFirstMessage.current = true;
      
      // Start WebRTC connection
      await startConnection(selectedModel, selectedVoice, handleMessage);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start conversation';
      setError(errorMessage);
    }
  }, [selectedModel, selectedVoice, startSession, clearTranscript, startConnection, handleMessage]);

  const endConversation = useCallback(async () => {
    try {
      // End WebRTC connection and pass transcript for backup
      await endConnection(endSession, transcript);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end conversation';
      setError(errorMessage);
    }
  }, [endConnection, endSession, transcript]);

  // Combine connection error with local error
  const combinedError = connectionError || error;

  return {
    // Connection state
    isConnected,
    isConnecting,
    isLumiSpeaking,
    
    // Transcript and session
    transcript,
    currentSession,
    
    // Model settings
    selectedModel,
    setSelectedModel,
    selectedVoice,
    setSelectedVoice,
    
    // Actions
    startConversation,
    endConversation,
    
    // Error state
    error: combinedError
  };
};

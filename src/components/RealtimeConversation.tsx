
import React from 'react';
import { useRealtimeConversation } from '@/hooks/useRealtimeConversation';
import { ConversationButton } from './conversation/ConversationButton';
import { ModelSelector } from './conversation/ModelSelector';
import { VoiceSelector } from './conversation/VoiceSelector';
import { ConversationStatus } from './conversation/ConversationStatus';
import { ErrorDisplay } from './conversation/ErrorDisplay';
import { LiveTranscript } from './conversation/LiveTranscript';

export const RealtimeConversation: React.FC = () => {
  const {
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
  } = useRealtimeConversation();

  const handleToggleConversation = () => {
    if (isConnected) {
      endConversation();
    } else {
      startConversation();
    }
  };

  // Add error boundary behavior
  if (error && error.includes('React')) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <ErrorDisplay error={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Connection Control */}
      <div className="flex flex-col items-center space-y-4">
        <ConversationButton
          isConnected={isConnected}
          isConnecting={isConnecting}
          onToggleConversation={handleToggleConversation}
        />

        {/* Model and Voice Selectors */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            disabled={isConnected || isConnecting}
          />
          
          <VoiceSelector
            selectedVoice={selectedVoice}
            onVoiceChange={setSelectedVoice}
            disabled={isConnected || isConnecting}
          />
        </div>
        
        <ConversationStatus
          isConnected={isConnected}
          isConnecting={isConnecting}
          isLumiSpeaking={isLumiSpeaking}
          error={error}
          selectedModel={selectedModel}
        />
      </div>

      {/* Error Display */}
      {error && !error.includes('React') && (
        <ErrorDisplay error={error} />
      )}

      {/* Live Transcript */}
      {isConnected && (
        <LiveTranscript
          transcript={transcript}
          isLumiSpeaking={isLumiSpeaking}
        />
      )}
    </div>
  );
};


import React from 'react';
import { PersonaState } from '@/lib/persona-state';

type ConversationFlow = 'ready' | 'lumi_speaking' | 'waiting_for_user' | 'user_recording' | 'processing';

interface ConversationDebugPanelsProps {
  flowState: ConversationFlow;
  conversationState: any;
  isSessionActive: boolean;
  isListening: boolean;
  isProcessing: boolean;
  audioRecording: boolean;
  personaState?: PersonaState | null;
}

const ConversationDebugPanels: React.FC<ConversationDebugPanelsProps> = ({
  flowState,
  conversationState,
  isSessionActive,
  isListening,
  isProcessing,
  audioRecording,
  personaState,
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Audio Debug Panel */}
      <div className="mt-4 p-3 bg-lumi-charcoal/30 rounded-lg border border-lumi-aquamarine/20">
        <p className="text-xs text-lumi-aquamarine mb-2">Audio Debug (Dev)</p>
        <pre className="text-xs text-white/60 overflow-auto">
          {JSON.stringify({
            flowState,
            conversationState,
            isSessionActive,
            isListening,
            isProcessing,
            audioRecording,
            recordedBlobSize: null,
          }, null, 2)}
        </pre>
      </div>

      {/* Persona Context Panel */}
      {personaState && (
        <div className="mt-4 p-3 bg-lumi-charcoal/30 rounded-lg border border-lumi-aquamarine/20">
          <p className="text-xs text-lumi-aquamarine mb-2">Persona Context (Dev)</p>
          <pre className="text-xs text-white/60 overflow-auto">
            {JSON.stringify(personaState, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
};

export default ConversationDebugPanels;


import React from 'react';
import { Volume2, AlertCircle } from 'lucide-react';
import { ModelOption } from '@/hooks/useRealtimeConversation';

interface ConversationStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  isLumiSpeaking: boolean;
  error: string | null;
  selectedModel: ModelOption;
}

export const ConversationStatus: React.FC<ConversationStatusProps> = ({
  isConnected,
  isConnecting,
  isLumiSpeaking,
  error,
  selectedModel
}) => {
  const getModelDisplayName = (model: ModelOption) => {
    return model === 'gpt-4o' ? 'GPT-4o (More Capable)' : 'GPT-4o Mini (Faster & Cost-Effective)';
  };

  const getConnectionStatus = () => {
    if (error) return { text: 'Connection Error', color: 'text-red-400' };
    if (isConnecting) return { text: 'Connecting...', color: 'text-yellow-400' };
    if (isConnected) return { text: 'Connected (WebRTC)', color: 'text-green-400' };
    return { text: 'Disconnected', color: 'text-gray-400' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <>
      <div className="text-center space-y-2">
        <h2 className="text-lg font-cinzel text-white">
          {isConnecting ? 'Connecting...' : isConnected ? 'End Conversation' : 'Begin Conversation'}
        </h2>
        <p className="font-crimson text-sm text-white/70">
          {isConnecting 
            ? `Establishing connection with ${getModelDisplayName(selectedModel)}...`
            : isConnected 
              ? isLumiSpeaking 
                ? 'Lumi is speaking...' 
                : `Connected to ${getModelDisplayName(selectedModel)} - Speak naturally`
              : `Start your voice conversation with Lumi using ${getModelDisplayName(selectedModel)}`
          }
        </p>
      </div>

      {/* Status Indicators */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className={`flex items-center space-x-2 ${connectionStatus.color}`}>
          <div className={`w-3 h-3 rounded-full ${
            error ? 'bg-red-500' : 
            isConnecting ? 'bg-yellow-500 animate-pulse' : 
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-white/20'
          }`} />
          <span>{connectionStatus.text}</span>
          {error && <AlertCircle className="w-4 h-4" />}
        </div>
        
        <div className={`flex items-center space-x-2 ${isLumiSpeaking ? 'text-orange-400' : 'text-white/40'}`}>
          <div className={`w-3 h-3 rounded-full ${isLumiSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
          <span>Lumi Speaking</span>
          {isLumiSpeaking && <Volume2 className="w-4 h-4 animate-pulse" />}
        </div>
      </div>
    </>
  );
};

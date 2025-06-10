
import React from 'react';

interface ConversationStatusProps {
  conversationState: string;
  isLumiSpeaking: boolean;
  isRecordingActive: boolean;
}

export const ConversationStatus: React.FC<ConversationStatusProps> = ({
  conversationState,
  isLumiSpeaking,
  isRecordingActive,
}) => {
  return (
    <div className="flex justify-center space-x-6 text-sm">
      <div className={`flex items-center space-x-2 ${conversationState === 'user_speaking' ? 'text-green-400' : 'text-white/40'}`}>
        <div className={`w-3 h-3 rounded-full ${conversationState === 'user_speaking' ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
        <span>Speaking</span>
      </div>
      
      <div className={`flex items-center space-x-2 ${isLumiSpeaking ? 'text-orange-400' : 'text-white/40'}`}>
        <div className={`w-3 h-3 rounded-full ${isLumiSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-white/20'}`} />
        <span>Lumi</span>
      </div>
      
      <div className={`flex items-center space-x-2 ${isRecordingActive ? 'text-blue-400' : 'text-white/40'}`}>
        <div className={`w-3 h-3 rounded-full ${isRecordingActive ? 'bg-blue-500 animate-pulse' : 'bg-white/20'}`} />
        <span>Recording</span>
      </div>
    </div>
  );
};

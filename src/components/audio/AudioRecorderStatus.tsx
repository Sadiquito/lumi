
import React from 'react';

interface AudioRecorderStatusProps {
  isRecording: boolean;
  isSpeaking: boolean;
}

export const AudioRecorderStatus: React.FC<AudioRecorderStatusProps> = ({
  isRecording,
  isSpeaking,
}) => {
  const getStatusText = () => {
    if (!isRecording) return 'Ready to start conversation';
    if (isSpeaking) return 'You are speaking...';
    return 'Listening for your voice...';
  };

  const getStatusColor = () => {
    if (!isRecording) return 'text-gray-600';
    if (isSpeaking) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-light text-gray-900">
        Turn-Based Voice Conversation
      </h3>
      <p className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </p>
    </div>
  );
};

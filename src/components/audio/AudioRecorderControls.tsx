
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface AudioRecorderControlsProps {
  isRecording: boolean;
  isSpeaking: boolean;
  onToggleRecording: () => void;
}

export const AudioRecorderControls: React.FC<AudioRecorderControlsProps> = ({
  isRecording,
  isSpeaking,
  onToggleRecording,
}) => {
  const getButtonIcon = () => {
    if (!isRecording) return <Mic className="w-6 h-6" />;
    if (isSpeaking) return <Volume2 className="w-6 h-6" />;
    return <MicOff className="w-6 h-6" />;
  };

  const getButtonText = () => {
    if (!isRecording) return 'Start Conversation';
    return 'Stop Conversation';
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={onToggleRecording}
        size="lg"
        className={`
          px-12 py-8 text-xl rounded-full shadow-lg transition-all duration-200 hover:shadow-xl
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-indigo-400 hover:bg-indigo-500 text-white'
          }
          ${isSpeaking ? 'animate-pulse' : ''}
        `}
      >
        {getButtonIcon()}
        <span className="ml-3">{getButtonText()}</span>
      </Button>

      {isRecording && (
        <div className="space-y-3">
          <div className="flex justify-center space-x-6 text-sm">
            <div className={`flex items-center space-x-2 ${isSpeaking ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span>Voice Detected</span>
            </div>
            <div className={`flex items-center space-x-2 ${!isSpeaking && isRecording ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-3 h-3 rounded-full ${!isSpeaking && isRecording ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <span>Listening</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">
              • Speak naturally - Lumi will respond automatically<br/>
              • You can interrupt Lumi at any time by speaking<br/>
              • Pause briefly between thoughts for best recognition
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

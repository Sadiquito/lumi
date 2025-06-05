
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface AudioRecordingIdleStateProps {
  disabled: boolean;
  onStartRecording: () => void;
}

const AudioRecordingIdleState: React.FC<AudioRecordingIdleStateProps> = ({
  disabled,
  onStartRecording
}) => {
  return (
    <div className="text-center space-y-4">
      <p className="text-white/70 text-lg mb-6">
        💭 Your turn to speak
      </p>
      
      <Button
        onClick={onStartRecording}
        disabled={disabled}
        size="lg"
        className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-6 px-8 text-xl rounded-full"
      >
        <Mic className="w-6 h-6 mr-3" />
        Tap to speak
      </Button>
      
      <p className="text-white/60 text-sm">
        Press and speak your thoughts naturally
      </p>
    </div>
  );
};

export default AudioRecordingIdleState;

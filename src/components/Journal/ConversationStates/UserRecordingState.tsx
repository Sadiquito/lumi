
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface UserRecordingStateProps {
  onStopRecording: () => void;
}

const UserRecordingState: React.FC<UserRecordingStateProps> = ({ onStopRecording }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-coral/80 to-lumi-coral/60 flex items-center justify-center shadow-2xl">
            <Mic className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
          Recording your response
        </h3>
        <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
          Speak naturally - Lumi is listening
        </p>
      </div>

      <div className="text-center">
        <Button
          onClick={onStopRecording}
          variant="outline"
          className="border-lumi-coral/40 text-lumi-coral hover:bg-lumi-coral/10"
        >
          Stop Recording
        </Button>
      </div>
    </div>
  );
};

export default UserRecordingState;

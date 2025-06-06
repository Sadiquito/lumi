
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';

interface WaitingForUserStateProps {
  onStartRecording: () => void;
}

const WaitingForUserState: React.FC<WaitingForUserStateProps> = ({ onStartRecording }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-aquamarine/80 to-lumi-aquamarine/60 flex items-center justify-center shadow-2xl animate-pulse">
            <Mic className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
          Your turn to speak
        </h3>
        <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
          Share your thoughts with Lumi
        </p>
      </div>

      <div className="text-center">
        <Button
          onClick={onStartRecording}
          className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white py-6 px-12 text-lg font-medium rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
          size="lg"
        >
          <Mic className="w-6 h-6 mr-3" />
          Start Recording
        </Button>
      </div>
    </div>
  );
};

export default WaitingForUserState;


import React from 'react';
import { Volume2 } from 'lucide-react';
import TextToSpeech from './TextToSpeech';

interface AudioRecordingSpeakingStateProps {
  aiResponse: string;
}

const AudioRecordingSpeakingState: React.FC<AudioRecordingSpeakingStateProps> = ({
  aiResponse
}) => {
  const renderWaveformAnimation = () => (
    <div className="flex items-center justify-center space-x-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-lumi-aquamarine rounded-full animate-pulse"
          style={{
            height: `${20 + Math.random() * 20}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="text-center space-y-4 p-6 bg-lumi-deep-space/20 rounded-lg border border-lumi-aquamarine/20">
      <div className="flex items-center justify-center space-x-3">
        <Volume2 className="w-6 h-6 text-lumi-aquamarine" />
        <span className="text-white text-lg font-medium">Lumi is responding...</span>
      </div>
      {renderWaveformAnimation()}
      
      {aiResponse && (
        <div className="mt-4">
          <TextToSpeech
            text={aiResponse}
            variant="enhanced"
            autoPlay={true}
          />
        </div>
      )}
    </div>
  );
};

export default AudioRecordingSpeakingState;

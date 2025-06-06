
import React from 'react';
import TextToSpeech from '@/components/TextToSpeech';

interface TTSFeatureGateProps {
  text?: string;
  children?: React.ReactNode;
  showAlert?: boolean;
  variant?: 'default' | 'compact' | 'icon-only' | 'enhanced';
  autoPlay?: boolean;
  showVoiceSelector?: boolean;
}

const TTSFeatureGate: React.FC<TTSFeatureGateProps> = ({ 
  text,
  children, 
  showAlert = true,
  variant = 'default',
  autoPlay = false,
  showVoiceSelector = false
}) => {
  // All users now have TTS access - no trial restrictions
  if (text) {
    return (
      <div className="flex items-center space-x-2">
        <TextToSpeech 
          text={text} 
          variant={variant}
          autoPlay={autoPlay}
          showVoiceSelector={showVoiceSelector}
        />
        {children}
      </div>
    );
  }

  // If no text provided, just show children
  return <>{children}</>;
};

export default TTSFeatureGate;

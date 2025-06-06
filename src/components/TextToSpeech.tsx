
import React, { useState } from 'react';
import { useElevenLabsConfig } from '@/hooks/useElevenLabsConfig';
import { DEFAULT_VOICE_ID } from '@/utils/elevenLabsConfig';

import { useTextToSpeech } from '@/hooks/useTextToSpeech';

import TTSEnhancedVariant from './TTSEnhancedVariant';
import TTSIconOnlyVariant from './TTSIconOnlyVariant';
import TTSCompactVariant from './TTSCompactVariant';
import TTSDefaultVariant from './TTSDefaultVariant';

interface TextToSpeechProps {
  text: string;
  className?: string;
  variant?: 'default' | 'compact' | 'icon-only' | 'enhanced';
  autoPlay?: boolean;
  showVoiceSelector?: boolean;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ 
  text, 
  className = '', 
  variant = 'default',
  autoPlay = false,
  showVoiceSelector = false
}) => {
  const [selectedVoice, setSelectedVoice] = useState<string>(DEFAULT_VOICE_ID);
  
  const { config, loading: configLoading } = useElevenLabsConfig();
  
  const {
    isPlaying,
    isLoading,
    audioUrl,
    error,
    audioRef,
    handlePlay,
    handlePause,
    handleAudioEnd,
    handleAudioError,
    handleRetry
  } = useTextToSpeech({
    text,
    autoPlay,
    selectedVoice
  });

  if (configLoading || !config.isConfigured) {
    return null;
  }

  // All users now have TTS access

  const commonProps = {
    text,
    isLoading,
    isPlaying,
    audioUrl,
    error,
    audioRef,
    onPlay: handlePlay,
    onPause: handlePause,
    onRetry: handleRetry,
    onAudioEnd: handleAudioEnd,
    onAudioError: handleAudioError,
    className
  };

  switch (variant) {
    case 'enhanced':
      return (
        <TTSEnhancedVariant
          {...commonProps}
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          showVoiceSelector={showVoiceSelector}
        />
      );
    
    case 'icon-only':
      return <TTSIconOnlyVariant {...commonProps} />;
    
    case 'compact':
      return <TTSCompactVariant {...commonProps} />;
    
    default:
      return <TTSDefaultVariant {...commonProps} />;
  }
};

export default TextToSpeech;

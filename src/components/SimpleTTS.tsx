
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface SimpleTTSProps {
  text: string;
  variant?: 'default' | 'compact' | 'icon-only';
  autoPlay?: boolean;
  className?: string;
}

const SimpleTTS: React.FC<SimpleTTSProps> = ({ 
  text, 
  variant = 'default',
  autoPlay = false,
  className = '' 
}) => {
  const { handlePlay, handlePause, isPlaying } = useTextToSpeech({
    text,
    autoPlay
  });

  const handleToggle = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  if (variant === 'icon-only') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className={className}
      >
        {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className={className}
      >
        {isPlaying ? <VolumeX className="w-3 h-3 mr-1" /> : <Volume2 className="w-3 h-3 mr-1" />}
        {isPlaying ? 'Stop' : 'Listen'}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleToggle}
      className={className}
    >
      {isPlaying ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
      {isPlaying ? 'Stop Audio' : 'Listen to Response'}
    </Button>
  );
};

export default SimpleTTS;

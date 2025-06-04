
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface AudioProgressProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  className?: string;
}

const AudioProgress: React.FC<AudioProgressProps> = ({ audioRef, className = '' }) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        setProgress(progressPercent);
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => setProgress(0));

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', () => setProgress(0));
    };
  }, [audioRef]);

  if (!duration) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Progress 
        value={progress} 
        className="flex-1 h-1 bg-lumi-charcoal border-none"
        style={{
          background: 'linear-gradient(to right, rgba(78, 205, 196, 0.2) 0%, rgba(78, 205, 196, 0.1) 100%)'
        }}
      />
      <span className="text-xs text-white/60 min-w-[40px]">
        {Math.floor(duration)}s
      </span>
    </div>
  );
};

export default AudioProgress;


import React from 'react';
import { cn } from '@/lib/utils';

interface WaveformIndicatorProps {
  isActive?: boolean;
  barCount?: number;
  className?: string;
  color?: 'aquamarine' | 'coral' | 'gold';
}

const WaveformIndicator: React.FC<WaveformIndicatorProps> = ({
  isActive = true,
  barCount = 5,
  className,
  color = 'aquamarine'
}) => {
  const colorClasses = {
    aquamarine: 'bg-lumi-aquamarine',
    coral: 'bg-lumi-sunset-coral',
    gold: 'bg-lumi-sunset-gold'
  };

  return (
    <div className={cn("flex items-center justify-center space-x-1", className)}>
      {[...Array(barCount)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-200",
            colorClasses[color],
            isActive ? "animate-pulse" : "opacity-30"
          )}
          style={{
            height: isActive ? `${20 + (Math.sin(Date.now() / 200 + i) * 10)}px` : '8px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );
};

export default WaveformIndicator;


import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponseTimeIndicatorProps {
  isActive: boolean;
  estimatedTimeMs: number;
  currentDuration: number;
  className?: string;
  variant?: 'compact' | 'detailed';
}

const getTimeCategory = (timeMs: number) => {
  if (timeMs <= 3000) return { label: 'Quick', icon: Zap, color: 'text-green-400' };
  if (timeMs <= 8000) return { label: 'Thoughtful', icon: Clock, color: 'text-lumi-sunset-coral' };
  return { label: 'Deep', icon: Coffee, color: 'text-yellow-400' };
};

const ResponseTimeIndicator: React.FC<ResponseTimeIndicatorProps> = ({
  isActive,
  estimatedTimeMs,
  currentDuration,
  className,
  variant = 'compact'
}) => {
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setDisplayTime(0);
      return;
    }

    const interval = setInterval(() => {
      setDisplayTime(currentDuration);
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, currentDuration]);

  if (!isActive) return null;

  const category = getTimeCategory(estimatedTimeMs);
  const Icon = category.icon;
  const progress = Math.min((displayTime / estimatedTimeMs) * 100, 100);
  const remainingTime = Math.max(estimatedTimeMs - displayTime, 0);
  const remainingSeconds = Math.ceil(remainingTime / 1000);

  if (variant === 'compact') {
    return (
      <Badge
        variant="outline"
        className={cn(
          "flex items-center space-x-2 animate-pulse",
          "bg-lumi-deep-space/60 border-lumi-sunset-coral/30 text-white",
          className
        )}
      >
        <Icon className={cn("w-3 h-3", category.color)} />
        <span className="text-xs">
          ~{remainingSeconds}s
        </span>
      </Badge>
    );
  }

  return (
    <div className={cn(
      "flex items-center space-x-3 p-3 rounded-lg",
      "bg-lumi-deep-space/30 border border-lumi-sunset-coral/20",
      className
    )}>
      <Icon className={cn("w-5 h-5", category.color)} />
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white font-medium">{category.label} Response</span>
          <span className="text-white/60">~{remainingSeconds}s remaining</span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              "bg-gradient-to-r from-lumi-sunset-coral to-lumi-aquamarine"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ResponseTimeIndicator;

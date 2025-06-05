
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TurnCountdownTimerProps {
  timeoutMs?: number;
  onTimeout?: () => void;
  isActive: boolean;
  turnOwner: 'user' | 'ai' | 'none';
  className?: string;
}

const TurnCountdownTimer: React.FC<TurnCountdownTimerProps> = ({
  timeoutMs,
  onTimeout,
  isActive,
  turnOwner,
  className
}) => {
  const [timeLeft, setTimeLeft] = useState(timeoutMs || 0);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isActive || !timeoutMs || timeoutMs === 0) {
      setTimeLeft(timeoutMs || 0);
      setProgress(100);
      return;
    }

    setTimeLeft(timeoutMs);
    setProgress(100);

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 100; // Update every 100ms
        const newProgress = Math.max(0, (newTime / timeoutMs) * 100);
        setProgress(newProgress);

        if (newTime <= 0) {
          onTimeout?.();
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, timeoutMs, onTimeout]);

  if (!isActive || !timeoutMs || timeoutMs === 0 || turnOwner === 'none') {
    return null;
  }

  const seconds = Math.ceil(timeLeft / 1000);
  const isUrgent = seconds <= 5;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Clock className={cn(
        "w-3 h-3",
        turnOwner === 'user' ? "text-lumi-aquamarine" : "text-lumi-sunset-coral",
        isUrgent && "animate-pulse"
      )} />
      
      <div className="flex-1 min-w-16">
        <Progress 
          value={progress} 
          className={cn(
            "h-2",
            isUrgent && "animate-pulse"
          )}
        />
      </div>
      
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs border-white/20 text-white min-w-8 justify-center",
          turnOwner === 'user' ? "bg-lumi-aquamarine/20" : "bg-lumi-sunset-coral/20",
          isUrgent && "bg-red-500/20 border-red-400/30 text-red-200"
        )}
      >
        {seconds}s
      </Badge>
    </div>
  );
};

export default TurnCountdownTimer;

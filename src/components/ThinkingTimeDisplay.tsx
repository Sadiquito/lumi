
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Clock, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ThinkingTimeDisplayProps {
  isThinking: boolean;
  duration: number;
  estimatedTimeMs?: number;
  className?: string;
}

const thinkingMessages = [
  "Reflecting on your words...",
  "Considering different perspectives...", 
  "Crafting a thoughtful response...",
  "Processing the emotional context...",
  "Connecting with your experience...",
  "Finding the right words...",
  "Understanding the deeper meaning...",
  "Preparing a meaningful response..."
];

const ThinkingTimeDisplay: React.FC<ThinkingTimeDisplayProps> = ({
  isThinking,
  duration,
  estimatedTimeMs = 8000,
  className
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isThinking) {
      setCurrentMessage(0);
      setProgress(0);
      return;
    }

    // Rotate thinking messages every 2 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % thinkingMessages.length);
    }, 2000);

    // Update progress based on duration and estimated time
    const progressInterval = setInterval(() => {
      const newProgress = Math.min((duration / estimatedTimeMs) * 100, 95);
      setProgress(newProgress);
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isThinking, duration, estimatedTimeMs]);

  if (!isThinking) return null;

  const seconds = Math.floor(duration / 1000);
  const estimatedSeconds = Math.floor(estimatedTimeMs / 1000);

  return (
    <Card className={cn(
      "w-full bg-lumi-deep-space/40 border-lumi-sunset-coral/20 animate-fade-in",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <Brain className="w-8 h-8 text-lumi-sunset-coral animate-pulse" />
            <div className="absolute -top-1 -right-1">
              <Lightbulb className="w-4 h-4 text-yellow-400 animate-bounce" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">
              Lumi is thinking deeply
            </h3>
            <p className="text-sm text-white/70 animate-fade-in">
              {thinkingMessages[currentMessage]}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-sm text-white/60">
            <Clock className="w-4 h-4" />
            <span>{seconds}s / ~{estimatedSeconds}s</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-2 bg-lumi-deep-space/60"
          />
          <div className="flex justify-between text-xs text-white/50">
            <span>Processing your message</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>

        {/* Educational tip */}
        <div className="mt-4 p-3 bg-lumi-aquamarine/10 border border-lumi-aquamarine/20 rounded-lg">
          <p className="text-xs text-lumi-aquamarine">
            💡 Lumi takes time to provide thoughtful, personalized responses. 
            This intentional pause helps create more meaningful conversations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThinkingTimeDisplay;

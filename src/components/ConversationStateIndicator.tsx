
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Loader2, Volume2, Coffee } from 'lucide-react';
import { ConversationState } from '@/types/conversation';
import { cn } from '@/lib/utils';

interface ConversationStateIndicatorProps {
  state: ConversationState;
  duration?: number;
  className?: string;
}

const stateConfig = {
  idle: {
    icon: Coffee,
    label: 'Ready',
    color: 'bg-gray-500',
    description: 'Waiting for interaction',
  },
  listening: {
    icon: Mic,
    label: 'Listening',
    color: 'bg-green-500',
    description: 'Recording your voice',
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    color: 'bg-blue-500',
    description: 'Understanding your message',
  },
  speaking: {
    icon: Volume2,
    label: 'Speaking',
    color: 'bg-purple-500',
    description: 'Lumi is responding',
  },
};

const ConversationStateIndicator: React.FC<ConversationStateIndicatorProps> = ({
  state,
  duration,
  className,
}) => {
  const config = stateConfig[state];
  const Icon = config.icon;

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            'p-2 rounded-full',
            config.color,
            state === 'processing' && 'animate-pulse',
            state === 'listening' && 'animate-pulse'
          )}>
            <Icon className={cn(
              'w-4 h-4 text-white',
              state === 'processing' && 'animate-spin'
            )} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
              {duration !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {formatDuration(duration)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationStateIndicator;

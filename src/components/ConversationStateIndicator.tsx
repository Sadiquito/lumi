
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Loader2, Volume2, Coffee, Brain, MessageSquare } from 'lucide-react';
import { ConversationState } from '@/types/conversation';
import { cn } from '@/lib/utils';
import WaveformIndicator from './WaveformIndicator';

interface ConversationStateIndicatorProps {
  state: ConversationState;
  duration?: number;
  className?: string;
  showDetails?: boolean;
}

const stateConfig = {
  idle: {
    icon: Coffee,
    label: 'Ready',
    color: 'bg-gray-500',
    description: 'Ready for conversation',
    bgClass: 'bg-gray-500/10',
    borderClass: 'border-gray-500/20'
  },
  listening: {
    icon: Mic,
    label: 'Listening',
    color: 'bg-green-500',
    description: 'Recording your voice',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/20'
  },
  processing: {
    icon: Brain,
    label: 'Processing',
    color: 'bg-blue-500',
    description: 'Understanding your message',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/20'
  },
  speaking: {
    icon: Volume2,
    label: 'Speaking',
    color: 'bg-purple-500',
    description: 'Lumi is responding',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/20'
  },
};

const ConversationStateIndicator: React.FC<ConversationStateIndicatorProps> = ({
  state,
  duration,
  className,
  showDetails = true
}) => {
  const config = stateConfig[state];
  const Icon = config.icon;

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  const renderStateSpecificContent = () => {
    switch (state) {
      case 'listening':
        return (
          <div className="flex items-center space-x-3">
            <WaveformIndicator isActive={true} barCount={4} color="aquamarine" />
            <span className="text-sm text-white/80">Speak now...</span>
          </div>
        );
      
      case 'processing':
        return (
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-lumi-sunset-coral rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <span className="text-sm text-white/80">Processing...</span>
          </div>
        );
      
      case 'speaking':
        return (
          <div className="flex items-center space-x-3">
            <WaveformIndicator isActive={true} barCount={6} color="coral" />
            <span className="text-sm text-white/80">Lumi is speaking...</span>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className={cn(
      'w-full transition-all duration-300',
      config.bgClass,
      config.borderClass,
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
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
                <Badge variant="outline" className="text-xs border-white/20 text-white">
                  {config.label}
                </Badge>
                {duration !== undefined && (
                  <span className="text-xs text-white/60">
                    {formatDuration(duration)}
                  </span>
                )}
              </div>
              {showDetails && (
                <p className="text-sm text-white/70 mt-1">
                  {config.description}
                </p>
              )}
            </div>
          </div>

          {showDetails && renderStateSpecificContent()}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationStateIndicator;

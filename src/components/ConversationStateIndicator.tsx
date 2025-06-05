
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Loader2, Volume2, Coffee, Brain, MessageSquare, Clock, User } from 'lucide-react';
import { ConversationState } from '@/types/conversationState';
import { cn } from '@/lib/utils';
import WaveformIndicator from './WaveformIndicator';
import TurnCountdownTimer from './TurnCountdownTimer';
import TurnOwnershipIndicator from './TurnOwnershipIndicator';

interface ConversationStateIndicatorProps {
  state: ConversationState;
  duration?: number;
  timeoutMs?: number;
  onTimeout?: () => void;
  className?: string;
  showDetails?: boolean;
  enableCountdown?: boolean;
}

const stateConfig = {
  idle: {
    icon: Coffee,
    label: 'Ready',
    color: 'bg-gray-500',
    description: 'Ready for conversation - tap to start',
    bgClass: 'bg-gray-500/10',
    borderClass: 'border-gray-500/20',
    turnOwner: 'none' as const,
    urgentMessage: null
  },
  listening: {
    icon: Mic,
    label: 'Listening',
    color: 'bg-green-500',
    description: 'Lumi is listening to you',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/20',
    turnOwner: 'user' as const,
    urgentMessage: 'Speak now, Lumi is waiting for you!'
  },
  processing: {
    icon: Brain,
    label: 'Processing',
    color: 'bg-blue-500',
    description: 'Lumi is understanding your message',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/20',
    turnOwner: 'ai' as const,
    urgentMessage: 'Lumi is thinking about your message...'
  },
  speaking: {
    icon: Volume2,
    label: 'Speaking',
    color: 'bg-purple-500',
    description: 'Lumi is responding to you',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/20',
    turnOwner: 'ai' as const,
    urgentMessage: 'Lumi is speaking - listen carefully!'
  },
  waiting_for_user: {
    icon: User,
    label: 'Your Turn',
    color: 'bg-lumi-aquamarine',
    description: 'It\'s your turn - Lumi is waiting for you to speak',
    bgClass: 'bg-lumi-aquamarine/10',
    borderClass: 'border-lumi-aquamarine/20',
    turnOwner: 'user' as const,
    urgentMessage: 'Your turn! Tap to start speaking to Lumi'
  },
  waiting_for_ai: {
    icon: Clock,
    label: 'Lumi\'s Turn',
    color: 'bg-lumi-sunset-coral',
    description: 'It\'s Lumi\'s turn - waiting for response',
    bgClass: 'bg-lumi-sunset-coral/10',
    borderClass: 'border-lumi-sunset-coral/20',
    turnOwner: 'ai' as const,
    urgentMessage: 'Lumi\'s turn - preparing response for you'
  },
};

const ConversationStateIndicator: React.FC<ConversationStateIndicatorProps> = ({
  state,
  duration,
  timeoutMs,
  onTimeout,
  className,
  showDetails = true,
  enableCountdown = true
}) => {
  const config = stateConfig[state];
  const Icon = config.icon;
  const hasTimeout = timeoutMs && timeoutMs > 0;

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
            <div className="flex flex-col">
              <span className="text-sm font-medium text-lumi-aquamarine">You're speaking</span>
              <span className="text-xs text-white/60">Lumi is listening...</span>
            </div>
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
            <div className="flex flex-col">
              <span className="text-sm font-medium text-lumi-sunset-coral">Lumi is thinking</span>
              <span className="text-xs text-white/60">Processing your message...</span>
            </div>
          </div>
        );
      
      case 'speaking':
        return (
          <div className="flex items-center space-x-3">
            <WaveformIndicator isActive={true} barCount={6} color="coral" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-lumi-sunset-coral">Lumi is speaking</span>
              <span className="text-xs text-white/60">Listen to the response...</span>
            </div>
          </div>
        );

      case 'waiting_for_user':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-lumi-aquamarine rounded-full animate-pulse" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-lumi-aquamarine">Your turn to speak</span>
              <span className="text-xs text-white/60">Tap the microphone to start</span>
            </div>
          </div>
        );

      case 'waiting_for_ai':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-lumi-sunset-coral rounded-full animate-pulse" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-lumi-sunset-coral">Lumi's turn</span>
              <span className="text-xs text-white/60">Preparing response...</span>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-300">Ready to chat</span>
              <span className="text-xs text-white/60">Start a conversation with Lumi</span>
            </div>
          </div>
        );
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-2 rounded-full',
              config.color,
              (state === 'processing' || state === 'waiting_for_ai') && 'animate-pulse',
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
                <TurnOwnershipIndicator 
                  turnOwner={config.turnOwner} 
                  size="sm"
                  isActive={['waiting_for_user', 'waiting_for_ai'].includes(state)}
                />
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
        </div>

        {/* Turn countdown timer */}
        {enableCountdown && hasTimeout && (
          <div className="mb-3">
            <TurnCountdownTimer
              timeoutMs={timeoutMs}
              onTimeout={onTimeout}
              isActive={['waiting_for_user', 'waiting_for_ai', 'listening'].includes(state)}
              turnOwner={config.turnOwner}
            />
          </div>
        )}

        {/* State-specific content */}
        {showDetails && (
          <div className="mt-2">
            {renderStateSpecificContent()}
          </div>
        )}

        {/* Urgent messaging for turn-based states */}
        {['waiting_for_user', 'waiting_for_ai'].includes(state) && (
          <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/80 text-center">
              {config.urgentMessage}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConversationStateIndicator;

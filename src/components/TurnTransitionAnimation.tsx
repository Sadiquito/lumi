
import React, { useState, useEffect } from 'react';
import { ConversationState } from '@/types/conversationState';
import { ArrowRight, User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TurnTransitionAnimationProps {
  fromState: ConversationState;
  toState: ConversationState;
  isVisible: boolean;
  onComplete: () => void;
  duration?: number;
}

const stateIcons = {
  'idle': Bot,
  'listening': User,
  'processing': Bot,
  'speaking': Bot,
  'waiting_for_user': User,
  'waiting_for_ai': Bot,
};

const stateColors = {
  'idle': 'text-gray-400',
  'listening': 'text-lumi-aquamarine',
  'processing': 'text-lumi-sunset-coral',
  'speaking': 'text-lumi-sunset-coral',
  'waiting_for_user': 'text-lumi-aquamarine',
  'waiting_for_ai': 'text-lumi-sunset-coral',
};

const stateLabels = {
  'idle': 'Ready',
  'listening': 'Your Turn',
  'processing': 'Lumi Thinking',
  'speaking': 'Lumi Speaking',
  'waiting_for_user': 'Your Turn',
  'waiting_for_ai': 'Lumi\'s Turn',
};

const TurnTransitionAnimation: React.FC<TurnTransitionAnimationProps> = ({
  fromState,
  toState,
  isVisible,
  onComplete,
  duration = 800
}) => {
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'transition' | 'exit'>('enter');

  useEffect(() => {
    if (!isVisible) return;

    const timer1 = setTimeout(() => {
      setAnimationPhase('transition');
    }, duration * 0.2);

    const timer2 = setTimeout(() => {
      setAnimationPhase('exit');
    }, duration * 0.7);

    const timer3 = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, duration, onComplete]);

  if (!isVisible) return null;

  const FromIcon = stateIcons[fromState];
  const ToIcon = stateIcons[toState];

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-lumi-deep-space/80 backdrop-blur-sm",
      "animate-fade-in"
    )}>
      <div className={cn(
        "flex items-center space-x-8 p-8 rounded-2xl",
        "bg-lumi-charcoal/90 border border-lumi-sunset-coral/20",
        "shadow-2xl transform transition-all duration-300",
        animationPhase === 'enter' && "scale-95 opacity-0",
        animationPhase === 'transition' && "scale-100 opacity-100",
        animationPhase === 'exit' && "scale-105 opacity-0"
      )}>
        {/* From State */}
        <div className={cn(
          "flex flex-col items-center space-y-3 transition-all duration-500",
          animationPhase === 'transition' && "opacity-60 scale-90"
        )}>
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            "bg-white/10 border-2",
            stateColors[fromState].replace('text-', 'border-')
          )}>
            <FromIcon className={cn("w-8 h-8", stateColors[fromState])} />
          </div>
          <span className={cn("text-sm font-medium", stateColors[fromState])}>
            {stateLabels[fromState]}
          </span>
        </div>

        {/* Transition Arrow */}
        <div className={cn(
          "flex items-center space-x-2 transition-all duration-700",
          animationPhase === 'transition' && "scale-110"
        )}>
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full bg-lumi-sunset-coral",
                  "animate-pulse"
                )}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <ArrowRight className={cn(
            "w-6 h-6 text-lumi-sunset-coral transition-transform duration-500",
            animationPhase === 'transition' && "translate-x-2"
          )} />
        </div>

        {/* To State */}
        <div className={cn(
          "flex flex-col items-center space-y-3 transition-all duration-500",
          animationPhase === 'enter' && "opacity-30 scale-75",
          animationPhase === 'transition' && "opacity-100 scale-100 translate-x-0",
          animationPhase === 'exit' && "scale-110"
        )}>
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            "bg-white/10 border-2 animate-pulse",
            stateColors[toState].replace('text-', 'border-')
          )}>
            <ToIcon className={cn("w-8 h-8", stateColors[toState])} />
          </div>
          <span className={cn("text-sm font-medium", stateColors[toState])}>
            {stateLabels[toState]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TurnTransitionAnimation;

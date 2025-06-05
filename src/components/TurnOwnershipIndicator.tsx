
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { User, Bot, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TurnOwnershipIndicatorProps {
  turnOwner: 'user' | 'ai' | 'none';
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TurnOwnershipIndicator: React.FC<TurnOwnershipIndicatorProps> = ({
  turnOwner,
  isActive = true,
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const getConfig = () => {
    switch (turnOwner) {
      case 'user':
        return {
          icon: User,
          label: 'Your Turn',
          bgClass: 'bg-lumi-aquamarine/20 border-lumi-aquamarine/40',
          textClass: 'text-lumi-aquamarine',
          pulseClass: isActive ? 'animate-pulse' : ''
        };
      case 'ai':
        return {
          icon: Bot,
          label: "Lumi's Turn",
          bgClass: 'bg-lumi-sunset-coral/20 border-lumi-sunset-coral/40',
          textClass: 'text-lumi-sunset-coral',
          pulseClass: isActive ? 'animate-pulse' : ''
        };
      case 'none':
      default:
        return {
          icon: Coffee,
          label: 'Ready',
          bgClass: 'bg-gray-500/20 border-gray-500/40',
          textClass: 'text-gray-400',
          pulseClass: ''
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'flex items-center space-x-1 border',
        config.bgClass,
        config.textClass,
        config.pulseClass,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </Badge>
  );
};

export default TurnOwnershipIndicator;

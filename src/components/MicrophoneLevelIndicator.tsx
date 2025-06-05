
import React from 'react';
import { cn } from '@/lib/utils';
import { Mic } from 'lucide-react';

interface MicrophoneLevelIndicatorProps {
  level: number; // 0-1
  isActive?: boolean;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const MicrophoneLevelIndicator: React.FC<MicrophoneLevelIndicatorProps> = ({
  level,
  isActive = true,
  showIcon = true,
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: { container: 'h-2', icon: 'w-3 h-3' },
    md: { container: 'h-3', icon: 'w-4 h-4' },
    lg: { container: 'h-4', icon: 'w-5 h-5' }
  };

  const currentSize = sizeClasses[size];
  const normalizedLevel = Math.min(Math.max(level, 0), 1);
  
  // Create color based on level
  const getColorClass = () => {
    if (normalizedLevel < 0.3) return 'from-green-400 to-green-500';
    if (normalizedLevel < 0.7) return 'from-yellow-400 to-orange-500';
    return 'from-orange-500 to-red-500';
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {showIcon && (
        <Mic className={cn(
          currentSize.icon,
          isActive ? 'text-lumi-aquamarine' : 'text-white/40'
        )} />
      )}
      
      <div className="flex-1 relative">
        <div className={cn(
          "w-full bg-lumi-charcoal/50 rounded-full",
          currentSize.container
        )}>
          <div 
            className={cn(
              "rounded-full transition-all duration-100 bg-gradient-to-r",
              currentSize.container,
              isActive ? getColorClass() : 'from-gray-400 to-gray-500'
            )}
            style={{ 
              width: `${normalizedLevel * 100}%`,
              opacity: isActive ? 1 : 0.5
            }}
          />
        </div>
        
        {/* Peak indicators */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center h-full px-1">
          {[0.25, 0.5, 0.75].map((threshold, i) => (
            <div
              key={i}
              className={cn(
                "w-px bg-white/20 transition-opacity duration-200",
                currentSize.container,
                normalizedLevel > threshold ? 'opacity-100' : 'opacity-40'
              )}
            />
          ))}
        </div>
      </div>
      
      <span className={cn(
        "text-xs font-mono min-w-[3rem] text-right",
        isActive ? 'text-white/80' : 'text-white/40'
      )}>
        {Math.round(normalizedLevel * 100)}%
      </span>
    </div>
  );
};

export default MicrophoneLevelIndicator;

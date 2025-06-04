
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Clock, AlertTriangle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrialCountdownProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const TrialCountdown: React.FC<TrialCountdownProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { trialStatus } = useAuth();
  const { 
    isTrialExpired, 
    daysRemaining, 
    hasPremiumAccess, 
    subscriptionStatus,
    isInGracePeriod,
    gracePeriodEndsAt,
    isLoading,
    error 
  } = trialStatus;
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Badge variant="outline" className={`bg-gray-500/20 text-gray-400 border-gray-500/30 ${className}`}>
        <Clock className="w-3 h-3 mr-1 animate-spin" />
        loading...
      </Badge>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <Badge variant="destructive" className={`bg-red-500/20 text-red-400 border-red-500/30 ${className}`}>
        <AlertTriangle className="w-3 h-3 mr-1" />
        error
      </Badge>
    );
  }

  // Don't show for active subscribers
  if (subscriptionStatus === 'active' || hasPremiumAccess) {
    return null;
  }

  // Handle grace period display
  if (isInGracePeriod && gracePeriodEndsAt) {
    const graceEndDate = new Date(gracePeriodEndsAt);
    const now = new Date();
    const graceHoursRemaining = Math.max(0, Math.ceil((graceEndDate.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse">
          <Shield className="w-3 h-3 mr-1" />
          {graceHoursRemaining}h grace period
        </Badge>
        {variant === 'full' && (
          <Button
            size="sm"
            onClick={() => navigate('/subscription')}
            className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white text-xs"
          >
            <Crown className="w-3 h-3 mr-1" />
            upgrade now
          </Button>
        )}
      </div>
    );
  }

  if (isTrialExpired) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          trial expired
        </Badge>
        {variant === 'full' && (
          <Button
            size="sm"
            onClick={() => navigate('/subscription')}
            className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white text-xs"
          >
            <Crown className="w-3 h-3 mr-1" />
            upgrade
          </Button>
        )}
      </div>
    );
  }

  if (daysRemaining <= 3) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant="outline" className="bg-lumi-sunset-coral/20 text-lumi-sunset-coral border-lumi-sunset-coral/30">
          <Clock className="w-3 h-3 mr-1" />
          {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
        </Badge>
        {variant === 'full' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/subscription')}
            className="border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10 text-xs"
          >
            <Crown className="w-3 h-3 mr-1" />
            upgrade
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Badge variant="outline" className={`bg-lumi-aquamarine/20 text-lumi-aquamarine border-lumi-aquamarine/30 ${className}`}>
        <Clock className="w-3 h-3 mr-1" />
        {daysRemaining} days trial
      </Badge>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Badge variant="outline" className="bg-lumi-aquamarine/20 text-lumi-aquamarine border-lumi-aquamarine/30">
        <Clock className="w-3 h-3 mr-1" />
        {daysRemaining} days remaining in trial
      </Badge>
    </div>
  );
};

export default TrialCountdown;

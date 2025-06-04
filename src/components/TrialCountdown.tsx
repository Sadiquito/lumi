
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Clock, AlertTriangle } from 'lucide-react';
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
    isLoading 
  } = trialStatus;
  const navigate = useNavigate();

  if (isLoading) {
    return null;
  }

  // Don't show for active subscribers
  if (subscriptionStatus === 'active' || hasPremiumAccess) {
    return null;
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

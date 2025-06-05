
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Crown, Clock, AlertTriangle, Shield, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface EnhancedTrialCountdownProps {
  variant?: 'compact' | 'full' | 'prominent' | 'progress';
  className?: string;
  showProgress?: boolean;
  showUpgradeButton?: boolean;
}

const EnhancedTrialCountdown: React.FC<EnhancedTrialCountdownProps> = ({ 
  variant = 'compact',
  className = '',
  showProgress = false,
  showUpgradeButton = true
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

  // Calculate trial progress (7 days total)
  const totalTrialDays = 7;
  const daysUsed = totalTrialDays - daysRemaining;
  const progressPercentage = (daysUsed / totalTrialDays) * 100;

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
        {showUpgradeButton && variant !== 'compact' && (
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

  // Expired state with prominent styling
  if (isTrialExpired) {
    if (variant === 'prominent') {
      return (
        <div className={`bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm ${className}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-medium">Trial Expired</h3>
                <p className="text-white/70 text-sm">Upgrade to restore full access</p>
              </div>
            </div>
            {showUpgradeButton && (
              <Button
                onClick={() => navigate('/subscription')}
                className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30">
          <AlertTriangle className="w-3 h-3 mr-1" />
          trial expired
        </Badge>
        {showUpgradeButton && variant !== 'compact' && (
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

  // Progress variant with visual trial progression
  if (variant === 'progress') {
    const urgencyLevel = daysRemaining <= 1 ? 'critical' : daysRemaining <= 3 ? 'urgent' : 'normal';
    
    return (
      <div className={`bg-lumi-charcoal/60 backdrop-blur-sm border border-lumi-sunset-coral/20 rounded-lg p-4 ${className}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className={cn(
                "w-4 h-4",
                urgencyLevel === 'critical' ? "text-red-400 animate-pulse" :
                urgencyLevel === 'urgent' ? "text-lumi-sunset-coral" :
                "text-lumi-aquamarine"
              )} />
              <span className="text-white font-medium">Trial Progress</span>
            </div>
            <Badge variant="outline" className={cn(
              "text-xs",
              urgencyLevel === 'critical' ? "border-red-400 text-red-400 bg-red-400/10" :
              urgencyLevel === 'urgent' ? "border-lumi-sunset-coral text-lumi-sunset-coral bg-lumi-sunset-coral/10" :
              "border-lumi-aquamarine text-lumi-aquamarine bg-lumi-aquamarine/10"
            )}>
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60">
              <span>Day {daysUsed}</span>
              <span>Day {totalTrialDays}</span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2"
            />
            <p className="text-xs text-white/70">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              {daysUsed} of {totalTrialDays} trial days used
            </p>
          </div>
          
          {showUpgradeButton && (
            <Button
              onClick={() => navigate('/subscription')}
              className="w-full bg-gradient-to-r from-lumi-sunset-coral to-lumi-aquamarine hover:opacity-90 text-white text-sm"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Prominent variant for critical days
  if (variant === 'prominent' && daysRemaining <= 3) {
    return (
      <div className={`bg-gradient-to-r from-lumi-sunset-coral/20 to-lumi-aquamarine/20 border border-lumi-sunset-coral/30 rounded-lg p-4 backdrop-blur-sm ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Clock className="w-6 h-6 text-lumi-sunset-coral animate-pulse" />
            </div>
            <div>
              <h3 className="text-white font-medium">
                {daysRemaining === 1 ? 'Last Day!' : `${daysRemaining} Days Left`}
              </h3>
              <p className="text-white/70 text-sm">Don't lose access to your AI companion</p>
              {showProgress && (
                <div className="mt-2">
                  <Progress value={progressPercentage} className="h-1 w-32" />
                </div>
              )}
            </div>
          </div>
          {showUpgradeButton && (
            <Button
              onClick={() => navigate('/subscription')}
              className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Secure Access
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Warning state for urgent days
  if (daysRemaining <= 3) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant="outline" className="bg-lumi-sunset-coral/20 text-lumi-sunset-coral border-lumi-sunset-coral/30 animate-pulse">
          <Clock className="w-3 h-3 mr-1" />
          {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
        </Badge>
        {showUpgradeButton && variant !== 'compact' && (
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

  // Normal trial state
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
      {showProgress && (
        <div className="flex items-center space-x-2">
          <Progress value={progressPercentage} className="h-1 w-16" />
          <span className="text-xs text-white/60">{Math.round(progressPercentage)}%</span>
        </div>
      )}
    </div>
  );
};

export default EnhancedTrialCountdown;

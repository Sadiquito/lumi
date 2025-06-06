
import React, { useState } from 'react';
import { useAuth } from '@/components/SimpleAuthProvider';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Crown, Clock, AlertTriangle, X, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TrialStatusBannerProps {
  variant?: 'fixed' | 'inline';
  dismissible?: boolean;
  className?: string;
}

const TrialStatusBanner: React.FC<TrialStatusBannerProps> = ({ 
  variant = 'inline',
  dismissible = true,
  className = ''
}) => {
  const { trialStatus } = useAuth();
  const { isTrialExpired, daysRemaining, hasPremiumAccess, subscriptionStatus } = trialStatus;
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show for premium users or if dismissed
  if (hasPremiumAccess || subscriptionStatus === 'active' || isDismissed) {
    return null;
  }

  // Only show for urgent situations or expired trials
  if (!isTrialExpired && daysRemaining > 3) {
    return null;
  }

  const totalTrialDays = 7;
  const daysUsed = totalTrialDays - daysRemaining;
  const progressPercentage = isTrialExpired ? 100 : (daysUsed / totalTrialDays) * 100;

  const getBannerConfig = () => {
    if (isTrialExpired) {
      return {
        bgClass: "bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-500/20",
        borderClass: "border-red-500/40",
        icon: <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />,
        title: "Trial Expired",
        message: "Your free trial has ended. Upgrade now to restore access to all premium features.",
        buttonText: "Restore Access",
        buttonClass: "bg-lumi-aquamarine hover:bg-lumi-aquamarine/90",
        urgency: "critical"
      };
    } else if (daysRemaining === 1) {
      return {
        bgClass: "bg-gradient-to-r from-orange-500/20 via-lumi-sunset-coral/20 to-orange-500/20",
        borderClass: "border-orange-500/40",
        icon: <Clock className="w-6 h-6 text-orange-400 animate-pulse" />,
        title: "Last Day of Trial!",
        message: "Don't lose access to your AI companion and reflection insights tomorrow.",
        buttonText: "Secure Access",
        buttonClass: "bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90",
        urgency: "critical"
      };
    } else {
      return {
        bgClass: "bg-gradient-to-r from-lumi-sunset-coral/15 via-lumi-aquamarine/15 to-lumi-sunset-coral/15",
        borderClass: "border-lumi-sunset-coral/30",
        icon: <Clock className="w-6 h-6 text-lumi-sunset-coral" />,
        title: `Trial Ending Soon`,
        message: `Only ${daysRemaining} days left to enjoy premium features. Upgrade to continue your journey.`,
        buttonText: "Upgrade Now",
        buttonClass: "bg-lumi-aquamarine hover:bg-lumi-aquamarine/90",
        urgency: "urgent"
      };
    }
  };

  const config = getBannerConfig();

  const bannerContent = (
    <div className={cn(
      "border backdrop-blur-sm rounded-lg p-4 shadow-lg",
      config.bgClass,
      config.borderClass,
      variant === 'fixed' && "fixed top-0 left-0 right-0 z-50 rounded-none border-x-0 border-t-0",
      className
    )}>
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center space-x-4 flex-1">
          <div className="flex-shrink-0">
            {config.icon}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-3">
              <h3 className="text-white font-semibold text-lg">{config.title}</h3>
              {!isTrialExpired && (
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-lumi-aquamarine" />
                  <span className="text-white/80">{Math.round(progressPercentage)}% of trial used</span>
                </div>
              )}
            </div>
            
            <p className="text-white/80 text-sm max-w-2xl">{config.message}</p>
            
            {!isTrialExpired && (
              <div className="space-y-1">
                <Progress value={progressPercentage} className="h-2 w-48" />
                <div className="flex justify-between text-xs text-white/60 w-48">
                  <span>Day 1</span>
                  <span className="font-medium text-white/80">Day {daysUsed}</span>
                  <span>Day {totalTrialDays}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-sm text-white/70">
            <Sparkles className="w-4 h-4 text-lumi-aquamarine" />
            <span>Premium features await</span>
          </div>
          
          <Button
            onClick={() => navigate('/subscription')}
            className={cn(
              "text-white font-medium px-6 py-2",
              config.buttonClass
            )}
          >
            <Crown className="w-4 h-4 mr-2" />
            {config.buttonText}
          </Button>

          {dismissible && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDismissed(true)}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return bannerContent;
};

export default TrialStatusBanner;

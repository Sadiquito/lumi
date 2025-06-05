
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Crown, Lock, Zap, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TrialFeatureLimitationProps {
  feature: 'tts' | 'ai_advice' | 'ai_insights' | 'premium' | 'advanced_history' | 'export';
  variant?: 'badge' | 'alert' | 'inline' | 'card';
  className?: string;
  showUpgrade?: boolean;
  customMessage?: string;
}

const TrialFeatureLimitation: React.FC<TrialFeatureLimitationProps> = ({ 
  feature,
  variant = 'badge',
  className = '',
  showUpgrade = true,
  customMessage
}) => {
  const { trialStatus } = useAuth();
  const { isTrialExpired, daysRemaining, hasPremiumAccess, canUseTTS, canUseAIAdvice } = trialStatus;
  const navigate = useNavigate();

  // Determine if user has access to the feature
  const hasAccess = () => {
    switch (feature) {
      case 'tts':
        return canUseTTS;
      case 'ai_advice':
      case 'ai_insights':
        return canUseAIAdvice;
      case 'premium':
      case 'advanced_history':
      case 'export':
        return hasPremiumAccess;
      default:
        return false;
    }
  };

  // If user has access, don't show limitation
  if (hasAccess()) {
    return null;
  }

  const getFeatureInfo = () => {
    switch (feature) {
      case 'tts':
        return {
          name: 'Voice Responses',
          description: 'AI voice responses are a premium feature',
          icon: <Sparkles className="w-4 h-4" />
        };
      case 'ai_advice':
        return {
          name: 'AI Advice',
          description: 'Daily personalized advice requires premium access',
          icon: <Zap className="w-4 h-4" />
        };
      case 'ai_insights':
        return {
          name: 'AI Insights',
          description: 'Conversation insights available with premium',
          icon: <Zap className="w-4 h-4" />
        };
      case 'advanced_history':
        return {
          name: 'Advanced History',
          description: 'Extended conversation history is premium only',
          icon: <Clock className="w-4 h-4" />
        };
      case 'export':
        return {
          name: 'Export Features',
          description: 'Export conversations and insights with premium',
          icon: <Crown className="w-4 h-4" />
        };
      default:
        return {
          name: 'Premium Feature',
          description: 'This feature requires premium access',
          icon: <Crown className="w-4 h-4" />
        };
    }
  };

  const featureInfo = getFeatureInfo();
  const message = customMessage || featureInfo.description;

  // Get urgency styling based on trial status
  const getUrgencyStyles = () => {
    if (isTrialExpired) {
      return {
        badgeClass: "border-red-400 text-red-400 bg-red-400/10",
        alertClass: "bg-red-500/20 border-red-500/30",
        buttonClass: "bg-lumi-aquamarine hover:bg-lumi-aquamarine/90",
        buttonText: "Upgrade Now",
        urgencyText: "Trial expired"
      };
    } else if (daysRemaining <= 1) {
      return {
        badgeClass: "border-orange-400 text-orange-400 bg-orange-400/10 animate-pulse",
        alertClass: "bg-orange-500/20 border-orange-500/30",
        buttonClass: "bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90",
        buttonText: "Secure Access",
        urgencyText: "Last day!"
      };
    } else if (daysRemaining <= 3) {
      return {
        badgeClass: "border-lumi-sunset-coral text-lumi-sunset-coral bg-lumi-sunset-coral/10",
        alertClass: "bg-lumi-sunset-coral/20 border-lumi-sunset-coral/30",
        buttonClass: "bg-lumi-aquamarine hover:bg-lumi-aquamarine/90",
        buttonText: "Upgrade",
        urgencyText: `${daysRemaining} days left`
      };
    } else {
      return {
        badgeClass: "border-lumi-aquamarine text-lumi-aquamarine bg-lumi-aquamarine/10",
        alertClass: "bg-lumi-charcoal/60 border-lumi-sunset-coral/20",
        buttonClass: "bg-lumi-aquamarine hover:bg-lumi-aquamarine/90",
        buttonText: "Upgrade",
        urgencyText: `${daysRemaining} days left in trial`
      };
    }
  };

  const styles = getUrgencyStyles();

  if (variant === 'badge') {
    return (
      <Badge variant="outline" className={cn(styles.badgeClass, className)}>
        <Lock className="w-3 h-3 mr-1" />
        premium only
      </Badge>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge variant="outline" className={styles.badgeClass}>
          <Lock className="w-3 h-3 mr-1" />
          {featureInfo.name}
        </Badge>
        {!isTrialExpired && (
          <span className="text-xs text-white/60">
            Available in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
          </span>
        )}
        {showUpgrade && (
          <Button
            size="sm"
            onClick={() => navigate('/subscription')}
            className={`${styles.buttonClass} text-white text-xs`}
          >
            <Crown className="w-3 h-3 mr-1" />
            {styles.buttonText}
          </Button>
        )}
      </div>
    );
  }

  if (variant === 'alert') {
    return (
      <Alert className={`backdrop-blur-sm ${styles.alertClass} ${className}`}>
        {isTrialExpired ? (
          <AlertTriangle className="h-4 w-4 text-red-400" />
        ) : (
          <Lock className="h-4 w-4 text-lumi-sunset-coral" />
        )}
        <AlertDescription className="text-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-medium">{message}</span>
              {!isTrialExpired && (
                <div className="text-sm text-white/60">
                  {styles.urgencyText} • Premium features unlock after upgrade
                </div>
              )}
            </div>
            {showUpgrade && (
              <Button
                onClick={() => navigate('/subscription')}
                size="sm"
                className={`ml-4 ${styles.buttonClass} text-white`}
              >
                <Crown className="w-3 h-3 mr-1" />
                {styles.buttonText}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-lumi-charcoal/60 backdrop-blur-sm border border-lumi-sunset-coral/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            <div className="p-2 bg-lumi-sunset-coral/20 rounded-lg">
              {featureInfo.icon}
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-white font-medium">{featureInfo.name}</h3>
            <p className="text-white/70 text-sm">{message}</p>
            
            {!isTrialExpired && (
              <div className="flex items-center space-x-2 text-xs text-white/60">
                <Clock className="w-3 h-3" />
                <span>{styles.urgencyText}</span>
              </div>
            )}
            
            {showUpgrade && (
              <Button
                onClick={() => navigate('/subscription')}
                className={`w-full ${styles.buttonClass} text-white mt-3`}
              >
                <Crown className="w-4 h-4 mr-2" />
                {styles.buttonText}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TrialFeatureLimitation;

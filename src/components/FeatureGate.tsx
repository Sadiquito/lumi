
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGateProps {
  feature: 'tts' | 'ai_advice' | 'premium';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true 
}) => {
  const { trialStatus } = useAuth();
  const { canUseTTS, canUseAIAdvice, hasPremiumAccess, isTrialExpired, daysRemaining } = trialStatus;
  const navigate = useNavigate();

  // Determine if user has access to the feature
  const hasAccess = () => {
    switch (feature) {
      case 'tts':
        return canUseTTS;
      case 'ai_advice':
        return canUseAIAdvice;
      case 'premium':
        return hasPremiumAccess;
      default:
        return false;
    }
  };

  // If user has access, show the children
  if (hasAccess()) {
    return <>{children}</>;
  }

  // If custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgradePrompt) {
    return (
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <Lock className="w-5 h-5 mr-2 text-lumi-sunset-coral" />
            premium feature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTrialExpired ? (
            <div>
              <p className="text-white/80 text-sm mb-3">
                Your 7-day free trial has ended. Upgrade to continue enjoying all of Lumi's features.
              </p>
              <Button
                onClick={() => navigate('/subscription')}
                className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white w-full"
              >
                <Crown className="w-4 h-4 mr-2" />
                upgrade now
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-white/80 text-sm mb-3">
                You have {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left in your free trial. 
                This feature will be available during your trial.
              </p>
              <p className="text-white/60 text-xs">
                Upgrade anytime to continue accessing premium features after your trial ends.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // If no upgrade prompt requested, return null (hide feature completely)
  return null;
};

export default FeatureGate;


import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversationFeatureGateProps {
  feature: 'ai_insights' | 'advanced_history';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ConversationFeatureGate: React.FC<ConversationFeatureGateProps> = ({ 
  feature, 
  children, 
  fallback 
}) => {
  const { trialStatus } = useAuth();
  const { canUseAIAdvice, hasPremiumAccess, isTrialExpired } = trialStatus;
  const navigate = useNavigate();

  // Determine if user has access to the advanced conversation feature
  const hasAccess = () => {
    switch (feature) {
      case 'ai_insights':
        return canUseAIAdvice;
      case 'advanced_history':
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

  // Default upgrade prompt for conversation features
  return (
    <Card className="bg-lumi-charcoal/60 backdrop-blur-sm border-lumi-sunset-coral/10 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Lock className="w-5 h-5 text-lumi-sunset-coral/60" />
          <div className="flex-1">
            <p className="text-white/60 text-sm">
              {feature === 'ai_insights' 
                ? 'AI insights available with premium access' 
                : 'Advanced conversation features require premium access'
              }
            </p>
          </div>
          {isTrialExpired && (
            <Button
              onClick={() => navigate('/subscription')}
              size="sm"
              className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationFeatureGate;

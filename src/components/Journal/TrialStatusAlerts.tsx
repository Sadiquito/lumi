
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import EnhancedTrialCountdown from '@/components/EnhancedTrialCountdown';

const TrialStatusAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { trialStatus } = useAuth();
  const { isTrialExpired, daysRemaining, hasPremiumAccess } = trialStatus;

  // Don't show if user has premium access
  if (hasPremiumAccess) {
    return null;
  }

  // Use enhanced components for better visual hierarchy
  if (isTrialExpired) {
    return (
      <div className="mb-6">
        <EnhancedTrialCountdown 
          variant="prominent"
          showProgress={false}
          showUpgradeButton={true}
        />
      </div>
    );
  }

  // Show enhanced countdown for urgent situations
  if (daysRemaining <= 3) {
    return (
      <div className="mb-6">
        <EnhancedTrialCountdown 
          variant="prominent"
          showProgress={true}
          showUpgradeButton={true}
        />
      </div>
    );
  }

  // For normal trial period, show subtle alert
  return (
    <Alert className="mb-6 bg-lumi-aquamarine/10 border-lumi-aquamarine/20 backdrop-blur-sm">
      <Clock className="h-4 w-4 text-lumi-aquamarine" />
      <AlertDescription className="text-white">
        <div className="flex items-center justify-between">
          <span>
            You're in your free trial with {daysRemaining} days of premium features remaining.
          </span>
          <Button
            onClick={() => navigate('/subscription')}
            variant="outline"
            className="ml-4 border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
            size="sm"
          >
            <Crown className="w-4 h-4 mr-1" />
            Learn More
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default TrialStatusAlerts;

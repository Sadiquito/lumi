
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, Crown, Zap } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useTrialStatus';

const TrialStatusAlerts: React.FC = () => {
  const navigate = useNavigate();
  const { isTrialExpired, daysRemaining } = useTrialStatus();

  if (isTrialExpired) {
    return (
      <Alert className="mb-6 bg-red-500/20 border-red-500/30 backdrop-blur-sm">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-white">
          <div className="flex items-center justify-between">
            <span>Your 7-day free trial has expired. Upgrade now to continue using Lumi's premium features.</span>
            <Button
              onClick={() => navigate('/subscription')}
              className="ml-4 bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
              size="sm"
            >
              <Crown className="w-4 h-4 mr-1" />
              Upgrade Now
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (daysRemaining <= 3 && !isTrialExpired) {
    return (
      <Alert className="mb-6 bg-lumi-sunset-coral/20 border-lumi-sunset-coral/30 backdrop-blur-sm">
        <Clock className="h-4 w-4 text-lumi-sunset-coral" />
        <AlertDescription className="text-white">
          <div className="flex items-center justify-between">
            <span>Your trial expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Don't lose access to your journaling progress!</span>
            <Button
              onClick={() => navigate('/subscription')}
              variant="outline"
              className="ml-4 border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-1" />
              Secure Access
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default TrialStatusAlerts;

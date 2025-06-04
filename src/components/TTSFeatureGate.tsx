
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TTSFeatureGateProps {
  children?: React.ReactNode;
  showAlert?: boolean;
}

const TTSFeatureGate: React.FC<TTSFeatureGateProps> = ({ 
  children, 
  showAlert = true 
}) => {
  const { trialStatus } = useAuth();
  const { canUseTTS, isTrialExpired, daysRemaining } = trialStatus;
  const navigate = useNavigate();

  // If user has TTS access, show the children
  if (canUseTTS) {
    return <>{children}</>;
  }

  // If TTS is blocked and we should show an alert
  if (showAlert) {
    return (
      <Alert className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <VolumeX className="h-4 w-4 text-lumi-sunset-coral" />
        <AlertDescription className="text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Voice responses are a premium feature.</span>
              {!isTrialExpired && (
                <span className="text-white/60 text-sm">
                  Available in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} during your trial.
                </span>
              )}
            </div>
            {isTrialExpired && (
              <Button
                onClick={() => navigate('/subscription')}
                size="sm"
                className="bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade for Voice
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // If no alert should be shown, return null (feature is simply hidden)
  return null;
};

export default TTSFeatureGate;

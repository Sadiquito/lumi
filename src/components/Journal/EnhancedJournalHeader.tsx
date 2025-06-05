
import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import EnhancedTrialCountdown from '@/components/EnhancedTrialCountdown';
import TrialStatusBanner from '@/components/TrialStatusBanner';

const EnhancedJournalHeader: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, trialStatus } = useAuth();
  const { isTrialExpired, daysRemaining } = trialStatus;

  const showBanner = isTrialExpired || daysRemaining <= 3;

  return (
    <div className="sticky top-0 z-40 bg-cosmic-gradient/95 backdrop-blur-sm border-b border-white/10">
      {/* Trial Status Banner - only show for urgent situations */}
      {showBanner && (
        <TrialStatusBanner 
          variant="inline" 
          dismissible={true}
          className="mx-4 mt-4 mb-2"
        />
      )}
      
      {/* Main Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-title font-medium text-white tracking-wide">
            lumi
          </h1>
          <div className="hidden sm:block">
            <EnhancedTrialCountdown 
              variant="compact" 
              showProgress={false}
              showUpgradeButton={false}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Trial status for mobile */}
          <div className="sm:hidden">
            <EnhancedTrialCountdown 
              variant="compact"
              showUpgradeButton={false}
            />
          </div>
          
          {/* Enhanced trial countdown for desktop */}
          <div className="hidden md:block">
            <EnhancedTrialCountdown 
              variant={daysRemaining <= 3 ? "prominent" : "full"}
              showProgress={daysRemaining <= 3}
              showUpgradeButton={true}
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="text-white hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedJournalHeader;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  Crown, 
  Clock, 
  Zap, 
  AlertTriangle,
  TrendingUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAudioUsageTracking } from '@/hooks/useAudioUsageTracking';
import { useAuth } from '@/components/SimpleAuthProvider';

interface AudioTrialUsageIndicatorProps {
  className?: string;
  variant?: 'compact' | 'detailed';
}

const AudioTrialUsageIndicator: React.FC<AudioTrialUsageIndicatorProps> = ({
  className = '',
  variant = 'detailed'
}) => {
  const navigate = useNavigate();
  const { trialStatus } = useAuth();
  const { 
    usage, 
    getRemainingUsage, 
    limits, 
    isLoading,
    getMaxRecordingDuration 
  } = useAudioUsageTracking();
  
  const remaining = getRemainingUsage();
  const maxDuration = getMaxRecordingDuration();

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-lumi-charcoal/40 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-lumi-sunset-coral/20 rounded mb-2"></div>
        <div className="h-3 bg-lumi-sunset-coral/10 rounded"></div>
      </div>
    );
  }

  // Don't show for premium users unless it's compact variant
  if (trialStatus.hasPremiumAccess && variant !== 'compact') {
    return null;
  }

  const dailyUsagePercentage = (usage.dailyTranscriptions / limits.dailyLimit) * 100;
  const isNearLimit = dailyUsagePercentage > 80;
  const isAtLimit = remaining.daily === 0;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            isAtLimit ? "border-red-400 text-red-400 bg-red-400/10" :
            isNearLimit ? "border-yellow-400 text-yellow-400 bg-yellow-400/10" :
            "border-lumi-aquamarine text-lumi-aquamarine bg-lumi-aquamarine/10"
          )}
        >
          <Mic className="w-3 h-3 mr-1" />
          {trialStatus.hasPremiumAccess ? "Unlimited" : `${remaining.daily} left today`}
        </Badge>
        {maxDuration && (
          <Badge variant="outline" className="text-xs border-white/30 text-white/70">
            max: {Math.floor(maxDuration / 60)}m
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-lumi-charcoal/80 to-lumi-deep-space/80 border-lumi-sunset-coral/20 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Mic className="w-4 h-4 mr-2 text-lumi-aquamarine" />
            voice usage
          </div>
          {!trialStatus.hasPremiumAccess && (
            <Badge variant="outline" className="bg-lumi-sunset-coral/20 text-lumi-sunset-coral border-lumi-sunset-coral/30">
              trial limits
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!trialStatus.hasPremiumAccess ? (
          <>
            {/* Daily usage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">daily transcriptions:</span>
                <span className={cn(
                  "font-medium",
                  isAtLimit ? "text-red-400" :
                  isNearLimit ? "text-yellow-400" : "text-lumi-aquamarine"
                )}>
                  {usage.dailyTranscriptions}/{limits.dailyLimit}
                </span>
              </div>
              <Progress 
                value={dailyUsagePercentage} 
                className="h-2"
              />
              {remaining.daily > 0 ? (
                <p className="text-xs text-white/60">
                  {remaining.daily} transcription{remaining.daily !== 1 ? 's' : ''} remaining today
                </p>
              ) : (
                <p className="text-xs text-red-400 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Daily limit reached
                </p>
              )}
            </div>

            {/* Recording duration limit */}
            {maxDuration && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/70">max recording length:</span>
                  <span className="text-lumi-aquamarine font-medium">
                    {Math.floor(maxDuration / 60)} minute{Math.floor(maxDuration / 60) !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Premium users get unlimited recording time
                </p>
              </div>
            )}

            {/* Upgrade prompt */}
            <div className="flex space-x-2 pt-2">
              {isAtLimit ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-red-400/30 text-red-400 hover:bg-red-400/10"
                  disabled
                >
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  limit reached
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-lumi-aquamarine/30 text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
                  disabled
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {remaining.daily} left
                </Button>
              )}
              
              <Button
                onClick={() => navigate('/subscription')}
                size="sm"
                className="flex-1 bg-gradient-to-r from-lumi-sunset-coral to-lumi-aquamarine hover:opacity-90 text-white"
              >
                <Crown className="w-3 h-3 mr-1" />
                upgrade
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center text-lumi-aquamarine">
              <Crown className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Premium Active</span>
            </div>
            <p className="text-xs text-white/60">
              <Zap className="w-3 h-3 inline mr-1" />
              Unlimited voice transcriptions & recording time
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioTrialUsageIndicator;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Volume2, Crown, Zap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTTSUsageTracking } from '@/hooks/useTTSUsageTracking';

interface TTSTrialPreviewProps {
  text: string;
  className?: string;
}

const TTSTrialPreview: React.FC<TTSTrialPreviewProps> = ({ text, className = '' }) => {
  const navigate = useNavigate();
  const { usage, getRemainingUsage, limits, isLoading } = useTTSUsageTracking();
  const remaining = getRemainingUsage();

  if (isLoading) {
    return (
      <div className={`animate-pulse bg-lumi-charcoal/40 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-lumi-sunset-coral/20 rounded mb-2"></div>
        <div className="h-3 bg-lumi-sunset-coral/10 rounded"></div>
      </div>
    );
  }

  return (
    <Card className={`bg-gradient-to-r from-lumi-charcoal/60 to-lumi-deep-space/60 border-lumi-sunset-coral/30 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center justify-between">
          <div className="flex items-center">
            <Volume2 className="w-4 h-4 mr-2 text-lumi-aquamarine" />
            voice preview
          </div>
          <Badge variant="outline" className="bg-lumi-sunset-coral/20 text-lumi-sunset-coral border-lumi-sunset-coral/30">
            trial feature
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-white/80 text-sm">
          <p className="mb-2">Experience Lumi's warm, natural voice responses:</p>
          <div className="bg-lumi-deep-space/40 p-3 rounded-lg border-l-2 border-lumi-aquamarine/50">
            <p className="text-white/90 italic text-xs line-clamp-2">
              "{text.length > 100 ? text.substring(0, 100) + '...' : text}"
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/70">daily usage:</span>
            <span className="text-lumi-aquamarine">
              {usage.dailyUsage}/{limits.dailyLimit}
            </span>
          </div>
          <div className="w-full bg-lumi-charcoal rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-lumi-aquamarine to-lumi-sunset-coral h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (usage.dailyUsage / limits.dailyLimit) * 100)}%` }}
            />
          </div>
          {remaining.daily > 0 ? (
            <p className="text-xs text-white/60">
              {remaining.daily} voice response{remaining.daily !== 1 ? 's' : ''} remaining today
            </p>
          ) : (
            <p className="text-xs text-lumi-sunset-coral">
              Daily limit reached. Upgrade for unlimited access.
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          {remaining.daily > 0 ? (
            <Button
              size="sm"
              className="flex-1 bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
              onClick={() => {
                // This would trigger actual TTS if implemented
                console.log('Trial TTS usage would be tracked here');
              }}
            >
              <Volume2 className="w-3 h-3 mr-1" />
              try voice ({remaining.daily} left)
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-lumi-sunset-coral/30 text-lumi-sunset-coral hover:bg-lumi-sunset-coral/10"
              disabled
            >
              <Clock className="w-3 h-3 mr-1" />
              limit reached
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

        <div className="text-xs text-white/50 text-center">
          <Zap className="w-3 h-3 inline mr-1" />
          Premium: Unlimited voice responses with 4 voice options
        </div>
      </CardContent>
    </Card>
  );
};

export default TTSTrialPreview;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Heart, Share2, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import TTSFeatureGate from '@/components/TTSFeatureGate';
import { useToast } from '@/hooks/use-toast';

interface AdviceCardProps {
  advice: {
    id: string;
    advice_text: string;
    created_at: string;
    personalization_level?: 'minimal' | 'moderate' | 'full';
  };
  variant?: 'featured' | 'compact';
  showActions?: boolean;
}

const AdviceCard: React.FC<AdviceCardProps> = ({ 
  advice, 
  variant = 'compact',
  showActions = true 
}) => {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Daily Wisdom from Lumi',
        text: advice.advice_text,
      });
    } catch {
      // Fallback to clipboard
      await navigator.clipboard.writeText(advice.advice_text);
      toast({
        title: "Copied to clipboard",
        description: "Your daily wisdom has been copied to share.",
      });
    }
  };

  const handleFavorite = () => {
    toast({
      title: "Added to favorites",
      description: "This wisdom has been saved to your favorites.",
    });
  };

  const getPersonalizationBadge = () => {
    const level = advice.personalization_level || 'moderate';
    const colors = {
      minimal: 'bg-gray-500/20 text-gray-300',
      moderate: 'bg-lumi-aquamarine/20 text-lumi-aquamarine',
      full: 'bg-lumi-sunset-coral/20 text-lumi-sunset-coral'
    };
    
    const labels = {
      minimal: 'general',
      moderate: 'personalized', 
      full: 'deeply personal'
    };

    return (
      <Badge className={`${colors[level]} border-0 text-xs`}>
        <TrendingUp className="w-3 h-3 mr-1" />
        {labels[level]}
      </Badge>
    );
  };

  if (variant === 'featured') {
    return (
      <Card className="bg-gradient-to-br from-lumi-charcoal/90 to-lumi-deep-space/90 backdrop-blur-sm border-lumi-sunset-coral/30 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-lumi-aquamarine" />
              today's wisdom
            </CardTitle>
            {getPersonalizationBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-lumi-deep-space/30 rounded-xl p-6 border border-lumi-aquamarine/10">
            <p className="text-white/90 text-lg leading-relaxed font-medium">
              {advice.advice_text}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TTSFeatureGate 
                text={advice.advice_text}
                variant="compact"
                showAlert={false}
              />
              
              {showActions && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavorite}
                    className="text-white/60 hover:text-lumi-sunset-coral hover:bg-lumi-sunset-coral/10"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-white/60 hover:text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            
            <p className="text-white/50 text-sm">
              {format(parseISO(advice.created_at), 'EEEE, MMM dd')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between">
        <p className="text-white/80 text-sm leading-relaxed flex-1">
          {advice.advice_text}
        </p>
        <div className="flex items-center space-x-2 ml-3">
          <TTSFeatureGate 
            text={advice.advice_text}
            variant="icon-only"
            showAlert={false}
          />
          
          {showActions && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFavorite}
                className="text-white/40 hover:text-lumi-sunset-coral hover:bg-lumi-sunset-coral/10 h-8 w-8 p-0"
              >
                <Heart className="w-3 h-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-white/40 hover:text-lumi-aquamarine hover:bg-lumi-aquamarine/10 h-8 w-8 p-0"
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {getPersonalizationBadge()}
        <p className="text-white/50 text-xs">
          {format(parseISO(advice.created_at), 'MMM dd')}
        </p>
      </div>
    </div>
  );
};

export default AdviceCard;

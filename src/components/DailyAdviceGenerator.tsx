
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { useDailyAdvice } from '@/hooks/useDailyAdvice';
import { useToast } from '@/hooks/use-toast';

const DailyAdviceGenerator: React.FC = () => {
  const { generateDailyAdvice, isGenerating, privacySettings } = useDailyAdvice();
  const { toast } = useToast();

  const handleGenerateAdvice = () => {
    generateDailyAdvice(undefined, {
      onSuccess: (data) => {
        if (data.alreadyGenerated) {
          toast({
            title: "Already Generated",
            description: "Your daily wisdom has already been created today.",
          });
        } else {
          toast({
            title: "Daily Wisdom Generated",
            description: `Fresh ${data.personalizationLevel || 'personalized'} insights have been created just for you.`,
          });
        }
      },
      onError: (error) => {
        toast({
          title: "Generation Failed",
          description: "Unable to generate daily wisdom. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const getPersonalizationLevel = () => {
    const level = privacySettings?.personalization_level || 'moderate';
    const labels = {
      minimal: { text: 'general insights', color: 'bg-gray-500/20 text-gray-300' },
      moderate: { text: 'personalized wisdom', color: 'bg-lumi-aquamarine/20 text-lumi-aquamarine' },
      full: { text: 'deeply personal guidance', color: 'bg-lumi-sunset-coral/20 text-lumi-sunset-coral' }
    };
    return labels[level];
  };

  const personalizationInfo = getPersonalizationLevel();

  return (
    <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            generate today's wisdom
          </CardTitle>
          <Badge className={`${personalizationInfo.color} border-0 text-xs`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            {personalizationInfo.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-white/70 text-sm mb-4">
          let me create personalized guidance based on our recent conversations and my understanding of you
        </p>
        <Button
          onClick={handleGenerateAdvice}
          disabled={isGenerating}
          className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              creating wisdom...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              generate daily wisdom
            </>
          )}
        </Button>
        
        {privacySettings && (
          <div className="mt-3 text-xs text-white/50">
            generating {personalizationInfo.text} based on your privacy preferences
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DailyAdviceGenerator;

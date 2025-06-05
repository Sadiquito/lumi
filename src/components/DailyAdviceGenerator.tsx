
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useDailyAdvice } from '@/hooks/useDailyAdvice';
import { useToast } from '@/hooks/use-toast';

const DailyAdviceGenerator: React.FC = () => {
  const { generateDailyAdvice, isGenerating } = useDailyAdvice();
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
            description: "Fresh insights have been created just for you.",
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

  return (
    <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-lumi-aquamarine" />
          generate today's wisdom
        </CardTitle>
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
      </CardContent>
    </Card>
  );
};

export default DailyAdviceGenerator;

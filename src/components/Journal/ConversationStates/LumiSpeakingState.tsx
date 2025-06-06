
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, Sparkles } from 'lucide-react';
import SimpleTTS from '@/components/SimpleTTS';

interface LumiSpeakingStateProps {
  currentMessage: string;
  onFinishedSpeaking: () => void;
}

const LumiSpeakingState: React.FC<LumiSpeakingStateProps> = ({
  currentMessage,
  onFinishedSpeaking
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-sunset-gold/80 to-lumi-sunset-gold/60 flex items-center justify-center shadow-2xl animate-pulse">
            <Volume2 className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
          Lumi is speaking
        </h3>
        <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
          Listen to Lumi's question
        </p>
      </div>
      
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-gold/20">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-lumi-sunset-gold/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-lumi-sunset-gold" />
            </div>
            <div className="flex-1">
              <p className="text-white text-lg leading-relaxed" style={{ fontFamily: 'Crimson Pro' }}>
                {currentMessage}
              </p>
              <div className="mt-4">
                <SimpleTTS
                  text={currentMessage}
                  autoPlay={true}
                  variant="compact"
                  className="bg-lumi-sunset-gold/20 border-lumi-sunset-gold/40 text-lumi-sunset-gold hover:bg-lumi-sunset-gold/30"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          onClick={onFinishedSpeaking}
          variant="outline"
          className="border-lumi-sunset-gold/40 text-lumi-sunset-gold hover:bg-lumi-sunset-gold/10"
        >
          I'm ready to respond
        </Button>
      </div>
    </div>
  );
};

export default LumiSpeakingState;

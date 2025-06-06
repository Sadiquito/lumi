
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, Sparkles, Loader2 } from 'lucide-react';
import { useAudioSynthesis } from '@/hooks/useAudioSynthesis';

interface LumiSpeakingStateProps {
  currentMessage: string;
  onFinishedSpeaking: () => void;
}

const LumiSpeakingState: React.FC<LumiSpeakingStateProps> = ({
  currentMessage,
  onFinishedSpeaking
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { isSynthesizing, synthesisResult, handleSynthesis } = useAudioSynthesis({
    onSynthesisComplete: (result) => {
      // Auto-play the synthesized audio
      if (audioRef.current && result.audioUrl) {
        audioRef.current.src = result.audioUrl;
        audioRef.current.play().catch(console.error);
      }
    }
  });

  // Synthesize audio when message is available
  useEffect(() => {
    if (currentMessage && currentMessage.trim()) {
      handleSynthesis(currentMessage);
    }
  }, [currentMessage, handleSynthesis]);

  const handleAudioEnd = () => {
    console.log('Lumi finished speaking');
    onFinishedSpeaking();
  };

  const handleSkip = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onFinishedSpeaking();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-sunset-gold/80 to-lumi-sunset-gold/60 flex items-center justify-center shadow-2xl animate-pulse">
            {isSynthesizing ? (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Volume2 className="w-8 h-8 text-white" />
            )}
          </div>
        </div>
        <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
          {isSynthesizing ? 'Preparing voice...' : 'Lumi is speaking'}
        </h3>
        <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
          {isSynthesizing ? 'Generating audio...' : 'Listen to Lumi\'s question'}
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-x-4">
        <Button
          onClick={handleSkip}
          variant="outline"
          className="border-lumi-sunset-gold/40 text-lumi-sunset-gold hover:bg-lumi-sunset-gold/10"
        >
          {isSynthesizing ? 'Skip' : 'I\'m ready to respond'}
        </Button>
      </div>

      {/* Audio Element */}
      {synthesisResult?.audioUrl && (
        <audio
          ref={audioRef}
          onEnded={handleAudioEnd}
          onError={(e) => console.error('Audio playback error:', e)}
          preload="metadata"
        />
      )}
    </div>
  );
};

export default LumiSpeakingState;

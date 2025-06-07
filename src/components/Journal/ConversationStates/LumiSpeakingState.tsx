import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Volume2, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { useAudioSynthesis } from '@/hooks/useAudioSynthesis';

interface LumiSpeakingStateProps {
  currentMessage: string;
  onFinishedSpeaking: () => void;
}

function LumiSpeakingState({
  currentMessage,
  onFinishedSpeaking
}: LumiSpeakingStateProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { isSynthesizing, synthesisResult, error, hasVoiceSupport, handleSynthesis } = useAudioSynthesis({
    enableFallback: true
  });

  // Synthesize audio when message is available
  useEffect(() => {
    if (currentMessage && currentMessage.trim()) {
      handleSynthesis(currentMessage);
    }
  }, [currentMessage, handleSynthesis]);

  // Play audio when synthesisResult?.audioUrl is ready
  useEffect(() => {
    if (
      synthesisResult?.audioUrl &&
      hasVoiceSupport &&
      !error &&
      audioRef.current
    ) {
      audioRef.current.src = synthesisResult.audioUrl;
      audioRef.current.play().catch(console.error);
    }
  }, [synthesisResult?.audioUrl, hasVoiceSupport, error]);

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

  // Auto-finish if voice synthesis fails
  useEffect(() => {
    if (error || !hasVoiceSupport) {
      const timer = setTimeout(() => {
        onFinishedSpeaking();
      }, 3000); // 3 second delay for reading

      return () => clearTimeout(timer);
    }
  }, [error, hasVoiceSupport, onFinishedSpeaking]);

  const getStatusText = () => {
    if (error || !hasVoiceSupport) {
      return 'Lumi\'s response (text mode)';
    }
    if (isSynthesizing) {
      return 'Preparing voice...';
    }
    return 'Lumi is speaking';
  };

  const getStatusSubtext = () => {
    if (error || !hasVoiceSupport) {
      return 'Voice is temporarily unavailable';
    }
    if (isSynthesizing) {
      return 'Generating audio...';
    }
    return 'Listen to Lumi\'s question';
  };

  const getStatusIcon = () => {
    if (error || !hasVoiceSupport) {
      return <MessageSquare className="w-8 h-8 text-white" />;
    }
    if (isSynthesizing) {
      return <Loader2 className="w-8 h-8 text-white animate-spin" />;
    }
    return <Volume2 className="w-8 h-8 text-white" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-lumi-sunset-gold/80 to-lumi-sunset-gold/60 flex items-center justify-center shadow-2xl animate-pulse">
            {getStatusIcon()}
          </div>
        </div>
        <h3 className="text-white text-lg font-medium mb-2" style={{ fontFamily: 'Cinzel' }}>
          {getStatusText()}
        </h3>
        <p className="text-white/70" style={{ fontFamily: 'Crimson Pro' }}>
          {getStatusSubtext()}
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
              {(error || !hasVoiceSupport) && (
                <p className="text-lumi-sunset-gold/70 text-sm mt-2 italic">
                  Voice temporarily unavailable - text response shown above
                </p>
              )}
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

      {/* Audio Element - always rendered */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onError={(e) => {
          console.error('Audio playback error:', e);
          onFinishedSpeaking();
        }}
        preload="metadata"
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default LumiSpeakingState;

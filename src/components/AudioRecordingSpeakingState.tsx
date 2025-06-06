
import React, { useEffect, useRef } from 'react';
import { Volume2, MessageSquare } from 'lucide-react';
import { useAudioSynthesis } from '@/hooks/useAudioSynthesis';

interface AudioRecordingSpeakingStateProps {
  aiResponse: string;
  onFinishedSpeaking?: () => void;
}

const AudioRecordingSpeakingState: React.FC<AudioRecordingSpeakingStateProps> = ({
  aiResponse,
  onFinishedSpeaking
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { isSynthesizing, synthesisResult, error, hasVoiceSupport, handleSynthesis } = useAudioSynthesis({
    onSynthesisComplete: (result) => {
      // Auto-play the synthesized audio
      if (audioRef.current && result.audioUrl) {
        audioRef.current.src = result.audioUrl;
        audioRef.current.play().catch(console.error);
      }
    },
    enableFallback: true
  });

  // Synthesize audio when AI response is available
  useEffect(() => {
    if (aiResponse && aiResponse.trim()) {
      handleSynthesis(aiResponse);
    }
  }, [aiResponse, handleSynthesis]);

  const handleAudioEnd = () => {
    console.log('Audio playback finished');
    onFinishedSpeaking?.();
  };

  // If voice synthesis fails or is unavailable, auto-finish after a delay
  useEffect(() => {
    if (error || !hasVoiceSupport) {
      const timer = setTimeout(() => {
        onFinishedSpeaking?.();
      }, 2000); // 2 second delay to let user read the response

      return () => clearTimeout(timer);
    }
  }, [error, hasVoiceSupport, onFinishedSpeaking]);

  const renderWaveformAnimation = () => (
    <div className="flex items-center justify-center space-x-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-lumi-aquamarine rounded-full animate-pulse"
          style={{
            height: `${20 + Math.random() * 20}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );

  const getStatusText = () => {
    if (error || !hasVoiceSupport) {
      return 'Text response ready';
    }
    if (isSynthesizing) {
      return 'Generating voice...';
    }
    return 'Lumi is responding...';
  };

  const getStatusIcon = () => {
    if (error || !hasVoiceSupport) {
      return <MessageSquare className="w-6 h-6 text-lumi-aquamarine" />;
    }
    return <Volume2 className="w-6 h-6 text-lumi-aquamarine" />;
  };

  return (
    <div className="text-center space-y-4 p-6 bg-lumi-deep-space/20 rounded-lg border border-lumi-aquamarine/20">
      <div className="flex items-center justify-center space-x-3">
        {getStatusIcon()}
        <span className="text-white text-lg font-medium">
          {getStatusText()}
        </span>
      </div>
      
      {/* Show animation only when voice is working */}
      {hasVoiceSupport && !error && renderWaveformAnimation()}
      
      {/* AI Response Text */}
      {aiResponse && (
        <div className="mt-4 p-4 bg-lumi-charcoal/40 rounded-lg">
          <p className="text-white text-sm leading-relaxed">
            {aiResponse}
          </p>
          {(error || !hasVoiceSupport) && (
            <p className="text-lumi-aquamarine/70 text-xs mt-2 italic">
              Voice is currently unavailable - text response shown above
            </p>
          )}
        </div>
      )}

      {/* Audio Element */}
      {synthesisResult?.audioUrl && hasVoiceSupport && !error && (
        <audio
          ref={audioRef}
          onEnded={handleAudioEnd}
          onError={(e) => {
            console.error('Audio playback error:', e);
            onFinishedSpeaking?.();
          }}
          preload="metadata"
        />
      )}
    </div>
  );
};

export default AudioRecordingSpeakingState;

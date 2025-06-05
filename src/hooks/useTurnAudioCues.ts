
import { useCallback, useRef } from 'react';
import { ConversationState } from '@/types/conversationState';
import { useTextToSpeech } from './useTextToSpeech';

interface UseTurnAudioCuesProps {
  enableAudioCues: boolean;
}

export const useTurnAudioCues = ({ enableAudioCues }: UseTurnAudioCuesProps = { enableAudioCues: false }) => {
  const lastStateRef = useRef<ConversationState | null>(null);
  
  const { generateSpeech: generateTurnCue } = useTextToSpeech({
    text: '',
    autoPlay: true,
  });

  const playTurnTransitionCue = useCallback((newState: ConversationState, previousState: ConversationState | null) => {
    if (!enableAudioCues || !previousState || lastStateRef.current === newState) return;
    
    lastStateRef.current = newState;
    
    const cueMessages: Record<ConversationState, string | null> = {
      'idle': null,
      'listening': null, // Audio recording provides its own feedback
      'processing': null, // Processing sounds are handled elsewhere
      'speaking': null, // Lumi's voice provides feedback
      'waiting_for_user': 'Your turn',
      'waiting_for_ai': null, // Silent transition
    };

    const cueMessage = cueMessages[newState];
    if (cueMessage) {
      // Use a subtle audio cue
      generateTurnCue();
    }
  }, [enableAudioCues, generateTurnCue]);

  return {
    playTurnTransitionCue,
  };
};

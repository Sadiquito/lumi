import { useCallback } from 'react';

export const useVoiceCommands = () => {
  // Voice commands that trigger session end
  const SESSION_END_COMMANDS = [
    'that\'s all for today',
    'i\'m done for now',
    'end session',
    'goodbye lumi',
    'that\'s it for today',
    'i think we\'re done',
    'let\'s wrap up',
    'that\'s enough for now'
  ];

  const shouldEndSession = useCallback((text: string) => {
    const lowerText = text.toLowerCase().trim();
    return SESSION_END_COMMANDS.some(command => lowerText.includes(command));
  }, [SESSION_END_COMMANDS]);

  return {
    shouldEndSession
  };
};

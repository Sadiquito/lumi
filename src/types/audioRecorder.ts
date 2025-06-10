
export interface AudioRecorderProps {
  onAudioData?: (encodedAudio: string, isSpeech: boolean) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  autoStart?: boolean;
}

export type ConversationState = 'idle' | 'listening' | 'user_speaking' | 'processing' | 'lumi_speaking' | 'ending_session';

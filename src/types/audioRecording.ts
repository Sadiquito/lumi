
export interface ConversationData {
  id: string;
  transcript: string;
  ai_response: string;
}

export interface AudioQualityMetadata {
  duration: number;
  confidence: number;
  audioUrl: string;
  audioQuality: 'good' | 'low' | 'poor';
}

export interface UseAudioRecordingFeatureProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  disabled?: boolean;
  maxDuration?: number;
  onFallbackToText?: () => void;
}

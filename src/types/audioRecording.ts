export interface ConversationData {
  id: string;
  transcript: string;
  ai_response: string;
  audioBlob?: Blob;
  duration?: number;
  quality?: AudioQuality;
  timestamp?: Date;
  retryCount?: number;
}

export interface AudioQualityMetadata {
  duration: number;
  confidence: number;
  audioUrl: string;
  audioQuality: 'good' | 'low' | 'poor';
}

export interface AudioQuality {
  level: 'poor' | 'fair' | 'good' | 'excellent';
  signalToNoise: number;
  bitrate?: number;
}

export interface NetworkStatus {
  online: boolean;
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  downlink?: number;
  rtt?: number;
}

export interface ConversationDataState {
  id?: string;
  transcript?: string;
  ai_response?: string;
  audioBlob?: Blob;
  duration?: number;
  quality?: AudioQuality;
  timestamp?: Date;
  retryCount?: number;
}

export interface UseAudioRecordingFeatureProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  disabled?: boolean;
  maxDuration?: number;
  onFallbackToText?: () => void;
}

export interface UseAudioConversationFlowProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  onFallbackToText?: () => void;
}

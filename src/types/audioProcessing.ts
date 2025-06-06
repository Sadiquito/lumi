
/**
 * Type definitions for audio processing pipeline
 */

export interface AudioProcessingConfig {
  transcription?: {
    model?: string;
    language?: string;
    temperature?: number;
  };
  synthesis?: {
    voiceId?: string;
    model?: string;
    stability?: number;
    similarityBoost?: number;
  };
}

export interface AudioProcessingResult {
  transcription?: {
    text: string;
    confidence?: number;
    duration?: number;
  };
  synthesis?: {
    audioUrl: string;
    audioBlob: Blob;
    duration?: number;
  };
  metadata?: {
    processingTime: number;
    inputSize: number;
    outputSize?: number;
  };
}

export interface AudioPipelineStep {
  step: 'transcription' | 'ai_processing' | 'synthesis';
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface ConversationTurn {
  userAudio: Blob;
  transcription: string;
  aiResponse: string;
  synthesizedAudio?: Blob;
  timestamp: Date;
  processingSteps: AudioPipelineStep[];
}

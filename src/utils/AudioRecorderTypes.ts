export interface AudioRecorderConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  maxDuration?: number; // in seconds
}

export interface AudioChunk {
  data: Blob;
  timestamp: number;
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  currentTime: number;
  audioLevel: number;
  hasPermission: boolean;
  error: string | null;
}

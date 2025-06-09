
export interface AudioRecorderConfig {
  sampleRate: number;
  channelCount: number;
  chunkDuration: number; // in milliseconds
  vadThreshold: number;
  silenceDuration: number; // ms of silence before considering speech ended
}

export const DEFAULT_CONFIG: AudioRecorderConfig = {
  sampleRate: 24000,
  channelCount: 1,
  chunkDuration: 500, // Increased for better processing
  vadThreshold: 0.02, // Slightly higher threshold
  silenceDuration: 1500,
};

export interface AudioChunk {
  data: Float32Array;
  timestamp: number;
  isSpeech: boolean;
}


// Audio processing utilities for Lumi

/**
 * Convert Float32Array audio data to base64-encoded PCM16
 * for transmission to backend services
 */
export const encodeAudioForTransmission = (float32Array: Float32Array): string => {
  // Convert Float32 to Int16 (PCM16)
  const int16Array = new Int16Array(float32Array.length);
  
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to [-1, 1] and convert to 16-bit integer
    const clampedValue = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = clampedValue < 0 ? clampedValue * 0x8000 : clampedValue * 0x7FFF;
  }

  // Convert to base64
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000; // Process in chunks to avoid stack overflow
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

/**
 * Calculate audio RMS (Root Mean Square) for volume analysis
 */
export const calculateRMS = (audioData: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i];
  }
  return Math.sqrt(sum / audioData.length);
};

/**
 * Apply basic audio normalization
 */
export const normalizeAudio = (audioData: Float32Array): Float32Array => {
  const maxValue = Math.max(...Array.from(audioData).map(Math.abs));
  if (maxValue === 0) return audioData;
  
  const normalized = new Float32Array(audioData.length);
  const scale = 0.95 / maxValue; // Leave some headroom
  
  for (let i = 0; i < audioData.length; i++) {
    normalized[i] = audioData[i] * scale;
  }
  
  return normalized;
};

/**
 * Detect if audio chunk contains speech based on energy and spectral characteristics
 */
export const detectSpeechInChunk = (
  audioData: Float32Array, 
  threshold: number = 0.01
): boolean => {
  const rms = calculateRMS(audioData);
  
  // Basic energy-based detection
  if (rms < threshold) return false;
  
  // Additional checks could include:
  // - Zero crossing rate for voice characteristics
  // - Spectral centroid analysis
  // - Formant detection
  
  return true;
};

/**
 * Create WAV header for audio data
 */
export const createWavHeader = (
  dataLength: number,
  sampleRate: number = 24000,
  channels: number = 1,
  bitsPerSample: number = 16
): Uint8Array => {
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLength, true); // File size
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // Format chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Chunk size
  view.setUint16(20, 1, true); // Audio format (PCM)
  view.setUint16(22, channels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, byteRate, true); // Byte rate
  view.setUint16(32, blockAlign, true); // Block align
  view.setUint16(34, bitsPerSample, true); // Bits per sample

  // Data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true); // Data size

  return new Uint8Array(header);
};

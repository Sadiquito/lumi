
export interface AudioProcessingConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
}

export class AudioProcessor {
  static floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }
    return output;
  }

  static createWavHeader(
    sampleRate: number,
    channels: number,
    bitDepth: number,
    dataLength: number
  ): ArrayBuffer {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF chunk descriptor
    view.setUint32(0, 0x46464952, false); // "RIFF"
    view.setUint32(4, 36 + dataLength, true); // File size - 8
    view.setUint32(8, 0x45564157, false); // "WAVE"

    // fmt sub-chunk
    view.setUint32(12, 0x20746d66, false); // "fmt "
    view.setUint32(16, 16, true); // Sub-chunk size
    view.setUint16(20, 1, true); // Audio format (PCM)
    view.setUint16(22, channels, true); // Number of channels
    view.setUint32(24, sampleRate, true); // Sample rate
    view.setUint32(28, sampleRate * channels * (bitDepth / 8), true); // Byte rate
    view.setUint16(32, channels * (bitDepth / 8), true); // Block align
    view.setUint16(34, bitDepth, true); // Bits per sample

    // data sub-chunk
    view.setUint32(36, 0x61746164, false); // "data"
    view.setUint32(40, dataLength, true); // Data size

    return header;
  }

  static convertToWav(
    audioData: Float32Array,
    config: AudioProcessingConfig
  ): Blob {
    const pcmData = this.floatTo16BitPCM(audioData);
    const header = this.createWavHeader(
      config.sampleRate,
      config.channels,
      config.bitDepth,
      pcmData.length * 2
    );

    return new Blob([header, pcmData.buffer], { type: 'audio/wav' });
  }

  static calculateRMS(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  static detectSilence(
    audioData: Float32Array,
    threshold: number = 0.01
  ): boolean {
    const rms = this.calculateRMS(audioData);
    return rms < threshold;
  }

  static normalizeAudio(audioData: Float32Array): Float32Array {
    let max = 0;
    for (let i = 0; i < audioData.length; i++) {
      max = Math.max(max, Math.abs(audioData[i]));
    }

    if (max === 0) return audioData;

    const normalized = new Float32Array(audioData.length);
    const scale = 0.95 / max; // Leave some headroom

    for (let i = 0; i < audioData.length; i++) {
      normalized[i] = audioData[i] * scale;
    }

    return normalized;
  }

  static resample(
    audioData: Float32Array,
    originalSampleRate: number,
    targetSampleRate: number
  ): Float32Array {
    if (originalSampleRate === targetSampleRate) {
      return audioData;
    }

    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.round(audioData.length / ratio);
    const resampled = new Float32Array(newLength);

    for (let i = 0; i < newLength; i++) {
      const originalIndex = i * ratio;
      const index = Math.floor(originalIndex);
      const fraction = originalIndex - index;

      if (index + 1 < audioData.length) {
        // Linear interpolation
        resampled[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction;
      } else {
        resampled[i] = audioData[index] || 0;
      }
    }

    return resampled;
  }

  static trimSilence(
    audioData: Float32Array,
    threshold: number = 0.01
  ): Float32Array {
    let start = 0;
    let end = audioData.length - 1;

    // Find start of audio
    while (start < audioData.length && Math.abs(audioData[start]) < threshold) {
      start++;
    }

    // Find end of audio
    while (end > start && Math.abs(audioData[end]) < threshold) {
      end--;
    }

    return audioData.slice(start, end + 1);
  }
}

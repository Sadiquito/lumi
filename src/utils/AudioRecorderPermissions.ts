
import { AudioRecorderConfig } from './AudioRecorderTypes';

export class AudioRecorderPermissions {
  static async checkBrowserSupport(): Promise<boolean> {
    try {
      return !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        window.AudioContext
      );
    } catch {
      return false;
    }
  }

  static async requestPermission(config: AudioRecorderConfig): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config.sampleRate,
          channelCount: config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      return stream;
    } catch (error) {
      console.error('Permission request failed:', error);
      return null;
    }
  }

  static async testPermission(config: AudioRecorderConfig): Promise<boolean> {
    try {
      const stream = await this.requestPermission(config);
      if (stream) {
        // Test access and immediately stop
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}


import { AudioRecorderConfig, AudioChunk, AudioRecorderState } from './AudioRecorderTypes';
import { AudioRecorderPermissions } from './AudioRecorderPermissions';
import { AudioRecorderStateManager } from './AudioRecorderState';
import { AudioRecorderCore } from './AudioRecorderCore';

export type { AudioRecorderConfig, AudioChunk, AudioRecorderState } from './AudioRecorderTypes';

export class AudioRecorder {
  private stateManager: AudioRecorderStateManager;
  private core: AudioRecorderCore;

  constructor(
    config: AudioRecorderConfig,
    onStateChange: (state: AudioRecorderState) => void,
    onAudioData: (chunk: AudioChunk) => void
  ) {
    this.stateManager = new AudioRecorderStateManager(onStateChange);
    this.core = new AudioRecorderCore(config, this.stateManager, onAudioData);
  }

  static async checkBrowserSupport(): Promise<boolean> {
    return AudioRecorderPermissions.checkBrowserSupport();
  }

  async requestPermission(): Promise<boolean> {
    try {
      const hasPermission = await AudioRecorderPermissions.testPermission({
        sampleRate: 24000,
        channels: 1,
        bitDepth: 16,
      });
      
      this.stateManager.updateState({ 
        hasPermission, 
        error: hasPermission ? null : 'Permission denied' 
      });
      
      return hasPermission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission denied';
      this.stateManager.updateState({ hasPermission: false, error: errorMessage });
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    return this.core.startRecording();
  }

  stopRecording(): Float32Array | null {
    return this.core.stopRecording();
  }

  pauseRecording(): void {
    this.core.pauseRecording();
  }

  resumeRecording(): void {
    this.core.resumeRecording();
  }

  destroy(): void {
    this.core.destroy();
  }
}

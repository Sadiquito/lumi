
import { AudioRecorderState } from './AudioRecorderTypes';

export class AudioRecorderStateManager {
  private currentState: AudioRecorderState = {
    isRecording: false,
    isPaused: false,
    currentTime: 0,
    audioLevel: 0,
    hasPermission: false,
    error: null,
  };

  private onStateChange: (state: AudioRecorderState) => void;

  constructor(onStateChange: (state: AudioRecorderState) => void) {
    this.onStateChange = onStateChange;
  }

  getState(): AudioRecorderState {
    return { ...this.currentState };
  }

  updateState(updates: Partial<AudioRecorderState>): void {
    this.currentState = { ...this.currentState, ...updates };
    this.onStateChange(this.currentState);
  }

  reset(): void {
    this.currentState = {
      isRecording: false,
      isPaused: false,
      currentTime: 0,
      audioLevel: 0,
      hasPermission: this.currentState.hasPermission,
      error: null,
    };
    this.onStateChange(this.currentState);
  }
}

import { AudioRecorderConfig, AudioChunk } from './AudioRecorderTypes';
import { AudioRecorderPermissions } from './AudioRecorderPermissions';
import { AudioRecorderStateManager } from './AudioRecorderState';

export class AudioRecorderCore {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private config: AudioRecorderConfig;
  private stateManager: AudioRecorderStateManager;
  private onAudioData: (chunk: AudioChunk) => void;

  constructor(
    config: AudioRecorderConfig,
    stateManager: AudioRecorderStateManager,
    onAudioData: (chunk: AudioChunk) => void
  ) {
    this.config = config;
    this.stateManager = stateManager;
    this.onAudioData = onAudioData;
  }

  async startRecording(): Promise<boolean> {
    try {
      if (!await AudioRecorderPermissions.checkBrowserSupport()) {
        throw new Error('Browser does not support audio recording');
      }

      // Get media stream
      this.mediaStream = await AudioRecorderPermissions.requestPermission(this.config);
      if (!this.mediaStream) {
        throw new Error('Failed to get media stream');
      }

      // Create MediaRecorder
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(this.mediaStream);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const chunk: AudioChunk = {
          data: audioBlob,
          timestamp: Date.now(),
        };
        this.onAudioData(chunk);
        this.cleanupStream();
      };

      this.mediaRecorder.onerror = (event) => {
        this.stateManager.updateState({ error: 'Audio recording error' });
      };

      this.mediaRecorder.start();
      this.startTime = Date.now();

      this.stateManager.updateState({
        isRecording: true,
        isPaused: false,
        error: null,
        hasPermission: true
      });

      // Handle max duration
      if (this.config.maxDuration) {
        setTimeout(() => {
          if (this.stateManager.getState().isRecording) {
            this.stopRecording();
          }
        }, this.config.maxDuration * 1000);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      this.stateManager.updateState({ error: errorMessage, isRecording: false });
      return false;
    }
  }

  stopRecording(): Blob | null {
    try {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      } else {
        this.cleanupStream();
      }
      this.stateManager.updateState({
        isRecording: false,
        isPaused: false,
        currentTime: 0,
        audioLevel: 0
      });
      // The blob will be passed to onAudioData in onstop
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop recording';
      this.stateManager.updateState({ error: errorMessage });
      this.cleanupStream();
      return null;
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.stateManager.updateState({ isPaused: true });
    }
  }

  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.stateManager.updateState({ isPaused: false });
    }
  }

  private cleanupStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  destroy(): void {
    this.cleanupStream();
  }
}


export interface AudioRecorderConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  maxDuration?: number; // in seconds
}

export interface AudioChunk {
  data: Float32Array;
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

export class AudioRecorder {
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private audioChunks: AudioChunk[] = [];
  private startTime: number = 0;
  private config: AudioRecorderConfig;
  private onStateChange: (state: AudioRecorderState) => void;
  private onAudioData: (chunk: AudioChunk) => void;
  private animationFrame: number | null = null;

  constructor(
    config: AudioRecorderConfig,
    onStateChange: (state: AudioRecorderState) => void,
    onAudioData: (chunk: AudioChunk) => void
  ) {
    this.config = config;
    this.onStateChange = onStateChange;
    this.onAudioData = onAudioData;
  }

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

  async requestPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      // Test access and immediately stop
      stream.getTracks().forEach(track => track.stop());
      
      this.updateState({ hasPermission: true, error: null });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Permission denied';
      this.updateState({ hasPermission: false, error: errorMessage });
      return false;
    }
  }

  async startRecording(): Promise<boolean> {
    try {
      if (!await AudioRecorder.checkBrowserSupport()) {
        throw new Error('Browser does not support audio recording');
      }

      // Get media stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext({
        sampleRate: this.config.sampleRate,
      });

      // Create audio processing pipeline
      this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      // Create script processor for audio data
      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.scriptProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const audioData = inputBuffer.getChannelData(0);
        
        // Create a copy of the audio data
        const chunk: AudioChunk = {
          data: new Float32Array(audioData),
          timestamp: Date.now(),
        };
        
        this.audioChunks.push(chunk);
        this.onAudioData(chunk);
      };

      // Connect the audio pipeline
      this.audioSource.connect(this.analyser);
      this.audioSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      this.startTime = Date.now();
      this.audioChunks = [];
      
      this.updateState({ 
        isRecording: true, 
        isPaused: false, 
        error: null,
        hasPermission: true 
      });
      
      this.startAudioLevelMonitoring();
      
      // Handle max duration
      if (this.config.maxDuration) {
        setTimeout(() => {
          if (this.getState().isRecording) {
            this.stopRecording();
          }
        }, this.config.maxDuration * 1000);
      }

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      this.updateState({ error: errorMessage, isRecording: false });
      return false;
    }
  }

  stopRecording(): Float32Array | null {
    try {
      this.cleanup();
      
      if (this.audioChunks.length === 0) {
        this.updateState({ error: 'No audio data recorded' });
        return null;
      }

      // Combine all audio chunks
      const totalLength = this.audioChunks.reduce((sum, chunk) => sum + chunk.data.length, 0);
      const combinedAudio = new Float32Array(totalLength);
      let offset = 0;

      for (const chunk of this.audioChunks) {
        combinedAudio.set(chunk.data, offset);
        offset += chunk.data.length;
      }

      this.updateState({ 
        isRecording: false, 
        isPaused: false, 
        currentTime: 0, 
        audioLevel: 0 
      });

      return combinedAudio;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop recording';
      this.updateState({ error: errorMessage });
      return null;
    }
  }

  pauseRecording(): void {
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
    }
    this.updateState({ isPaused: true });
  }

  resumeRecording(): void {
    if (this.scriptProcessor && this.audioContext) {
      this.scriptProcessor.connect(this.audioContext.destination);
    }
    this.updateState({ isPaused: false });
  }

  private startAudioLevelMonitoring(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!this.analyser || !this.getState().isRecording) return;

      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const audioLevel = rms / 255; // Normalize to 0-1

      const currentTime = this.getState().isRecording 
        ? (Date.now() - this.startTime) / 1000 
        : 0;

      this.updateState({ audioLevel, currentTime });
      
      this.animationFrame = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
  }

  private cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.analyser = null;
  }

  private getState(): AudioRecorderState {
    return {
      isRecording: false,
      isPaused: false,
      currentTime: 0,
      audioLevel: 0,
      hasPermission: false,
      error: null,
    };
  }

  private updateState(updates: Partial<AudioRecorderState>): void {
    const currentState = this.getState();
    const newState = { ...currentState, ...updates };
    this.onStateChange(newState);
  }

  destroy(): void {
    this.cleanup();
  }
}

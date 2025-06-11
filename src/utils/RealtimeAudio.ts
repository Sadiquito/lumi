
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      console.log('🎤 Starting audio recorder...');
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      console.log('✅ Audio recorder started successfully');
    } catch (error) {
      console.error('❌ Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    console.log('🛑 Stopping audio recorder...');
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('✅ Audio recorder stopped');
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  // Convert Float32 to Int16 (PCM16) with proper scaling
  const int16Array = new Int16Array(float32Array.length);
  
  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to [-1, 1] and convert to 16-bit integer
    const clampedValue = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = clampedValue < 0 ? clampedValue * 0x8000 : clampedValue * 0x7FFF;
  }

  // Convert to base64 with proper byte order (little endian)
  const uint8Array = new Uint8Array(int16Array.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    console.log('🎵 Adding audio to queue, size:', audioData.length);
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      console.log('🎵 Audio queue empty, stopping playback');
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;
    console.log('🎵 Playing audio chunk, size:', audioData.length);

    try {
      // Convert PCM16 to AudioBuffer
      const int16Array = new Int16Array(audioData.buffer);
      const float32Array = new Float32Array(int16Array.length);
      
      // Convert Int16 to Float32 with proper scaling
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const audioBuffer = this.audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => {
        console.log('🎵 Audio chunk finished');
        this.playNext();
      };
      
      source.start(0);
      console.log('✅ Audio chunk started playing');
      
    } catch (error) {
      console.error('❌ Error playing audio chunk:', error);
      // Continue with next chunk even if current fails
      this.playNext();
    }
  }
}

export class RealtimeChat {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private audioQueue: AudioQueue | null = null;
  private recorder: AudioRecorder | null = null;
  private onMessageCallback: ((message: any) => void) | null = null;
  private onSpeakingChangeCallback: ((speaking: boolean) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private reconnectTimeout: number | null = null;

  constructor() {}

  async init(
    onMessage: (message: any) => void,
    onSpeakingChange: (speaking: boolean) => void
  ) {
    console.log('🚀 Initializing RealtimeChat...');
    
    this.onMessageCallback = onMessage;
    this.onSpeakingChangeCallback = onSpeakingChange;

    try {
      // Initialize audio context
      this.audioContext = new AudioContext({ sampleRate: 24000 });
      this.audioQueue = new AudioQueue(this.audioContext);
      console.log('✅ Audio context initialized');

      // Connect to WebSocket
      await this.connectWebSocket();

      // Start recording
      this.recorder = new AudioRecorder((audioData) => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          this.ws.send(JSON.stringify({
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          }));
        }
      });

      await this.recorder.start();
      console.log('✅ RealtimeChat initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing RealtimeChat:', error);
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use the exact URL structure for Supabase Edge Functions
      const wsUrl = `wss://uzaeyfougoeohqlysbkn.supabase.co/functions/v1/openai-realtime`;
      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      const connectionTimeout = setTimeout(() => {
        console.error('❌ WebSocket connection timeout');
        this.ws?.close();
        reject(new Error('WebSocket connection timeout'));
      }, 30000); // Increased timeout

      this.ws.onopen = () => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket connected successfully');
        this.reconnectAttempts = 0;
        resolve();
      };

      this.ws.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('📥 WebSocket message received:', message.type);

          if (message.type === 'response.audio.delta') {
            // Play audio delta
            const binaryString = atob(message.delta);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await this.audioQueue!.addToQueue(bytes);
            this.onSpeakingChangeCallback?.(true);
            
          } else if (message.type === 'response.audio.done') {
            console.log('🎵 Audio response complete');
            this.onSpeakingChangeCallback?.(false);
            
          } else if (message.type === 'input_audio_buffer.speech_started') {
            console.log('🎤 User started speaking');
            
          } else if (message.type === 'input_audio_buffer.speech_stopped') {
            console.log('🔇 User stopped speaking');
            
          } else if (message.type === 'session.created') {
            console.log('✅ Session created');
            
          } else if (message.type === 'session.updated') {
            console.log('✅ Session updated');
            
          } else if (message.type === 'error') {
            console.error('❌ OpenAI API error:', message);
          }

          this.onMessageCallback?.(message);
        } catch (error) {
          console.error('❌ Error processing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ WebSocket error:', error);
        this.handleConnectionError();
      };

      this.ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        
        if (event.code !== 1000) { // Not a normal closure
          this.handleConnectionError();
        }
      };
    });
  }

  private handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`🔄 Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      this.reconnectTimeout = window.setTimeout(async () => {
        try {
          await this.connectWebSocket();
        } catch (error) {
          console.error('❌ Reconnection failed:', error);
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.onMessageCallback?.({ 
        type: 'error', 
        error: 'Connection failed after multiple attempts' 
      });
    }
  }

  async sendTextMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    console.log('📤 Sending text message:', text);

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    this.ws.send(JSON.stringify(event));
    this.ws.send(JSON.stringify({ type: 'response.create' }));
  }

  disconnect() {
    console.log('🛑 Disconnecting RealtimeChat...');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.recorder?.stop();
    this.ws?.close(1000, 'User disconnected');
    this.audioContext?.close();
    
    console.log('✅ RealtimeChat disconnected');
  }
}

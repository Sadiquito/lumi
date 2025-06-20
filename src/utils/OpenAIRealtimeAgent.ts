// WebRTC-based OpenAI Realtime Agent using the official approach
export class OpenAIRealtimeAgent {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private onMessageCallback: ((message: any) => void) | null = null;
  private onSpeakingChangeCallback: ((speaking: boolean) => void) | null = null;
  private isConnected = false;
  private mediaStream: MediaStream | null = null;

  constructor() {}

  async init(
    onMessage: (message: any) => void,
    onSpeakingChange: (speaking: boolean) => void,
    apiKey: string,
    model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini',
    voice: 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse' = 'alloy'
  ) {
    console.log(`🚀 Initializing OpenAI Realtime Agent with WebRTC using ${model} and ${voice} voice...`);
    
    this.onMessageCallback = onMessage;
    this.onSpeakingChangeCallback = onSpeakingChange;

    try {
      // Get ephemeral token from OpenAI
      const ephemeralToken = await this.getEphemeralToken(apiKey, model, voice);
      
      // Set up WebRTC connection
      await this.setupWebRTC(ephemeralToken, model, voice);
      
      this.isConnected = true;
      console.log(`✅ OpenAI Realtime Agent connected successfully via WebRTC using ${model} with ${voice} voice`);

      // Send initial configuration
      this.sendEvent({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions: "You are Lumi, a helpful AI assistant for personal reflection and journaling. Speak naturally and conversationally.",
          voice: voice,
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1'
          }
        }
      });

    } catch (error) {
      console.error('❌ Error initializing OpenAI Realtime Agent:', error);
      throw error;
    }
  }

  private async getEphemeralToken(apiKey: string, model: string, voice: string): Promise<string> {
    const modelMap = {
      'gpt-4o': 'gpt-4o-realtime-preview-2024-12-17',
      'gpt-4o-mini': 'gpt-4o-mini-realtime-preview-2024-12-17'
    };

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelMap[model as keyof typeof modelMap] || modelMap['gpt-4o-mini'],
        voice: voice
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get ephemeral token: ${await response.text()}`);
    }

    const data = await response.json();
    return data.client_secret.value;
  }

  private async setupWebRTC(ephemeralToken: string, model: string, voice: string) {
    const modelMap = {
      'gpt-4o': 'gpt-4o-realtime-preview-2024-12-17',
      'gpt-4o-mini': 'gpt-4o-mini-realtime-preview-2024-12-17'
    };

    // Create peer connection
    this.pc = new RTCPeerConnection();

    // Set up audio element for playback
    this.audioElement = document.createElement('audio');
    this.audioElement.autoplay = true;

    // Handle remote audio stream
    this.pc.ontrack = (event) => {
      console.log('📻 Received remote audio track');
      if (this.audioElement) {
        this.audioElement.srcObject = event.streams[0];
        this.onSpeakingChangeCallback?.(true);
      }
    };

    // Set up data channel for events
    this.dc = this.pc.createDataChannel('oai-events');
    this.dc.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 Received event:', data.type);
        this.handleRealtimeEvent(data);
      } catch (error) {
        console.error('❌ Error parsing data channel message:', error);
      }
    });

    // Get user media for microphone
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });

      // Add local audio track
      const audioTrack = this.mediaStream.getAudioTracks()[0];
      this.pc.addTrack(audioTrack, this.mediaStream);
    } catch (error) {
      console.warn('⚠️ Could not access microphone:', error);
    }

    // Create offer and connect to OpenAI
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    const realtimeModel = modelMap[model as keyof typeof modelMap] || modelMap['gpt-4o-mini'];
    const response = await fetch(`https://api.openai.com/v1/realtime?model=${realtimeModel}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        'Authorization': `Bearer ${ephemeralToken}`,
        'Content-Type': 'application/sdp'
      },
    });

    if (!response.ok) {
      throw new Error(`WebRTC connection failed: ${await response.text()}`);
    }

    const answerSdp = await response.text();
    await this.pc.setRemoteDescription({
      type: 'answer',
      sdp: answerSdp,
    } as RTCSessionDescriptionInit);
  }

  private handleRealtimeEvent(event: any) {
    switch (event.type) {
      case 'response.audio.delta':
        this.onSpeakingChangeCallback?.(true);
        break;
      
      case 'response.audio.done':
        this.onSpeakingChangeCallback?.(false);
        break;
      
      case 'conversation.item.created':
      case 'response.text.delta':
      case 'response.text.done':
      case 'input_audio_buffer.speech_started':
      case 'input_audio_buffer.speech_stopped':
        this.onMessageCallback?.(event);
        break;
      
      case 'error':
        console.error('❌ Realtime API error:', event);
        this.onMessageCallback?.({ type: 'error', error: event.error?.message || 'Unknown error' });
        break;
      
      default:
        this.onMessageCallback?.(event);
    }
  }

  private sendEvent(event: any) {
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(JSON.stringify(event));
    } else {
      console.warn('⚠️ Data channel not ready, queuing event:', event.type);
    }
  }

  async sendMessage(text: string) {
    if (!this.isConnected) {
      throw new Error('Agent not connected');
    }

    console.log('📤 Sending message:', text);
    
    this.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text
          }
        ]
      }
    });

    this.sendEvent({ type: 'response.create' });
  }

  disconnect() {
    console.log('🛑 Disconnecting OpenAI Realtime Agent...');
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
    
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    
    if (this.audioElement) {
      this.audioElement.remove();
      this.audioElement = null;
    }
    
    this.isConnected = false;
    console.log('✅ OpenAI Realtime Agent disconnected');
  }

  isAgentConnected(): boolean {
    return this.isConnected;
  }
}

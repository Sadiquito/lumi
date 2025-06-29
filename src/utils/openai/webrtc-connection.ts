import { OpenAIModel, OpenAIVoice, RealtimeEvent, RealtimeMessage } from '@/types/openai-realtime';
import { getRealtimeModel } from './ephemeral-token';

export class WebRTCConnection {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaStream: MediaStream | null = null;

  constructor(
    private onMessage: (message: RealtimeEvent) => void,
    private onSpeakingChange: (speaking: boolean) => void
  ) {}

  async setup(ephemeralToken: string, model: OpenAIModel, voice: OpenAIVoice): Promise<void> {
    // Create peer connection
    this.pc = new RTCPeerConnection();

    // Set up audio element for playback
    this.audioElement = document.createElement('audio');
    this.audioElement.autoplay = true;

    // Handle remote audio stream
    this.pc.ontrack = (event) => {
      if (import.meta.env.DEV) {
        console.log('📻 Received remote audio track');
      }
      if (this.audioElement) {
        this.audioElement.srcObject = event.streams[0];
        this.onSpeakingChange(true);
      }
    };

    // Set up data channel for events
    this.dc = this.pc.createDataChannel('oai-events');
    this.dc.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (import.meta.env.DEV) {
          console.log('📨 Received event:', data.type);
        }
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

    const realtimeModel = getRealtimeModel(model);
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

  private handleRealtimeEvent(event: RealtimeEvent): void {
    switch (event.type) {
      case 'response.audio.delta':
        this.onSpeakingChange(true);
        break;
      
      case 'response.audio.done':
        this.onSpeakingChange(false);
        break;
      
      case 'conversation.item.created':
      case 'response.text.delta':
      case 'response.text.done':
      case 'input_audio_buffer.speech_started':
      case 'input_audio_buffer.speech_stopped':
        this.onMessage(event);
        break;
      
      case 'error':
        console.error('❌ Realtime API error:', event);
        this.onMessage({ 
          type: 'error', 
          error: { 
            message: (event as ErrorEvent).error?.message || 'Unknown error' 
          } 
        });
        break;
      
      default:
        this.onMessage(event);
    }
  }

  sendEvent(event: RealtimeMessage): void {
    if (this.dc && this.dc.readyState === 'open') {
      this.dc.send(JSON.stringify(event));
    } else {
      console.warn('⚠️ Data channel not ready, queuing event:', event.type);
    }
  }

  disconnect(): void {
    if (import.meta.env.DEV) {
      console.log('🛑 Disconnecting WebRTC connection...');
    }
    
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
  }

  isReady(): boolean {
    return this.dc?.readyState === 'open';
  }
}

import { OpenAIVoice, SessionConfig } from '@/types/openai-realtime';
import { WebRTCConnection } from './webrtc-connection';

export class SessionManager {
  constructor(private connection: WebRTCConnection) {}

  initializeSession(voice: OpenAIVoice): void {
    console.log(`🔧 Initializing session with ${voice} voice`);
    
    const sessionConfig: SessionConfig = {
      modalities: ['text', 'audio'],
      instructions: `You are Lumi, a compassionate and wise companion for personal reflection and journaling. Speak naturally and conversationally. Your primary goal is to help the user reflect on their thoughts and feelings, and to guide them in journaling about their experiences. You should be able to handle complex emotions and provide helpful advice.`,
      voice: voice,
      input_audio_format: 'pcm16',
      output_audio_format: 'pcm16',
      input_audio_transcription: {
        model: 'whisper-1'
      },
      turn_detection: {
        type: 'server_vad',
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 1000
      },
      temperature: 0.8,
      max_response_output_tokens: 'inf'
    };

    console.log('📡 Sending session configuration');
    this.connection.sendEvent({
      type: 'session.update',
      session: sessionConfig
    });
  }
}

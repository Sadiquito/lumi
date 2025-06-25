
import { OpenAIVoice, SessionConfig, RealtimeEvent } from '@/types/openai-realtime';
import { WebRTCConnection } from './webrtc-connection';

export class SessionManager {
  constructor(private connection: WebRTCConnection) {}

  initializeSession(voice: OpenAIVoice): void {
    console.log(`🔧 Initializing session with ${voice} voice...`);
    
    const sessionConfig: SessionConfig = {
      modalities: ['text', 'audio'],
      instructions: "You are Lumi, a helpful AI assistant for personal reflection and journaling. Speak naturally and conversationally. Keep responses thoughtful but concise.",
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

    console.log('📡 Sending session configuration:', sessionConfig);
    this.connection.sendEvent({
      type: 'session.update',
      session: sessionConfig
    });
  }

  sendTextMessage(text: string): void {
    console.log('📤 Sending message:', text);
    
    this.connection.sendEvent({
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

    this.connection.sendEvent({ type: 'response.create' });
  }
}

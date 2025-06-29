import { OpenAIModel, OpenAIVoice } from '@/types/openai-realtime';
import { getEphemeralToken } from './openai/ephemeral-token';
import { WebRTCConnection } from './openai/webrtc-connection';
import { SessionManager } from './openai/session-manager';

export class OpenAIRealtimeAgent {
  private connection: WebRTCConnection | null = null;
  private sessionManager: SessionManager | null = null;
  private isConnected = false;

  constructor() {}

  async init(
    onMessage: (message: any) => void,
    onSpeakingChange: (speaking: boolean) => void,
    apiKey: string,
    model: OpenAIModel = 'gpt-4o-mini',
    voice: OpenAIVoice = 'alloy'
  ): Promise<void> {
    console.log(`🚀 Initializing OpenAI Realtime Agent with WebRTC using ${model} and ${voice} voice...`);

    try {
      // Get ephemeral token from OpenAI
      const ephemeralToken = await getEphemeralToken(apiKey, model, voice);
      
      // Set up WebRTC connection
      this.connection = new WebRTCConnection(onMessage, onSpeakingChange);
      await this.connection.setup(ephemeralToken, model, voice);
      
      // Initialize session manager
      this.sessionManager = new SessionManager(this.connection);
      this.sessionManager.initializeSession(voice);
      
      this.isConnected = true;
      console.log(`✅ OpenAI Realtime Agent connected successfully via WebRTC using ${model} with ${voice} voice`);

    } catch (error) {
      console.error('❌ Error initializing OpenAI Realtime Agent:', error);
      throw error;
    }
  }

  disconnect(): void {
    console.log('🛑 Disconnecting OpenAI Realtime Agent...');
    
    if (this.connection) {
      this.connection.disconnect();
      this.connection = null;
    }
    
    this.sessionManager = null;
    this.isConnected = false;
    
    console.log('✅ OpenAI Realtime Agent disconnected');
  }
}

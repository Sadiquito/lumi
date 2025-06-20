
import { RealtimeAPI } from '@openai/realtime-api-beta';

export class OpenAIRealtimeAgent {
  private client: RealtimeAPI | null = null;
  private onMessageCallback: ((message: any) => void) | null = null;
  private onSpeakingChangeCallback: ((speaking: boolean) => void) | null = null;
  private isConnected = false;

  constructor() {}

  async init(
    onMessage: (message: any) => void,
    onSpeakingChange: (speaking: boolean) => void,
    apiKey: string
  ) {
    console.log('🚀 Initializing OpenAI Realtime Agent...');
    
    this.onMessageCallback = onMessage;
    this.onSpeakingChangeCallback = onSpeakingChange;

    try {
      // Initialize the RealtimeAPI client
      this.client = new RealtimeAPI({
        apiKey: apiKey,
        dangerouslyAllowAPIKeyInBrowser: true
      });

      // Set up event listeners
      this.client.on('conversation.updated', (event) => {
        console.log('📄 Conversation updated:', event);
        this.onMessageCallback?.(event);
      });

      this.client.on('conversation.item.appended', (event) => {
        console.log('➕ Item appended:', event);
        if (event.item.type === 'message') {
          this.onMessageCallback?.(event);
        }
      });

      this.client.on('conversation.item.completed', (event) => {
        console.log('✅ Item completed:', event);
        this.onMessageCallback?.(event);
      });

      this.client.on('realtime.event', (event) => {
        console.log('📡 Realtime event:', event.type);
        
        if (event.type === 'response.audio.delta') {
          // Audio is being generated
          this.onSpeakingChangeCallback?.(true);
        } else if (event.type === 'response.audio.done') {
          // Audio generation complete
          this.onSpeakingChangeCallback?.(false);
        }
        
        this.onMessageCallback?.(event);
      });

      this.client.on('error', (error) => {
        console.error('❌ OpenAI Realtime error:', error);
        this.onMessageCallback?.({ type: 'error', error: error.message });
      });

      // Connect to OpenAI
      await this.client.connect();
      this.isConnected = true;
      
      console.log('✅ OpenAI Realtime Agent connected successfully');

      // Send initial greeting
      setTimeout(() => {
        this.sendMessage("Hello! I'm Lumi. What's on your mind today?");
      }, 1000);

    } catch (error) {
      console.error('❌ Error initializing OpenAI Realtime Agent:', error);
      throw error;
    }
  }

  async sendMessage(text: string) {
    if (!this.client || !this.isConnected) {
      throw new Error('Agent not connected');
    }

    console.log('📤 Sending message:', text);
    
    try {
      await this.client.sendUserMessageContent([
        {
          type: 'input_text',
          text: text
        }
      ]);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }

  disconnect() {
    console.log('🛑 Disconnecting OpenAI Realtime Agent...');
    
    if (this.client) {
      this.client.disconnect();
      this.client = null;
    }
    
    this.isConnected = false;
    console.log('✅ OpenAI Realtime Agent disconnected');
  }

  isAgentConnected(): boolean {
    return this.isConnected;
  }
}

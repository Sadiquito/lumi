
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  console.log('🚀 OpenAI Realtime WebSocket connection initiated');

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('❌ OPENAI_API_KEY not configured');
    socket.close(1011, 'OpenAI API key not configured');
    return response;
  }

  // Connect to OpenAI Realtime API
  const openAISocket = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
    ["realtime", `openai-insecure-api-key.${openAIApiKey}`]
  );

  console.log('🔌 Connecting to OpenAI Realtime API...');

  let sessionConfigured = false;

  openAISocket.onopen = () => {
    console.log('✅ Connected to OpenAI Realtime API');
  };

  openAISocket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('📥 OpenAI message:', message.type);

    // Configure session after connection
    if (message.type === 'session.created' && !sessionConfigured) {
      console.log('🔧 Configuring session...');
      
      const sessionConfig = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: `You are Lumi, an emotionally intelligent AI companion designed for introspective conversations. Your core traits:

- Emotionally neutral yet warmly present
- Calm, thoughtful, and reflective in all responses
- You help users explore their thoughts and feelings without giving direct advice
- You ask gentle, open-ended questions that promote self-discovery
- You reflect back what you hear to help users process their emotions
- You maintain appropriate boundaries as an AI companion

Keep responses conversational, typically 1-2 sentences. Focus on being a supportive presence that encourages self-reflection.`,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1500
          },
          temperature: 0.7,
          max_response_output_tokens: 300
        }
      };

      openAISocket.send(JSON.stringify(sessionConfig));
      sessionConfigured = true;
      console.log('✅ Session configured');
    }

    // Forward all messages to client
    socket.send(event.data);
  };

  openAISocket.onerror = (error) => {
    console.error('❌ OpenAI WebSocket error:', error);
    socket.close(1011, 'OpenAI connection error');
  };

  openAISocket.onclose = (event) => {
    console.log('🔌 OpenAI WebSocket closed:', event.code, event.reason);
    socket.close(event.code, event.reason);
  };

  // Handle messages from client
  socket.onopen = () => {
    console.log('✅ Client WebSocket connected');
  };

  socket.onmessage = (event) => {
    console.log('📤 Forwarding client message to OpenAI');
    // Forward client messages to OpenAI
    if (openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log('🔌 Client WebSocket closed');
    openAISocket.close();
  };

  socket.onerror = (error) => {
    console.error('❌ Client WebSocket error:', error);
    openAISocket.close();
  };

  return response;
});

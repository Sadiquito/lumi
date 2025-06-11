
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 OpenAI Realtime function called:', req.method, req.url);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  // Check for WebSocket upgrade
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    console.log('❌ Not a WebSocket request, upgrade header:', upgradeHeader);
    return new Response("Expected WebSocket connection", { 
      status: 400,
      headers: corsHeaders 
    });
  }

  console.log('🔌 WebSocket upgrade requested');

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.error('❌ OPENAI_API_KEY not configured');
    return new Response('OpenAI API key not configured', { 
      status: 500,
      headers: corsHeaders 
    });
  }

  console.log('✅ OpenAI API key found, length:', openAIApiKey.length);

  try {
    const { socket, response } = Deno.upgradeWebSocket(req);
    console.log('✅ WebSocket upgrade successful');

    // Connect to OpenAI Realtime API
    const openAIUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
    console.log('🔌 Connecting to OpenAI:', openAIUrl);
    
    const openAISocket = new WebSocket(
      openAIUrl,
      ["realtime", `openai-insecure-api-key.${openAIApiKey}`]
    );

    let sessionConfigured = false;
    let isConnected = false;

    openAISocket.onopen = () => {
      console.log('✅ Connected to OpenAI Realtime API');
      isConnected = true;
    };

    openAISocket.onmessage = (event) => {
      try {
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
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        } else {
          console.warn('⚠️ Client socket not open, message dropped');
        }
      } catch (error) {
        console.error('❌ Error processing OpenAI message:', error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error('❌ OpenAI WebSocket error:', error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'error',
          error: 'OpenAI connection error'
        }));
      }
    };

    openAISocket.onclose = (event) => {
      console.log('🔌 OpenAI WebSocket closed:', event.code, event.reason);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(event.code, event.reason);
      }
    };

    // Handle messages from client
    socket.onopen = () => {
      console.log('✅ Client WebSocket connected');
    };

    socket.onmessage = (event) => {
      try {
        console.log('📤 Forwarding client message to OpenAI');
        // Forward client messages to OpenAI
        if (openAISocket.readyState === WebSocket.OPEN) {
          openAISocket.send(event.data);
        } else {
          console.warn('⚠️ OpenAI socket not open, current state:', openAISocket.readyState);
          socket.send(JSON.stringify({
            type: 'error',
            error: 'OpenAI connection not ready'
          }));
        }
      } catch (error) {
        console.error('❌ Error forwarding client message:', error);
      }
    };

    socket.onclose = () => {
      console.log('🔌 Client WebSocket closed');
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }
    };

    socket.onerror = (error) => {
      console.error('❌ Client WebSocket error:', error);
      if (openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.close();
      }
    };

    return response;

  } catch (error) {
    console.error('❌ WebSocket upgrade failed:', error);
    return new Response(`WebSocket upgrade failed: ${error.message}`, { 
      status: 500,
      headers: corsHeaders 
    });
  }
});


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to create WAV header
function createWavHeader(dataLength: number, sampleRate: number = 24000, channels: number = 1, bitsPerSample: number = 16): Uint8Array {
  const byteRate = sampleRate * channels * bitsPerSample / 8;
  const blockAlign = channels * bitsPerSample / 8;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF header
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + dataLength, true); // File size
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // Format chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // Chunk size
  view.setUint16(20, 1, true); // Audio format (PCM)
  view.setUint16(22, channels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, byteRate, true); // Byte rate
  view.setUint16(32, blockAlign, true); // Block align
  view.setUint16(34, bitsPerSample, true); // Bits per sample

  // Data chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, dataLength, true); // Data size

  return new Uint8Array(header);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🎤 Audio-to-text function called (AssemblyAI)');
    
    const { audioData, isSpeech, timestamp } = await req.json()

    console.log('📥 Request payload:', {
      hasAudioData: !!audioData,
      audioDataLength: audioData?.length || 0,
      isSpeech,
      timestamp: timestamp ? new Date(timestamp).toISOString() : 'undefined'
    });

    if (!audioData) {
      console.error('❌ No audio data provided');
      throw new Error('No audio data provided')
    }

    // Only process speech chunks
    if (!isSpeech) {
      console.log('⏭️ Skipping non-speech chunk');
      return new Response(
        JSON.stringify({ 
          transcript: '', 
          isFinal: false, 
          confidence: 0,
          isSpeech: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔊 Processing speech chunk with AssemblyAI...');

    // Convert base64 to binary
    const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
    console.log('✅ Base64 converted to binary, size:', binaryAudio.length, 'bytes');

    // Check if audio is too small
    if (binaryAudio.length < 1000) {
      console.log('⚠️ Audio chunk too small, skipping');
      return new Response(
        JSON.stringify({ 
          transcript: '', 
          isFinal: false, 
          confidence: 0,
          isSpeech: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const assemblyApiKey = Deno.env.get('ASSEMBLYAI_API_KEY');
    if (!assemblyApiKey) {
      console.error('❌ ASSEMBLYAI_API_KEY not found in environment');
      throw new Error('AssemblyAI API key not configured');
    }

    console.log('✅ AssemblyAI API key found, creating WAV file...');

    // Create proper WAV file
    const wavHeader = createWavHeader(binaryAudio.length);
    const wavFile = new Uint8Array(wavHeader.length + binaryAudio.length);
    wavFile.set(wavHeader, 0);
    wavFile.set(binaryAudio, wavHeader.length);

    console.log('🎵 Created WAV file, total size:', wavFile.length, 'bytes');

    const assemblyStartTime = Date.now();

    // Step 1: Upload the audio file to AssemblyAI
    const uploadFormData = new FormData()
    const audioBlob = new Blob([wavFile], { type: 'audio/wav' })
    uploadFormData.append('audio', audioBlob, 'audio.wav')

    console.log('📤 Uploading WAV audio file to AssemblyAI...');

    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': assemblyApiKey,
      },
      body: uploadFormData
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      console.error('❌ AssemblyAI upload error:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        errorText
      });
      
      return new Response(
        JSON.stringify({ 
          transcript: '', 
          isFinal: false, 
          confidence: 0,
          isSpeech: false,
          error: `AssemblyAI upload error: ${uploadResponse.status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const uploadResult = await uploadResponse.json()
    const audioUrl = uploadResult.upload_url
    console.log('✅ Audio uploaded successfully, URL:', audioUrl);

    // Step 2: Create transcription job
    console.log('📡 Creating transcription job...');

    const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': assemblyApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speech_model: 'best',
        language_detection: true,
        punctuate: true,
        format_text: true,
      })
    })

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error('❌ AssemblyAI transcription error:', {
        status: transcriptionResponse.status,
        statusText: transcriptionResponse.statusText,
        errorText
      });
      
      return new Response(
        JSON.stringify({ 
          transcript: '', 
          isFinal: false, 
          confidence: 0,
          isSpeech: false,
          error: `AssemblyAI transcription error: ${transcriptionResponse.status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const transcriptionResult = await transcriptionResponse.json()
    console.log('✅ Transcription job created:', {
      id: transcriptionResult.id,
      status: transcriptionResult.status
    });

    // Step 3: Poll for completion
    const transcriptId = transcriptionResult.id
    let transcript = '';
    let confidence = 0;

    if (transcriptId) {
      const pollResult = await pollForTranscript(transcriptId, assemblyApiKey);
      transcript = pollResult.text || '';
      confidence = pollResult.confidence || 0.8;
    }

    const processingTime = Date.now() - assemblyStartTime;
    console.log('📝 Final transcript result:', {
      transcript: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
      confidence,
      hasContent: transcript.length > 0,
      fullLength: transcript.length,
      processingTime: `${processingTime}ms`
    });

    const responseData = { 
      transcript,
      isFinal: true,
      confidence,
      isSpeech: true,
      timestamp
    };

    console.log('📤 Returning response:', responseData);

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Error in audio-to-text function:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // Return empty result instead of 500 error to prevent breaking the flow
    return new Response(
      JSON.stringify({ 
        transcript: '', 
        isFinal: false, 
        confidence: 0,
        isSpeech: false,
        error: error.message
      }),
      {
        status: 200, // Changed from 500 to 200 to prevent breaking the flow
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Helper function to poll for transcript result
async function pollForTranscript(transcriptId: string, apiKey: string, maxAttempts = 30): Promise<any> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`🔄 Polling AssemblyAI transcript ${transcriptId}, attempt ${attempt + 1}`);
    
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      console.error('❌ Error polling transcript:', response.status);
      break;
    }

    const result = await response.json();
    
    if (result.status === 'completed') {
      console.log('✅ Transcript completed');
      return result;
    } else if (result.status === 'error') {
      console.error('❌ Transcript failed:', result.error);
      break;
    }

    console.log(`⏳ Status: ${result.status}, waiting...`);
    
    // Wait before next poll (shorter interval for real-time feel)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return { text: '', confidence: 0 };
}

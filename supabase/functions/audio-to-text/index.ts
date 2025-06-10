
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🎤 Audio-to-text function called');
    
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

    console.log('🔊 Processing speech chunk, converting base64 to binary...');

    // Convert base64 to binary
    const binaryAudio = Uint8Array.from(atob(audioData), c => c.charCodeAt(0))
    console.log('✅ Base64 converted to binary, size:', binaryAudio.length, 'bytes');

    // Create a proper WAV file with header
    const sampleRate = 24000;
    const channels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * channels * bitsPerSample / 8;
    const blockAlign = channels * bitsPerSample / 8;
    
    // Create WAV header
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // RIFF chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + binaryAudio.length, true); // File size
    view.setUint32(8, 0x57415645, false); // "WAVE"
    
    // fmt sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat (PCM)
    view.setUint16(22, channels, true); // NumChannels
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, byteRate, true); // ByteRate
    view.setUint16(32, blockAlign, true); // BlockAlign
    view.setUint16(34, bitsPerSample, true); // BitsPerSample
    
    // data sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, binaryAudio.length, true); // Subchunk2Size
    
    // Combine header and audio data
    const wavFile = new Uint8Array(44 + binaryAudio.length);
    wavFile.set(new Uint8Array(wavHeader), 0);
    wavFile.set(binaryAudio, 44);

    // Prepare form data for Deepgram
    const formData = new FormData()
    const audioBlob = new Blob([wavFile], { type: 'audio/wav' })
    formData.append('audio', audioBlob, 'audio.wav')

    console.log('📡 Sending request to Deepgram API...');

    const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY');
    if (!deepgramApiKey) {
      console.error('❌ DEEPGRAM_API_KEY not found in environment');
      throw new Error('Deepgram API key not configured');
    }

    console.log('✅ Deepgram API key found, making request...');

    const deepgramStartTime = Date.now();

    // Send to Deepgram with proper URL parameters for real-time transcription
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&language=en-US&smart_format=true&punctuate=true&diarize=false', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
      },
      body: formData,
    })

    const deepgramTime = Date.now() - deepgramStartTime;
    console.log('📡 Deepgram response received in', deepgramTime, 'ms, status:', deepgramResponse.status);

    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text()
      console.error('❌ Deepgram API error:', {
        status: deepgramResponse.status,
        statusText: deepgramResponse.statusText,
        errorText
      });
      throw new Error(`Deepgram API error: ${deepgramResponse.status} ${errorText}`)
    }

    const result = await deepgramResponse.json()
    console.log('✅ Deepgram JSON parsed:', {
      hasResults: !!result.results,
      channelsCount: result.results?.channels?.length || 0,
      alternativesCount: result.results?.channels?.[0]?.alternatives?.length || 0,
      fullResult: result
    });

    // Extract transcript from Deepgram response
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    const confidence = result.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0

    console.log('📝 Extracted transcript:', {
      transcript: transcript.substring(0, 100) + (transcript.length > 100 ? '...' : ''),
      confidence,
      hasContent: transcript.length > 0,
      fullLength: transcript.length
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
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: error.name || 'UnknownError'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

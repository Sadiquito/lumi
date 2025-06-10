
import { useState, useRef, useCallback, useEffect } from 'react';
import { DEFAULT_CONFIG, type AudioRecorderConfig, type AudioChunk } from './audio/audioConfig';
import { useVoiceActivityDetection } from './audio/vadUtils';
import { useAudioProcessor } from './audio/audioProcessor';
import { useSpeechStateManager } from './audio/speechStateManager';

interface UseAudioRecorderProps {
  onAudioChunk?: (chunk: AudioChunk) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  config?: Partial<AudioRecorderConfig>;
}

export const useAudioRecorder = ({
  onAudioChunk,
  onSpeechStart,
  onSpeechEnd,
  config = {}
}: UseAudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const vadIntervalRef = useRef<number | null>(null);
  const speechChunkCountRef = useRef(0);
  
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Initialize VAD utilities
  const { analyserRef, detectVoiceActivity } = useVoiceActivityDetection(fullConfig);

  // Initialize audio processor
  const { audioContextRef, processAudioChunk } = useAudioProcessor({
    onAudioChunk: (chunk) => {
      // Only send speech chunks and limit frequency
      if (chunk.isSpeech) {
        speechChunkCountRef.current++;
        // Send every 3rd speech chunk to reduce load
        if (speechChunkCountRef.current % 3 === 0) {
          console.log('📤 Sending audio chunk to STT:', {
            chunkNumber: speechChunkCountRef.current,
            dataLength: chunk.data.length,
            timestamp: chunk.timestamp
          });
          onAudioChunk?.(chunk);
        }
      }
    },
    detectVoiceActivity,
  });

  // Initialize speech state manager
  const { handleSpeechStateChange, clearTimeouts } = useSpeechStateManager({
    isSpeaking,
    silenceDuration: fullConfig.silenceDuration,
    onSpeechStart: () => {
      console.log('🎤 Speech started - resetting chunk counter');
      speechChunkCountRef.current = 0;
      onSpeechStart?.();
    },
    onSpeechEnd,
    setIsSpeaking,
  });

  // Setup real-time audio processing with ScriptProcessorNode
  const setupRealtimeAudioProcessing = useCallback(() => {
    if (!audioContextRef.current || !streamRef.current) return;

    try {
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      
      // Create a ScriptProcessorNode for real-time audio processing
      const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      scriptProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        processAudioChunk(inputData);
      };
      
      // Connect the audio processing chain
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContextRef.current.destination);
      
      console.log('✅ Real-time audio processing setup complete');
      
    } catch (error) {
      console.error('Error setting up real-time audio processing:', error);
      setError(`Real-time audio processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [audioContextRef, processAudioChunk]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      console.log('🎙️ Starting recording...');

      // Request microphone with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: fullConfig.sampleRate,
          channelCount: fullConfig.channelCount,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      console.log('✅ Microphone access granted with constraints:', {
        sampleRate: fullConfig.sampleRate,
        channelCount: fullConfig.channelCount
      });

      // Create AudioContext for VAD and real-time processing
      audioContextRef.current = new AudioContext({
        sampleRate: fullConfig.sampleRate,
      });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);

      console.log('✅ Audio analysis setup complete with VAD threshold:', fullConfig.vadThreshold);

      // Setup real-time audio processing
      setupRealtimeAudioProcessing();
      
      // Start VAD monitoring with more frequent checks
      vadIntervalRef.current = window.setInterval(() => {
        const isSpeech = detectVoiceActivity();
        handleSpeechStateChange(isSpeech);
      }, 50); // Check VAD every 50ms for better responsiveness

      setIsRecording(true);
      speechChunkCountRef.current = 0;
      console.log('✅ Recording started successfully');

    } catch (err) {
      console.error('❌ Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [fullConfig, setupRealtimeAudioProcessing, detectVoiceActivity, handleSpeechStateChange]);

  const stopRecording = useCallback(() => {
    console.log('🛑 Stopping recording...');

    // Clean up audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🔇 Stopped audio track');
      });
      streamRef.current = null;
    }

    // Clear intervals and timeouts
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }

    clearTimeouts();

    setIsRecording(false);
    setIsSpeaking(false);
    setError(null);
    speechChunkCountRef.current = 0;
    console.log('✅ Recording stopped');
  }, [clearTimeouts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    isSpeaking,
    error,
    startRecording,
    stopRecording,
  };
};

export type { AudioChunk } from './audio/audioConfig';

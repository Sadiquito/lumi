
import { useState, useRef, useCallback, useEffect } from 'react';

interface AudioRecorderConfig {
  sampleRate: number;
  channelCount: number;
  chunkDuration: number; // in milliseconds
  vadThreshold: number;
  silenceDuration: number; // ms of silence before considering speech ended
}

const DEFAULT_CONFIG: AudioRecorderConfig = {
  sampleRate: 24000,
  channelCount: 1,
  chunkDuration: 500, // Increased for better processing
  vadThreshold: 0.02, // Slightly higher threshold
  silenceDuration: 1500,
};

export interface AudioChunk {
  data: Float32Array;
  timestamp: number;
  isSpeech: boolean;
}

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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const vadIntervalRef = useRef<number | null>(null);
  const silenceTimeoutRef = useRef<number | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);
  
  const fullConfig = { ...DEFAULT_CONFIG, ...config };

  // Improved VAD using audio analysis
  const detectVoiceActivity = useCallback(() => {
    if (!analyserRef.current) {
      console.log('No analyser available for VAD');
      return false;
    }

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS (Root Mean Square) for volume detection
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length) / 255;

    console.log('VAD RMS:', rms, 'Threshold:', fullConfig.vadThreshold);
    return rms > fullConfig.vadThreshold;
  }, [fullConfig.vadThreshold]);

  // Fixed audio data processing using ScriptProcessorNode for real-time processing
  const setupRealtimeAudioProcessing = useCallback(() => {
    if (!audioContextRef.current || !streamRef.current) return;

    try {
      const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
      
      // Create a ScriptProcessorNode for real-time audio processing
      const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      scriptProcessor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Create a copy of the audio data
        const audioData = new Float32Array(inputData.length);
        audioData.set(inputData);
        
        // Check if this chunk contains speech
        const isSpeech = detectVoiceActivity();
        
        // Only send audio chunks when speech is detected
        if (isSpeech) {
          const chunk: AudioChunk = {
            data: audioData,
            timestamp: Date.now(),
            isSpeech,
          };

          console.log('Sending real-time audio chunk:', {
            dataLength: audioData.length,
            isSpeech,
            timestamp: chunk.timestamp
          });

          onAudioChunk?.(chunk);
        }
      };
      
      // Connect the audio processing chain
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContextRef.current.destination);
      
      console.log('✅ Real-time audio processing setup complete');
      
    } catch (error) {
      console.error('Error setting up real-time audio processing:', error);
      setError(`Real-time audio processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [detectVoiceActivity, onAudioChunk]);

  // Handle speech state changes with logging
  const handleSpeechStateChange = useCallback((isSpeech: boolean) => {
    const currentTime = Date.now();

    if (isSpeech && !isSpeaking) {
      console.log('🎤 Speech detected - starting');
      setIsSpeaking(true);
      onSpeechStart?.();
      lastSpeechTimeRef.current = currentTime;
      
      // Clear any existing silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    } else if (isSpeech) {
      // Update last speech time
      lastSpeechTimeRef.current = currentTime;
      
      // Clear silence timeout if speech continues
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
    } else if (!isSpeech && isSpeaking) {
      // Start silence timeout
      if (!silenceTimeoutRef.current) {
        console.log('🔇 Starting silence timeout');
        silenceTimeoutRef.current = window.setTimeout(() => {
          console.log('🔇 Speech ended - silence detected');
          setIsSpeaking(false);
          onSpeechEnd?.();
          silenceTimeoutRef.current = null;
        }, fullConfig.silenceDuration);
      }
    }
  }, [isSpeaking, onSpeechStart, onSpeechEnd, fullConfig.silenceDuration]);

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
      console.log('✅ Microphone access granted');

      // Create AudioContext for VAD and real-time processing
      audioContextRef.current = new AudioContext({
        sampleRate: fullConfig.sampleRate,
      });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);

      console.log('✅ Audio analysis setup complete');

      // Setup real-time audio processing
      setupRealtimeAudioProcessing();
      
      // Start VAD monitoring
      vadIntervalRef.current = window.setInterval(() => {
        const isSpeech = detectVoiceActivity();
        handleSpeechStateChange(isSpeech);
      }, 100); // Check VAD every 100ms

      setIsRecording(true);
      console.log('✅ Recording started successfully');

    } catch (err) {
      console.error('❌ Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [fullConfig, setupRealtimeAudioProcessing, detectVoiceActivity, handleSpeechStateChange]);

  const stopRecording = useCallback(() => {
    console.log('🛑 Stopping recording...');

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

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

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    setIsRecording(false);
    setIsSpeaking(false);
    setError(null);
    console.log('✅ Recording stopped');
  }, []);

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

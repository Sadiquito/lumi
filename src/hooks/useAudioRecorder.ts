
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
  chunkDuration: 250,
  vadThreshold: 0.01,
  silenceDuration: 1000,
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

  // VAD using audio analysis
  const detectVoiceActivity = useCallback(() => {
    if (!analyserRef.current) return false;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate RMS (Root Mean Square) for volume detection
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length) / 255;

    return rms > fullConfig.vadThreshold;
  }, [fullConfig.vadThreshold]);

  // Process audio data for VAD and chunking
  const processAudioData = useCallback((audioData: Float32Array) => {
    const isSpeech = detectVoiceActivity();
    const currentTime = Date.now();

    // Handle speech state changes
    if (isSpeech && !isSpeaking) {
      console.log('Speech detected - starting');
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
        silenceTimeoutRef.current = window.setTimeout(() => {
          console.log('Speech ended - silence detected');
          setIsSpeaking(false);
          onSpeechEnd?.();
          silenceTimeoutRef.current = null;
        }, fullConfig.silenceDuration);
      }
    }

    // Send audio chunk regardless of speech detection for continuous processing
    const chunk: AudioChunk = {
      data: new Float32Array(audioData),
      timestamp: currentTime,
      isSpeech,
    };

    onAudioChunk?.(chunk);
  }, [detectVoiceActivity, isSpeaking, onSpeechStart, onSpeechEnd, onAudioChunk, fullConfig.silenceDuration]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      console.log('Requesting microphone access...');

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

      // Create AudioContext for VAD
      audioContextRef.current = new AudioContext({
        sampleRate: fullConfig.sampleRate,
      });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);

      // Set up MediaRecorder for chunked recording
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle audio data chunks
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          try {
            // Convert blob to Float32Array for processing
            const arrayBuffer = await event.data.arrayBuffer();
            const audioContext = new AudioContext({ sampleRate: fullConfig.sampleRate });
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const audioData = audioBuffer.getChannelData(0);
            
            processAudioData(audioData);
          } catch (error) {
            console.error('Error processing audio chunk:', error);
          }
        }
      };

      // Start recording with chunked intervals
      mediaRecorder.start(fullConfig.chunkDuration);
      
      // Start VAD monitoring
      vadIntervalRef.current = window.setInterval(() => {
        detectVoiceActivity();
      }, 50); // Check VAD every 50ms

      setIsRecording(true);
      console.log('Recording started successfully');

    } catch (err) {
      console.error('Error starting recording:', err);
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [fullConfig, processAudioData, detectVoiceActivity]);

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Clean up audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
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

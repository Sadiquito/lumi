
import { useCallback, useRef } from 'react';
import type { AudioChunk } from './audioConfig';

interface AudioProcessorProps {
  onAudioChunk?: (chunk: AudioChunk) => void;
  detectVoiceActivity: () => boolean;
}

export const useAudioProcessor = ({ onAudioChunk, detectVoiceActivity }: AudioProcessorProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const setupRealtimeAudioProcessing = useCallback(() => {
    if (!audioContextRef.current) return;

    // Get the media stream from the audio context
    const mediaStreamSources = audioContextRef.current;
    if (!mediaStreamSources) return;

    try {
      // We'll need to access the stream from the parent component
      // This is a simplified version - the actual stream connection happens in the main hook
      console.log('✅ Real-time audio processing setup initiated');
    } catch (error) {
      console.error('Error setting up real-time audio processing:', error);
      throw new Error(`Real-time audio processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const processAudioChunk = useCallback((inputData: Float32Array) => {
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
  }, [detectVoiceActivity, onAudioChunk]);

  return {
    audioContextRef,
    setupRealtimeAudioProcessing,
    processAudioChunk,
  };
};

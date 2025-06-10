
import { useCallback, useRef } from 'react';
import type { AudioRecorderConfig } from './audioConfig';

export const useVoiceActivityDetection = (config: AudioRecorderConfig) => {
  const analyserRef = useRef<AnalyserNode | null>(null);

  const detectVoiceActivity = useCallback(() => {
    if (!analyserRef.current) {
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

    // Also check for speech-like frequency patterns
    const speechFrequencyRange = dataArray.slice(10, 100); // Focus on typical speech frequencies
    const speechEnergy = speechFrequencyRange.reduce((acc, val) => acc + val, 0) / speechFrequencyRange.length;
    
    const isVoiceDetected = rms > config.vadThreshold && speechEnergy > 30;
    
    if (isVoiceDetected) {
      console.log('🎤 Voice detected - RMS:', rms.toFixed(4), 'Speech Energy:', speechEnergy.toFixed(2), 'Threshold:', config.vadThreshold);
    }
    
    return isVoiceDetected;
  }, [config.vadThreshold]);

  return {
    analyserRef,
    detectVoiceActivity,
  };
};

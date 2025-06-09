
import { useCallback, useRef } from 'react';
import type { AudioRecorderConfig } from './audioConfig';

export const useVoiceActivityDetection = (config: AudioRecorderConfig) => {
  const analyserRef = useRef<AnalyserNode | null>(null);

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

    console.log('VAD RMS:', rms, 'Threshold:', config.vadThreshold);
    return rms > config.vadThreshold;
  }, [config.vadThreshold]);

  return {
    analyserRef,
    detectVoiceActivity,
  };
};

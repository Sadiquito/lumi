
import { useState } from 'react';
import { AudioQuality, NetworkStatus } from '@/types/audioRecording';

export const useAudioRecordingState = () => {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioQuality, setAudioQuality] = useState<AudioQuality>({
    level: 'good',
    signalToNoise: 0.8
  });
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({ online: true });
  const [retryCount, setRetryCount] = useState(0);

  return {
    recordedBlob,
    setRecordedBlob,
    audioQuality,
    setAudioQuality,
    networkStatus,
    setNetworkStatus,
    retryCount,
    setRetryCount,
  };
};

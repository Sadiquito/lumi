
import { useState } from 'react';

export const useAudioRecordingState = () => {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioQuality, setAudioQuality] = useState<'good' | 'low' | 'poor'>('good');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
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

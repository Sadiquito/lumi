
import { useState } from 'react';

export const useAudioRecordingState = () => {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [transcriptionProgress, setTranscriptionProgress] = useState(0);
  const [thinkingProgress, setThinkingProgress] = useState(0);
  const [audioQuality, setAudioQuality] = useState<'good' | 'low' | 'poor'>('good');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');
  const [retryCount, setRetryCount] = useState(0);

  return {
    recordedBlob,
    setRecordedBlob,
    isTranscribing,
    setIsTranscribing,
    aiResponse,
    setAiResponse,
    transcriptionProgress,
    setTranscriptionProgress,
    thinkingProgress,
    setThinkingProgress,
    audioQuality,
    setAudioQuality,
    networkStatus,
    setNetworkStatus,
    retryCount,
    setRetryCount,
  };
};

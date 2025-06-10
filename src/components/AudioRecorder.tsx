
import React from 'react';
import { AudioRecorderCore } from './audio/AudioRecorderCore';
import type { AudioRecorderProps } from '@/types/audioRecorder';

export const AudioRecorder: React.FC<AudioRecorderProps> = (props) => {
  return <AudioRecorderCore {...props} />;
};

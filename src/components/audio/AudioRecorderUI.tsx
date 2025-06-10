
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AudioRecorderStatus } from './AudioRecorderStatus';
import { AudioRecorderControls } from './AudioRecorderControls';

interface AudioRecorderUIProps {
  isRecording: boolean;
  isSpeaking: boolean;
  error: string | null;
  onToggleRecording: () => void;
}

export const AudioRecorderUI: React.FC<AudioRecorderUIProps> = ({
  isRecording,
  isSpeaking,
  error,
  onToggleRecording,
}) => {
  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-8 text-center space-y-6">
        <AudioRecorderStatus isRecording={isRecording} isSpeaking={isSpeaking} />

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <AudioRecorderControls
          isRecording={isRecording}
          isSpeaking={isSpeaking}
          onToggleRecording={onToggleRecording}
        />
      </CardContent>
    </Card>
  );
};

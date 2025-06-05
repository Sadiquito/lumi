
import React from 'react';
import { Brain, MessageSquare } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AudioRecordingProcessingStateProps {
  isTranscribing: boolean;
  transcriptionProgress: number;
  thinkingProgress: number;
}

const AudioRecordingProcessingState: React.FC<AudioRecordingProcessingStateProps> = ({
  isTranscribing,
  transcriptionProgress,
  thinkingProgress
}) => {
  return (
    <div className="text-center space-y-4 p-6 bg-lumi-deep-space/20 rounded-lg border border-lumi-sunset-coral/20">
      {isTranscribing ? (
        <>
          <div className="flex items-center justify-center space-x-3">
            <MessageSquare className="w-6 h-6 text-lumi-sunset-coral animate-pulse" />
            <span className="text-white text-lg font-medium">Transcribing your message...</span>
          </div>
          <Progress value={transcriptionProgress} className="w-full" />
          <p className="text-white/70 text-sm">{transcriptionProgress}% complete</p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center space-x-3">
            <Brain className="w-6 h-6 text-lumi-sunset-coral animate-pulse" />
            <span className="text-white text-lg font-medium">Lumi is thinking...</span>
          </div>
          <Progress value={thinkingProgress} className="w-full" />
          <p className="text-white/70 text-sm">Processing your thoughts...</p>
        </>
      )}
    </div>
  );
};

export default AudioRecordingProcessingState;

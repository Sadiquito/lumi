
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, Square } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioRecordingFeatureProps {
  onTranscriptionComplete?: (transcript: string) => void;
  disabled?: boolean;
}

const AudioRecordingFeature: React.FC<AudioRecordingFeatureProps> = ({
  onTranscriptionComplete,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const startRecording = async () => {
    if (disabled) return;
    
    try {
      // Basic recording functionality - always available
      setIsRecording(true);
      
      // This is a basic feature available to all users
      toast({
        title: "Recording started",
        description: "Audio recording and transcription are always available.",
      });
      
      // Implement actual recording logic here
      console.log('Starting audio recording...');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not start audio recording.",
        variant: "destructive",
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      const mockTranscript = "This is a sample transcription. Audio recording and transcription remain available during and after trial.";
      onTranscriptionComplete?.(mockTranscript);
      
      toast({
        title: "Transcription complete",
        description: "Your audio has been transcribed successfully.",
      });
    }, 2000);
  };

  return (
    <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center">
          <Mic className="w-5 h-5 mr-2 text-lumi-aquamarine" />
          voice recording
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-white/70 text-sm mb-4">
            Record your thoughts - transcription is always available
          </p>
          
          <div className="flex justify-center space-x-3">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={disabled || isProcessing}
                className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
              >
                <Mic className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Start Recording'}
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>
        
        {isRecording && (
          <div className="flex items-center justify-center space-x-2 text-lumi-aquamarine">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Recording in progress...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioRecordingFeature;

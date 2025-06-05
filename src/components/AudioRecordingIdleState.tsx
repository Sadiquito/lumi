
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Keyboard, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AudioRecordingIdleStateProps {
  disabled: boolean;
  onStartRecording: () => void;
  onFallbackToText?: () => void;
  networkStatus?: 'online' | 'offline';
  isSupported?: boolean;
}

const AudioRecordingIdleState: React.FC<AudioRecordingIdleStateProps> = ({
  disabled,
  onStartRecording,
  onFallbackToText,
  networkStatus = 'online',
  isSupported = true
}) => {
  const canUseAudio = isSupported && networkStatus === 'online' && !disabled;

  return (
    <div className="text-center space-y-4">
      <div className="space-y-3">
        <h3 className="text-white text-xl font-medium">
          Ready to listen
        </h3>
        <p className="text-white/70 text-sm">
          Share what's on your mind using voice or text
        </p>
      </div>

      {/* Network Status Indicator */}
      <div className="flex items-center justify-center space-x-2">
        {networkStatus === 'online' ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              Connected
            </Badge>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-400" />
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
              Offline
            </Badge>
          </>
        )}
      </div>

      {/* Offline Warning */}
      {networkStatus === 'offline' && (
        <Alert className="bg-red-500/20 border-red-500/30">
          <AlertDescription className="text-white">
            Voice features require an internet connection. You can still use text input.
          </AlertDescription>
        </Alert>
      )}

      {/* Audio Not Supported Warning */}
      {!isSupported && (
        <Alert className="bg-yellow-500/20 border-yellow-500/30">
          <AlertDescription className="text-white">
            Audio recording is not supported in your browser. Please use text input.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        {/* Voice Input Button */}
        <Button
          onClick={onStartRecording}
          disabled={!canUseAudio}
          className={`${
            canUseAudio 
              ? 'bg-lumi-aquamarine hover:bg-lumi-aquamarine/90' 
              : 'bg-gray-500/50'
          } text-white px-6 py-3 text-lg transition-all duration-200`}
        >
          <Mic className="w-5 h-5 mr-2" />
          {canUseAudio ? 'Start Voice Input' : 'Voice Unavailable'}
        </Button>

        {/* Text Input Fallback */}
        {onFallbackToText && (
          <Button
            onClick={onFallbackToText}
            variant="outline"
            className="border-lumi-sunset-coral text-lumi-sunset-coral hover:bg-lumi-sunset-coral/10 px-6 py-3 text-lg"
          >
            <Keyboard className="w-5 h-5 mr-2" />
            Use Text Input
          </Button>
        )}
      </div>

      {/* Tips */}
      <div className="pt-4 border-t border-lumi-sunset-coral/10">
        <p className="text-white/50 text-xs">
          💡 For best results: Speak clearly, ensure good internet connection, and allow microphone access
        </p>
      </div>
    </div>
  );
};

export default AudioRecordingIdleState;

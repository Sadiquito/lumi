
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, VolumeX } from 'lucide-react';

interface TTSErrorBoundaryProps {
  children: React.ReactNode;
  fallbackText?: string;
  onRetry?: () => void;
}

const TTSErrorBoundary: React.FC<TTSErrorBoundaryProps> = ({
  children,
  fallbackText,
  onRetry
}) => {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setHasError(false);
      onRetry?.();
    }
  };

  if (hasError) {
    return (
      <Alert className="bg-lumi-charcoal/80 border-red-500/20">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <AlertDescription className="text-white">
          <div className="space-y-2">
            <p className="text-sm">Audio generation failed. You can still read the text below:</p>
            {fallbackText && (
              <div className="p-2 bg-lumi-deep-space/30 rounded text-white/80 text-sm italic">
                "{fallbackText}"
              </div>
            )}
            <div className="flex items-center space-x-2">
              {retryCount < 3 && (
                <Button
                  onClick={handleRetry}
                  size="sm"
                  variant="outline"
                  className="border-lumi-aquamarine/30 text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry ({3 - retryCount} left)
                </Button>
              )}
              {retryCount >= 3 && (
                <span className="text-xs text-red-400 flex items-center">
                  <VolumeX className="w-3 h-3 mr-1" />
                  Audio unavailable - please try again later
                </span>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div onError={() => setHasError(true)}>
      {children}
    </div>
  );
};

export default TTSErrorBoundary;

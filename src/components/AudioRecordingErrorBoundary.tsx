
import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onFallbackToText?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AudioRecordingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Audio Recording Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleFallbackToText = () => {
    this.props.onFallbackToText?.();
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="bg-red-500/20 border-red-500/30">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-white">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Voice recording encountered an error</h4>
                <p className="text-sm text-white/80 mt-1">
                  Don't worry - you can continue using text input while we fix this.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={this.handleFallbackToText}
                  size="sm"
                  className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
                >
                  Use Text Input
                </Button>
                <Button
                  onClick={this.handleReset}
                  size="sm"
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Try Voice Again
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default AudioRecordingErrorBoundary;


import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface TrialErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  retryCount: number;
}

interface TrialErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  maxRetries?: number;
}

class TrialErrorBoundary extends Component<TrialErrorBoundaryProps, TrialErrorBoundaryState> {
  private maxRetries: number;

  constructor(props: TrialErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      errorMessage: '',
      retryCount: 0
    };
    this.maxRetries = props.maxRetries || 3;
  }

  static getDerivedStateFromError(error: Error): TrialErrorBoundaryState {
    return { 
      hasError: true, 
      errorMessage: error.message || 'An unexpected error occurred',
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Trial Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Add error reporting service here
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        errorMessage: '',
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Alert className="bg-red-500/10 border-red-500/20 backdrop-blur-sm">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertTitle className="text-red-400">Trial Status Error</AlertTitle>
          <AlertDescription className="text-white/80">
            <div className="space-y-3">
              <p>Unable to load trial information: {this.state.errorMessage}</p>
              
              {this.state.retryCount < this.maxRetries ? (
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Retry ({this.maxRetries - this.state.retryCount} attempts left)
                </Button>
              ) : (
                <div className="text-sm text-white/60">
                  <p>Maximum retry attempts reached. Please refresh the page or contact support if the issue persists.</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    size="sm"
                    className="border-red-400 text-red-400 hover:bg-red-400/10 mt-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-2" />
                    Refresh Page
                  </Button>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default TrialErrorBoundary;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (error.includes('React')) {
    return (
      <Card className="border-red-500 bg-red-50/90 backdrop-blur-sm max-w-md">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-700 text-sm font-medium">Component Error</p>
              <p className="text-red-600 text-xs mt-1">Please refresh the page</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-500 bg-red-50/90 backdrop-blur-sm max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-red-700 text-sm font-medium">Connection Error</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
            {error.includes('API key') && (
              <p className="text-red-600 text-xs mt-1">
                Note: Direct WebRTC connection requires API key configuration
              </p>
            )}
          </div>
        </div>
      </CardContent>
    );
  );
};

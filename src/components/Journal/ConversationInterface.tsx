import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import LumiInitiatedConversation from './LumiInitiatedConversation';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

function ConversationInterface() {
  const [isInConversation, setIsInConversation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const handleStartConversation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Start the conversation immediately
      setIsInConversation(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation. Please try again.');
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationEnd = () => {
    setIsInConversation(false);
  };

  if (isInConversation) {
    return (
      <ErrorBoundary>
        <div className="w-full max-w-2xl mx-auto">
          <LumiInitiatedConversation
            autoStart={true}
            onConversationEnd={handleConversationEnd}
            onStateChange={(state) => {
              console.log('Conversation state changed:', state);
            }}
          />
        </div>
      </ErrorBoundary>
    );
  }

  // Always show fallback UI if not in conversation
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {error && (
        <div className="text-red-500 text-center mb-2">{error}</div>
      )}
      <Button
        onClick={handleStartConversation}
        disabled={isLoading}
        className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 transition-all duration-200"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      <p className="text-sm text-muted-foreground">
        {isLoading ? 'Starting conversation...' : 'Click to start talking with Lumi'}
      </p>
    </div>
  );
}

export default ConversationInterface;

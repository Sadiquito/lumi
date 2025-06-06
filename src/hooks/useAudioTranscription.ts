
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAudioTranscription = () => {
  const { toast } = useToast();

  const transcribeAudio = async (
    audioBlob: Blob,
    retryCount: number,
    setTranscriptionProgress: (value: number | ((prev: number) => number)) => void,
    onFallbackToText?: () => void
  ): Promise<string> => {
    const attemptTranscription = async (attempt: number): Promise<string> => {
      try {
        const arrayBuffer = await audioBlob.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        const progressInterval = setInterval(() => {
          setTranscriptionProgress(prev => Math.min(prev + 10, 70));
        }, 200);

        console.log(`Starting Whisper transcription (attempt ${attempt + 1})...`);
        
        const { data, error } = await supabase.functions.invoke('whisper-transcription', {
          body: {
            audio: base64Audio,
            language: 'en'
          }
        });

        clearInterval(progressInterval);
        setTranscriptionProgress(100);

        if (error) {
          // Handle specific error types from the backend
          let errorMessage = error.message || 'Transcription failed';
          let shouldFallback = false;
          
          if (errorMessage.includes('Daily transcription limit reached')) {
            toast({
              title: "Daily Limit Reached",
              description: "You've used all voice features today. Upgrade for unlimited access.",
              variant: "destructive",
            });
            shouldFallback = true;
          } else if (errorMessage.includes('temporarily unavailable')) {
            errorMessage = 'Voice transcription is temporarily unavailable. Please try text input.';
            shouldFallback = true;
          } else if (errorMessage.includes('sign in again')) {
            toast({
              title: "Authentication Required",
              description: "Please sign in again to continue using voice features.",
              variant: "destructive",
            });
            shouldFallback = true;
          } else if (errorMessage.includes('too large') || errorMessage.includes('too long')) {
            toast({
              title: "Audio Too Long",
              description: "Please record shorter messages or try text input.",
              variant: "destructive",
            });
            shouldFallback = true;
          } else if (errorMessage.includes('No speech detected')) {
            toast({
              title: "No Speech Detected",
              description: "Please speak clearly and try again, or use text input.",
            });
            shouldFallback = true;
          }
          
          if (shouldFallback && onFallbackToText) {
            onFallbackToText();
          }
          
          throw new Error(errorMessage);
        }

        const transcript = data?.text || '';
        const confidence = data?.confidence || 0;
        
        console.log('Transcription completed:', { transcript, confidence });

        if (!transcript.trim()) {
          throw new Error('No speech detected in audio');
        }

        if (confidence < 0.3) {
          console.warn('Low confidence transcription:', confidence);
          toast({
            title: "Audio Quality Warning",
            description: "The audio quality was low. Please speak clearly and try again if needed.",
          });
        }

        return transcript;
      } catch (error) {
        console.error(`Transcription attempt ${attempt + 1} failed:`, error);
        throw error;
      }
    };

    try {
      return await attemptTranscription(retryCount);
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not transcribe your audio';
      
      // Determine if we should retry based on error type
      if (retryCount < 2 && (
        errorMessage.includes('network') || 
        errorMessage.includes('timeout') ||
        errorMessage.includes('temporarily unavailable')
      )) {
        throw new Error('RETRY_NEEDED');
      }
      
      // For other errors, provide user-friendly feedback
      let userMessage = errorMessage;
      if (errorMessage.includes('rate limit') || errorMessage.includes('busy')) {
        userMessage = 'Voice service is busy. Please try text input instead.';
      } else if (errorMessage.includes('authentication') || errorMessage.includes('sign in')) {
        userMessage = 'Please sign in again to use voice features.';
      } else if (!errorMessage.includes('Daily transcription limit') && 
                 !errorMessage.includes('No speech detected') &&
                 !errorMessage.includes('too large')) {
        userMessage = 'Voice transcription failed. Please try text input instead.';
      }
      
      toast({
        title: "Transcription Failed",
        description: userMessage,
        variant: "destructive",
      });
      
      if (onFallbackToText && !errorMessage.includes('RETRY_NEEDED')) {
        onFallbackToText();
      }
      
      throw error;
    }
  };

  return { transcribeAudio };
};

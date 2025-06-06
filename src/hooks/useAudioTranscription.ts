
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
          const errorMessage = error.message || 'Transcription failed';
          
          // Handle specific error types with graceful fallback
          if (errorMessage.includes('TRANSCRIPTION_LIMIT_REACHED')) {
            toast({
              title: "Daily Limit Reached",
              description: "Switching to text input for today. Upgrade for unlimited voice features.",
            });
            if (onFallbackToText) onFallbackToText();
            throw new Error('FALLBACK_TO_TEXT');
          } else if (errorMessage.includes('TRANSCRIPTION_SERVICE_UNAVAILABLE') || 
                     errorMessage.includes('TRANSCRIPTION_SERVER_ERROR')) {
            toast({
              title: "Voice Temporarily Unavailable",
              description: "Switching to text input. Voice will return shortly.",
            });
            if (onFallbackToText) onFallbackToText();
            throw new Error('FALLBACK_TO_TEXT');
          } else if (errorMessage.includes('TRANSCRIPTION_AUTH_REQUIRED') || 
                     errorMessage.includes('TRANSCRIPTION_AUTH_INVALID')) {
            toast({
              title: "Authentication Required",
              description: "Please sign in again to continue using voice features.",
              variant: "destructive",
            });
            if (onFallbackToText) onFallbackToText();
            throw new Error('FALLBACK_TO_TEXT');
          } else if (errorMessage.includes('TRANSCRIPTION_FILE_TOO_LARGE')) {
            toast({
              title: "Recording Too Long",
              description: "Please record shorter messages or use text input.",
            });
            if (onFallbackToText) onFallbackToText();
            throw new Error('FALLBACK_TO_TEXT');
          } else if (errorMessage.includes('TRANSCRIPTION_NO_SPEECH')) {
            toast({
              title: "No Speech Detected",
              description: "Please speak clearly and try again, or use text input.",
            });
            // For no speech, allow retry
            throw new Error('RETRY_NEEDED');
          } else if (errorMessage.includes('TRANSCRIPTION_RATE_LIMIT')) {
            toast({
              title: "Service Busy",
              description: "Voice service is busy. Please try again in a moment.",
            });
            throw new Error('RETRY_NEEDED');
          }
          
          // Generic error handling
          console.error('Transcription error:', errorMessage);
          throw new Error(errorMessage);
        }

        const transcript = data?.text || '';
        const confidence = data?.confidence || 0;
        
        console.log('Transcription completed:', { transcript, confidence });

        if (!transcript.trim()) {
          throw new Error('TRANSCRIPTION_NO_SPEECH');
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
      
      // Handle fallback scenarios
      if (errorMessage === 'FALLBACK_TO_TEXT') {
        throw error; // Re-throw to trigger fallback
      }
      
      // Determine if we should retry based on error type
      if (retryCount < 1 && errorMessage === 'RETRY_NEEDED') {
        console.log('Retrying transcription...');
        throw new Error('RETRY_NEEDED');
      }
      
      // For other errors after retries, fallback to text
      if (retryCount >= 1) {
        toast({
          title: "Voice Not Working",
          description: "Switching to text input. Please type your message.",
        });
        if (onFallbackToText) {
          onFallbackToText();
        }
        throw new Error('FALLBACK_TO_TEXT');
      }
      
      throw error;
    }
  };

  return { transcribeAudio };
};


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
      let progressInterval: NodeJS.Timeout | null = null;
      
      try {
        // Enhanced input validation
        if (!audioBlob) {
          console.error('No audio blob provided');
          throw new Error('TRANSCRIPTION_NO_AUDIO');
        }

        if (audioBlob.size === 0) {
          console.error('Audio blob is empty');
          throw new Error('TRANSCRIPTION_NO_AUDIO');
        }

        // Check if blob has valid content
        try {
          const arrayBuffer = await audioBlob.arrayBuffer();
          if (arrayBuffer.byteLength === 0) {
            throw new Error('TRANSCRIPTION_NO_AUDIO');
          }

          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          if (!base64Audio || base64Audio.length === 0) {
            throw new Error('TRANSCRIPTION_NO_AUDIO');
          }

          progressInterval = setInterval(() => {
            setTranscriptionProgress(prev => Math.min(prev + 10, 70));
          }, 200);

          console.log(`Starting Whisper transcription (attempt ${attempt + 1})...`);
          
          const { data, error } = await supabase.functions.invoke('whisper-transcription', {
            body: {
              audio: base64Audio,
              language: 'en'
            }
          });

          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
          setTranscriptionProgress(100);

          if (error) {
            const errorMessage = error.message || 'Transcription failed';
            console.error('Transcription API error:', errorMessage);
            
            // Handle specific error types gracefully
            if (errorMessage.includes('TRANSCRIPTION_LIMIT_REACHED')) {
              throw new Error('FALLBACK_TO_TEXT');
            } else if (errorMessage.includes('TRANSCRIPTION_SERVICE_UNAVAILABLE') || 
                       errorMessage.includes('TRANSCRIPTION_SERVER_ERROR')) {
              throw new Error('FALLBACK_TO_TEXT');
            } else if (errorMessage.includes('TRANSCRIPTION_AUTH_REQUIRED') || 
                       errorMessage.includes('TRANSCRIPTION_AUTH_INVALID')) {
              throw new Error('FALLBACK_TO_TEXT');
            } else if (errorMessage.includes('TRANSCRIPTION_FILE_TOO_LARGE')) {
              throw new Error('FALLBACK_TO_TEXT');
            } else if (errorMessage.includes('TRANSCRIPTION_NO_SPEECH')) {
              throw new Error('RETRY_NEEDED');
            } else if (errorMessage.includes('TRANSCRIPTION_RATE_LIMIT')) {
              throw new Error('RETRY_NEEDED');
            }
            
            throw new Error(errorMessage);
          }

          // Validate response data
          if (!data || typeof data !== 'object') {
            throw new Error('TRANSCRIPTION_INVALID_RESPONSE');
          }

          const transcript = data.text || '';
          const confidence = data.confidence || 0;
          
          console.log('Transcription completed:', { transcript, confidence });

          // Validate transcript content
          if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
            throw new Error('TRANSCRIPTION_NO_SPEECH');
          }

          if (confidence < 0.1) {
            console.warn('Very low confidence transcription:', confidence);
            // Still return the transcript but log warning
          }

          return transcript.trim();

        } catch (processingError) {
          console.error('Audio processing error:', processingError);
          throw new Error('TRANSCRIPTION_PROCESSING_ERROR');
        }

      } catch (error) {
        console.error(`Transcription attempt ${attempt + 1} failed:`, error);
        
        // Clean up progress interval
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        
        throw error;
      }
    };

    try {
      const result = await attemptTranscription(retryCount);
      return result;
    } catch (error) {
      console.error('Transcription error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Could not transcribe your audio';
      
      // Handle fallback scenarios
      if (errorMessage === 'FALLBACK_TO_TEXT') {
        console.log('Falling back to text input due to service issues');
        if (onFallbackToText) {
          onFallbackToText();
        }
        throw error; // Re-throw to trigger fallback
      }
      
      // Determine if we should retry based on error type
      if (retryCount < 1 && (errorMessage === 'RETRY_NEEDED' || errorMessage.includes('TRANSCRIPTION_NO_SPEECH'))) {
        console.log('Will retry transcription...');
        throw new Error('RETRY_NEEDED');
      }
      
      // For other errors after retries, return safe fallback text
      if (retryCount >= 1) {
        console.log('Max retries reached, providing fallback response');
        return "I didn't catch that clearly. Could you please try again?";
      }
      
      // Default safe fallback
      console.log('Providing safe fallback for transcription error');
      return "I'm having trouble hearing you clearly. Please try again.";
    }
  };

  return { transcribeAudio };
};


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
          throw new Error(error.message || 'Transcription failed');
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
            title: "Audio quality warning",
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
      
      if (retryCount < 2 && (errorMessage.includes('network') || errorMessage.includes('timeout'))) {
        throw new Error('RETRY_NEEDED');
      }
      
      toast({
        title: "Transcription failed",
        description: `${errorMessage}. Please try text input instead.`,
        variant: "destructive",
      });
      
      if (onFallbackToText) {
        onFallbackToText();
      }
      
      throw error;
    }
  };

  return { transcribeAudio };
};

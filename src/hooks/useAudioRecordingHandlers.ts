
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ConversationData } from '@/types/audioRecording';

export const useAudioRecordingHandlers = (
  setRetryCount: (fn: (prev: number) => number) => void,
  onFallbackToText?: () => void
) => {
  const { toast } = useToast();

  const handleTimeoutError = (state: string) => {
    toast({
      title: "Session timeout",
      description: `The ${state} phase timed out. Please try again.`,
      variant: "destructive",
    });
    
    if (onFallbackToText) {
      onFallbackToText();
    }
  };

  const handleConversationError = (error: string) => {
    toast({
      title: "Conversation error",
      description: error,
      variant: "destructive",
    });
  };

  const handleAudioRecorderError = (error: string) => {
    console.error('Audio recorder error:', error);
    
    if (error.includes('Permission denied') || error.includes('permission')) {
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access in your browser settings and try again.",
        variant: "destructive",
      });
    } else if (error.includes('not supported')) {
      toast({
        title: "Audio recording not supported",
        description: "Your browser doesn't support audio recording. Please use text input instead.",
        variant: "destructive",
      });
      if (onFallbackToText) {
        onFallbackToText();
      }
    } else {
      toast({
        title: "Recording error",
        description: `Recording failed: ${error}. Switching to text input.`,
        variant: "destructive",
      });
      if (onFallbackToText) {
        onFallbackToText();
      }
    }
  };

  const storeConversation = async (transcript: string, aiResponse: string): Promise<ConversationData | null> => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          transcript,
          ai_response: aiResponse,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log('Conversation stored:', data);
      return data;
    } catch (error) {
      console.error('Failed to store conversation:', error);
      return null;
    }
  };

  return {
    handleTimeoutError,
    handleConversationError,
    handleAudioRecorderError,
    storeConversation,
  };
};

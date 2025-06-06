
/**
 * Audio pipeline hook that orchestrates transcription and synthesis
 * with dependency injection for easy testing and provider swapping
 */

import { useState, useCallback } from 'react';
import { transcribeAudio, AudioTranscriptionResult } from '@/utils/audioTranscription';
import { synthesizeAudio, AudioSynthesisResult } from '@/utils/audioSynthesis';
import { useToast } from '@/hooks/use-toast';

interface UseAudioPipelineProps {
  onTranscriptionComplete?: (result: AudioTranscriptionResult) => void;
  onSynthesisComplete?: (result: AudioSynthesisResult) => void;
  onError?: (error: Error, stage: 'transcription' | 'synthesis') => void;
}

export const useAudioPipeline = ({
  onTranscriptionComplete,
  onSynthesisComplete,
  onError
}: UseAudioPipelineProps = {}) => {
  const { toast } = useToast();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<AudioTranscriptionResult | null>(null);
  const [synthesisResult, setSynthesisResult] = useState<AudioSynthesisResult | null>(null);

  const handleTranscription = useCallback(async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscriptionResult(null);
    
    try {
      const result = await transcribeAudio(audioBlob);
      setTranscriptionResult(result);
      onTranscriptionComplete?.(result);
      
      toast({
        title: "Transcription complete",
        description: `Transcribed ${result.text.length} characters`,
      });
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Transcription failed');
      onError?.(errorObj, 'transcription');
      
      toast({
        title: "Transcription failed",
        description: errorObj.message,
        variant: "destructive",
      });
      
      throw errorObj;
    } finally {
      setIsTranscribing(false);
    }
  }, [onTranscriptionComplete, onError, toast]);

  const handleSynthesis = useCallback(async (text: string) => {
    setIsSynthesizing(true);
    setSynthesisResult(null);
    
    try {
      const result = await synthesizeAudio(text);
      setSynthesisResult(result);
      onSynthesisComplete?.(result);
      
      toast({
        title: "Audio synthesis complete",
        description: `Generated audio for ${result.characterCount} characters`,
      });
      
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Synthesis failed');
      onError?.(errorObj, 'synthesis');
      
      toast({
        title: "Audio synthesis failed",
        description: errorObj.message,
        variant: "destructive",
      });
      
      throw errorObj;
    } finally {
      setIsSynthesizing(false);
    }
  }, [onSynthesisComplete, onError, toast]);

  const processConversationTurn = useCallback(async (audioBlob: Blob): Promise<{
    transcription: AudioTranscriptionResult;
    aiResponse?: string;
    synthesis?: AudioSynthesisResult;
  }> => {
    // Step 1: Transcribe user audio
    const transcription = await handleTranscription(audioBlob);
    
    // Step 2: Generate AI response (placeholder - will integrate with Edge Function)
    const aiResponse = `Thank you for sharing "${transcription.text.slice(0, 30)}...". Let me reflect on that.`;
    
    // Step 3: Synthesize AI response
    const synthesis = await handleSynthesis(aiResponse);
    
    return {
      transcription,
      aiResponse,
      synthesis
    };
  }, [handleTranscription, handleSynthesis]);

  return {
    // State
    isTranscribing,
    isSynthesizing,
    transcriptionResult,
    synthesisResult,
    
    // Actions
    handleTranscription,
    handleSynthesis,
    processConversationTurn,
    
    // Computed
    isProcessing: isTranscribing || isSynthesizing,
  };
};

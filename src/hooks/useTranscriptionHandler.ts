
import { useCallback } from 'react';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { useAuth } from '@/components/SimpleAuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ConversationData, AudioQuality, NetworkStatus, ConversationDataState } from '@/types/audioRecording';

interface UseTranscriptionHandlerProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  onFallbackToText?: () => void;
  conversationData: ConversationDataState | null;
  setConversationData: (data: ConversationData | null) => void;
  setIsTranscribing: (value: boolean) => void;
  setTranscriptionProgress: (value: number | ((prev: number) => number)) => void;
  setThinkingProgress: (value: number | ((prev: number) => number)) => void;
  setAiResponse: (response: string) => void;
  goToSpeaking: () => void;
  goIdle: () => void;
}

export const useTranscriptionHandler = ({
  onTranscriptionComplete,
  onAIResponse,
  onFallbackToText,
  conversationData,
  setConversationData,
  setIsTranscribing,
  setTranscriptionProgress,
  setThinkingProgress,
  setAiResponse,
  goToSpeaking,
  goIdle,
}: UseTranscriptionHandlerProps) => {
  const { transcribeAudio } = useAudioTranscription();
  const { user } = useAuth();

  const generateAIResponse = useCallback(async (transcript: string): Promise<string> => {
    // Enhanced input validation
    if (!transcript?.trim()) {
      console.warn('No transcript provided for AI response generation');
      return "I didn't catch what you said. Could you please try again?";
    }

    if (!user?.id) {
      console.error('User not authenticated for AI response');
      return "I'm having trouble with authentication. Please try refreshing the page.";
    }

    console.log('Generating AI response for transcript:', transcript);
    
    try {
      const conversationHistory = [
        { role: 'user' as const, content: transcript, timestamp: new Date().toISOString() }
      ];
      
      const personaState = {
        preferred_name: 'friend',
        tone_preferences: 'warm and supportive',
        reflection_focus: 'personal growth'
      };

      const { data, error } = await supabase.functions.invoke('generate-lumi-response', {
        body: {
          user_id: user.id,
          conversation_history: conversationHistory,
          persona_state: personaState
        }
      });

      if (error) {
        console.error('AI response error:', error);
        return "I'm experiencing some technical difficulties right now. How are you feeling today?";
      }

      // Validate response
      if (!data?.response || typeof data.response !== 'string' || !data.response.trim()) {
        console.error('Invalid AI response format');
        return "I'm having trouble forming a response right now. What's on your mind?";
      }

      return data.response.trim();
    } catch (error) {
      console.error('AI response generation failed:', error);
      return "I'm experiencing some technical issues, but I'm here to listen. What would you like to talk about?";
    }
  }, [user?.id]);

  const handleTranscription = useCallback(async (
    audioBlob: Blob,
    duration: number,
    audioQuality: AudioQuality,
    networkStatus: NetworkStatus,
    isSessionActive: boolean,
    updateActivity: () => void,
    retryCount: number,
    setRetryCount: (fn: (prev: number) => number) => void
  ) => {
    // Comprehensive input validation with safe fallbacks
    if (!audioBlob) {
      console.error('No audio blob provided for transcription');
      goIdle();
      return;
    }

    if (audioBlob.size === 0) {
      console.error('Audio blob is empty');
      goIdle();
      return;
    }

    console.log('Starting transcription process:', {
      audioSize: audioBlob.size,
      duration,
      audioQuality: audioQuality?.level || 'unknown',
      networkStatus: networkStatus?.online ?? 'unknown',
      retryCount
    });

    setIsTranscribing(true);
    setTranscriptionProgress(0);
    
    try {
      // Update activity if session is active (with error handling)
      if (isSessionActive) {
        try {
          updateActivity();
        } catch (error) {
          console.error('Failed to update activity:', error);
          // Continue anyway
        }
      }

      // Attempt transcription with comprehensive error handling
      let transcript: string;
      try {
        transcript = await transcribeAudio(
          audioBlob,
          retryCount,
          setTranscriptionProgress,
          onFallbackToText
        );
      } catch (transcriptionError) {
        console.error('Transcription failed:', transcriptionError);
        
        const errorMessage = transcriptionError instanceof Error ? transcriptionError.message : 'Unknown error';
        
        if (errorMessage === 'FALLBACK_TO_TEXT') {
          setIsTranscribing(false);
          goIdle();
          return;
        }
        
        if (errorMessage === 'RETRY_NEEDED' && retryCount < 1) {
          console.log('Retrying transcription...');
          setRetryCount(prev => prev + 1);
          setIsTranscribing(false);
          
          setTimeout(() => {
            handleTranscription(
              audioBlob,
              duration,
              audioQuality,
              networkStatus,
              isSessionActive,
              updateActivity,
              retryCount + 1,
              setRetryCount
            );
          }, 1000);
          return;
        }
        
        // Use safe fallback transcript
        transcript = "I'm having trouble hearing you clearly. Could you please try again?";
      }

      // Validate transcript one more time
      if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
        transcript = "I didn't catch that. Could you try speaking again?";
      }

      console.log('Using transcript:', transcript);
      
      // Store conversation data safely
      try {
        const newConversationData: ConversationData = {
          id: crypto.randomUUID(),
          transcript,
          ai_response: '',
          audioBlob,
          duration: duration || 0,
          quality: audioQuality || { level: 'good', signalToNoise: 0.8 },
          timestamp: new Date(),
          retryCount: retryCount || 0
        };
        setConversationData(newConversationData);
      } catch (error) {
        console.error('Failed to store conversation data:', error);
        // Continue anyway
      }

      // Notify completion safely
      if (onTranscriptionComplete) {
        try {
          onTranscriptionComplete(transcript);
        } catch (error) {
          console.error('Error in transcription completion callback:', error);
        }
      }

      // Generate AI response with comprehensive error handling
      setIsTranscribing(false);
      setThinkingProgress(0);
      console.log('Generating AI response...');
      
      const thinkingInterval = setInterval(() => {
        setThinkingProgress(prev => Math.min(prev + 5, 90));
      }, 100);

      try {
        const aiResponse = await generateAIResponse(transcript);
        clearInterval(thinkingInterval);
        setThinkingProgress(100);
        
        console.log('AI response generated:', aiResponse);
        setAiResponse(aiResponse);
        
        if (onAIResponse) {
          try {
            onAIResponse(aiResponse);
          } catch (error) {
            console.error('Error in AI response callback:', error);
          }
        }
        
        goToSpeaking();
      } catch (aiError) {
        clearInterval(thinkingInterval);
        console.error('AI response generation failed:', aiError);
        
        // Use safe fallback response
        const fallbackResponse = "I'm here and ready to listen. What's on your mind today?";
        setAiResponse(fallbackResponse);
        
        if (onAIResponse) {
          try {
            onAIResponse(fallbackResponse);
          } catch (error) {
            console.error('Error in AI response fallback callback:', error);
          }
        }
        
        goToSpeaking();
      }

    } catch (error) {
      console.error('Critical transcription handler error:', error);
      setIsTranscribing(false);
      
      // Provide safe fallback and continue conversation
      const safeResponse = "I'm experiencing some technical difficulties, but I'm here with you. How are you feeling?";
      setAiResponse(safeResponse);
      
      if (onAIResponse) {
        try {
          onAIResponse(safeResponse);
        } catch (error) {
          console.error('Error in critical fallback callback:', error);
        }
      }
      
      goToSpeaking();
    }
  }, [
    transcribeAudio,
    generateAIResponse,
    onTranscriptionComplete,
    onAIResponse,
    onFallbackToText,
    setConversationData,
    setIsTranscribing,
    setTranscriptionProgress,
    setThinkingProgress,
    setAiResponse,
    goToSpeaking,
    goIdle
  ]);

  return { handleTranscription };
};

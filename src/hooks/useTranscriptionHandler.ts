
import { useCallback } from 'react';
import { useAudioTranscription } from '@/hooks/useAudioTranscription';
import { useAuth } from '@/components/SimpleAuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { ConversationData, AudioQuality, NetworkStatus } from '@/types/audioRecording';

interface UseTranscriptionHandlerProps {
  onTranscriptionComplete?: (transcript: string) => void;
  onAIResponse?: (response: string) => void;
  onFallbackToText?: () => void;
  conversationData: ConversationData | null;
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
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    console.log('Generating AI response for transcript:', transcript);
    
    // Mock conversation history for now - this would come from conversation context
    const conversationHistory = [
      { role: 'user' as const, content: transcript, timestamp: new Date().toISOString() }
    ];
    
    // Mock persona state - this would come from user's persona
    const personaState = {
      preferred_name: 'friend',
      tone_preferences: 'warm and supportive',
      reflection_focus: 'personal growth'
    };

    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        const { data, error } = await supabase.functions.invoke('generate-lumi-response', {
          body: {
            user_id: user.id,
            conversation_history: conversationHistory,
            persona_state: personaState
          }
        });

        if (error) {
          console.error('AI response error:', error);
          
          // Handle specific error types
          if (error.message?.includes('AI_SERVICE_UNAVAILABLE')) {
            throw new Error('AI_SERVICE_UNAVAILABLE');
          } else if (error.message?.includes('OPENAI_RATE_LIMIT')) {
            if (retryCount < maxRetries) {
              retryCount++;
              const delay = Math.pow(2, retryCount) * 1000;
              console.log(`AI rate limited, retrying in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            } else {
              throw new Error('AI_RATE_LIMIT_EXCEEDED');
            }
          } else if (error.message?.includes('OPENAI_SERVER_ERROR')) {
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`AI server error, retrying attempt ${retryCount + 1}...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            } else {
              throw new Error('AI_SERVER_ERROR');
            }
          }
          
          throw error;
        }

        // Handle fallback responses
        if (data?.fallback) {
          console.log('Received fallback AI response:', data.response);
        }

        return data?.response || "i'm here with you. what would you like to explore together?";
      } catch (error) {
        console.error(`AI response attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount >= maxRetries) {
          // Return polite fallback message
          const fallbackResponses = [
            "i'm having a brief moment of technical difficulty, but i'm still here. what's on your mind?",
            "my AI processing is taking a pause, but let's continue our conversation. how are you feeling?",
            "i'm experiencing some technical hiccups, but i'd love to hear what you'd like to talk about.",
            "while my systems catch up, i'm curious - what would you like to explore together?",
            "there's a small technical issue on my end, but i'm present with you. what's in your heart today?"
          ];
          return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }
        
        retryCount++;
      }
    }
    
    // This should never be reached, but just in case
    return "i'm here and ready to listen. what would you like to share?";
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
    if (!audioBlob) {
      console.error('No audio blob provided for transcription');
      goIdle();
      return;
    }

    console.log('Starting transcription process:', {
      audioSize: audioBlob.size,
      duration,
      audioQuality,
      networkStatus,
      retryCount
    });

    setIsTranscribing(true);
    setTranscriptionProgress(0);
    
    try {
      // Update activity if session is active
      if (isSessionActive) {
        updateActivity();
      }

      // Attempt transcription with retry logic
      const transcript = await transcribeAudio(
        audioBlob,
        retryCount,
        setTranscriptionProgress,
        onFallbackToText
      );

      console.log('Transcription successful:', transcript);
      
      // Store conversation data
      const newConversationData: ConversationData = {
        transcript,
        audioBlob,
        duration,
        quality: audioQuality,
        timestamp: new Date(),
        retryCount
      };
      setConversationData(newConversationData);

      // Notify completion
      onTranscriptionComplete?.(transcript);

      // Generate AI response
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
        onAIResponse?.(aiResponse);
        goToSpeaking();
      } catch (aiError) {
        clearInterval(thinkingInterval);
        console.error('AI response generation failed:', aiError);
        
        // Use fallback response but continue conversation
        const fallbackResponse = "i'm experiencing some technical difficulties, but i'm here with you. what would you like to talk about?";
        setAiResponse(fallbackResponse);
        onAIResponse?.(fallbackResponse);
        goToSpeaking();
      }

    } catch (error) {
      console.error('Transcription failed:', error);
      setIsTranscribing(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage === 'RETRY_NEEDED' && retryCount < 1) {
        console.log('Retrying transcription...');
        setRetryCount(prev => prev + 1);
        
        // Retry with a delay
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
      
      if (errorMessage === 'FALLBACK_TO_TEXT') {
        console.log('Falling back to text input due to transcription failure');
        if (onFallbackToText) {
          onFallbackToText();
        }
      }
      
      goIdle();
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

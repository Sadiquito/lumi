
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

  // Enhanced error-safe logging
  const logTranscriptionEvent = useCallback(async (
    event: 'attempt' | 'success' | 'failure' | 'fallback',
    details: any
  ) => {
    try {
      console.log(`[Transcription ${event.toUpperCase()}]`, {
        timestamp: new Date().toISOString(),
        userId: user?.id,
        ...details
      });

      // Track in system health for admin monitoring with error handling
      await supabase.functions.invoke('track-system-health', {
        body: {
          metric_name: `transcription_${event}`,
          metric_value: event === 'success' ? 1 : 0,
          metadata: {
            user_id: user?.id,
            ...details
          }
        }
      });
    } catch (error) {
      console.error('Failed to log transcription event:', error);
      // Don't throw - logging failures shouldn't break the flow
    }
  }, [user?.id]);

  // Enhanced error-safe AI response logging
  const logAIResponseEvent = useCallback(async (
    event: 'attempt' | 'success' | 'failure' | 'fallback',
    details: any
  ) => {
    try {
      console.log(`[AI Response ${event.toUpperCase()}]`, {
        timestamp: new Date().toISOString(),
        userId: user?.id,
        ...details
      });

      await supabase.functions.invoke('track-system-health', {
        body: {
          metric_name: `ai_response_${event}`,
          metric_value: event === 'success' ? 1 : 0,
          metadata: {
            user_id: user?.id,
            ...details
          }
        }
      });
    } catch (error) {
      console.error('Failed to log AI response event:', error);
      // Don't throw - logging failures shouldn't break the flow
    }
  }, [user?.id]);

  const generateAIResponse = useCallback(async (transcript: string): Promise<string> => {
    // Input validation
    if (!transcript?.trim()) {
      throw new Error('No transcript provided for AI response generation');
    }

    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    await logAIResponseEvent('attempt', { transcript_length: transcript.length });

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
        const startTime = Date.now();
        
        const { data, error } = await supabase.functions.invoke('generate-lumi-response', {
          body: {
            user_id: user.id,
            conversation_history: conversationHistory,
            persona_state: personaState
          }
        });

        const responseTime = Date.now() - startTime;

        if (error) {
          console.error('AI response error:', error);
          
          await logAIResponseEvent('failure', {
            error: error.message,
            retry_count: retryCount,
            response_time: responseTime
          });
          
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

        // Validate response
        if (!data?.response || typeof data.response !== 'string') {
          throw new Error('Invalid AI response format');
        }

        // Handle fallback responses
        if (data?.fallback) {
          console.log('Received fallback AI response:', data.response);
          await logAIResponseEvent('fallback', {
            response_time: responseTime,
            retry_count: retryCount
          });
        } else {
          await logAIResponseEvent('success', {
            response_time: responseTime,
            retry_count: retryCount,
            response_length: data.response.length
          });
        }

        return data.response;
      } catch (error) {
        console.error(`AI response attempt ${retryCount + 1} failed:`, error);
        
        if (retryCount >= maxRetries) {
          await logAIResponseEvent('fallback', {
            final_error: error.toString(),
            retry_count: retryCount
          });
          
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
  }, [user?.id, logAIResponseEvent]);

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
    // Comprehensive input validation
    if (!audioBlob) {
      console.error('No audio blob provided for transcription');
      await logTranscriptionEvent('failure', { error: 'No audio blob provided' });
      goIdle();
      return;
    }

    if (audioBlob.size === 0) {
      console.error('Audio blob is empty');
      await logTranscriptionEvent('failure', { error: 'Audio blob is empty' });
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

    await logTranscriptionEvent('attempt', {
      audio_size: audioBlob.size,
      duration,
      audio_quality: audioQuality.level,
      network_status: networkStatus.online,
      retry_count: retryCount
    });

    setIsTranscribing(true);
    setTranscriptionProgress(0);
    
    try {
      // Update activity if session is active
      if (isSessionActive) {
        try {
          updateActivity();
        } catch (error) {
          console.error('Failed to update activity:', error);
          // Don't fail the transcription for this
        }
      }

      // Attempt transcription with retry logic and comprehensive error handling
      const transcript = await transcribeAudio(
        audioBlob,
        retryCount,
        setTranscriptionProgress,
        onFallbackToText
      );

      // Validate transcript
      if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
        throw new Error('Empty or invalid transcript received');
      }

      console.log('Transcription successful:', transcript);
      
      await logTranscriptionEvent('success', {
        transcript_length: transcript.length,
        retry_count: retryCount,
        audio_size: audioBlob.size
      });
      
      // Store conversation data with all required fields and error handling
      try {
        const newConversationData: ConversationData = {
          id: crypto.randomUUID(),
          transcript,
          ai_response: '', // Will be filled later
          audioBlob,
          duration,
          quality: audioQuality,
          timestamp: new Date(),
          retryCount
        };
        setConversationData(newConversationData);
      } catch (error) {
        console.error('Failed to store conversation data:', error);
        // Continue anyway - this shouldn't break the flow
      }

      // Notify completion
      if (onTranscriptionComplete) {
        try {
          onTranscriptionComplete(transcript);
        } catch (error) {
          console.error('Error in transcription completion callback:', error);
          // Continue anyway
        }
      }

      // Generate AI response with comprehensive error handling
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
        
        // Use fallback response but continue conversation
        const fallbackResponse = "i'm experiencing some technical difficulties, but i'm here with you. what would you like to talk about?";
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
      console.error('Transcription failed:', error);
      setIsTranscribing(false);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await logTranscriptionEvent('failure', {
        error: errorMessage,
        retry_count: retryCount,
        audio_size: audioBlob.size
      });
      
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
      
      if (errorMessage === 'FALLBACK_TO_TEXT' || retryCount >= 1) {
        console.log('Falling back to text input due to transcription failure');
        await logTranscriptionEvent('fallback', {
          error: errorMessage,
          retry_count: retryCount
        });
        
        if (onFallbackToText) {
          try {
            onFallbackToText();
          } catch (error) {
            console.error('Error in fallback callback:', error);
          }
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
    goIdle,
    logTranscriptionEvent
  ]);

  return { handleTranscription };
};

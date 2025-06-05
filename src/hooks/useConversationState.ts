
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ConversationState,
  ConversationStateData,
  ConversationMessage,
  ConversationContext,
  ConversationConfig,
  StateTransition,
} from '@/types/conversation';
import {
  DEFAULT_CONVERSATION_CONFIG,
  canTransition,
  validateStateTransition,
  shouldTimeout,
  getNextStateOnTimeout,
  calculateStateDuration,
  generateSessionId,
} from '@/utils/conversationStateUtils';

interface UseConversationStateProps {
  config?: Partial<ConversationConfig>;
  onStateChange?: (state: ConversationState, previous: ConversationState | null) => void;
  onTimeout?: (state: ConversationState) => void;
  onError?: (error: string) => void;
}

export const useConversationState = ({
  config: customConfig,
  onStateChange,
  onTimeout,
  onError,
}: UseConversationStateProps = {}) => {
  const config = { ...DEFAULT_CONVERSATION_CONFIG, ...customConfig };
  
  const [stateData, setStateData] = useState<ConversationStateData>({
    currentState: 'idle',
    previousState: null,
    stateStartTime: new Date(),
    canTransitionTo: ['listening'],
    timeoutMs: config.timeouts.idle,
  });

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [stateHistory, setStateHistory] = useState<StateTransition[]>([]);
  const [context, setContext] = useState<ConversationContext>({
    sessionId: generateSessionId(),
    startTime: new Date(),
    lastActivity: new Date(),
    messageCount: 0,
    totalDuration: 0,
    topics: [],
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const stateStartTimeRef = useRef<Date>(new Date());

  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Setup timeout handling
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const timeoutMs = config.timeouts[stateData.currentState];
    if (timeoutMs > 0 && config.autoTransitions) {
      timeoutRef.current = setTimeout(() => {
        if (shouldTimeout(stateData.currentState, stateStartTimeRef.current, config)) {
          const nextState = getNextStateOnTimeout(stateData.currentState);
          console.log(`State timeout: ${stateData.currentState} -> ${nextState}`);
          
          if (onTimeout) {
            onTimeout(stateData.currentState);
          }
          
          transitionTo(nextState, 'timeout');
        }
      }, timeoutMs);
    }
  }, [stateData.currentState, config]);

  const transitionTo = useCallback((
    newState: ConversationState,
    reason?: string
  ): boolean => {
    const validation = validateStateTransition(stateData.currentState, newState);
    
    if (!validation.valid) {
      const error = validation.error || 'Invalid state transition';
      console.error(error);
      if (onError) {
        onError(error);
      }
      setStateData(prev => ({ ...prev, error }));
      return false;
    }

    const now = new Date();
    const duration = calculateStateDuration(stateStartTimeRef.current, now);
    
    // Record state transition
    const transition: StateTransition = {
      from: stateData.currentState,
      to: newState,
      timestamp: now,
      duration,
      reason,
    };

    setStateHistory(prev => [...prev.slice(-19), transition]); // Keep last 20 transitions
    
    // Update state data
    setStateData(prev => ({
      currentState: newState,
      previousState: prev.currentState,
      stateStartTime: now,
      canTransitionTo: canTransition(newState, 'idle') ? ['idle'] : 
                      canTransition(newState, 'listening') ? ['listening'] :
                      canTransition(newState, 'processing') ? ['processing'] :
                      canTransition(newState, 'speaking') ? ['speaking'] : [],
      timeoutMs: config.timeouts[newState],
      error: undefined,
    }));

    // Update context
    setContext(prev => ({
      ...prev,
      lastActivity: now,
      totalDuration: prev.totalDuration + duration,
    }));

    stateStartTimeRef.current = now;

    if (onStateChange) {
      onStateChange(newState, stateData.currentState);
    }

    console.log(`State transition: ${stateData.currentState} -> ${newState}${reason ? ` (${reason})` : ''}`);
    return true;
  }, [stateData.currentState, config, onStateChange, onError]);

  const startListening = useCallback(() => {
    return transitionTo('listening', 'user_initiated');
  }, [transitionTo]);

  const startProcessing = useCallback(() => {
    return transitionTo('processing', 'audio_received');
  }, [transitionTo]);

  const startSpeaking = useCallback(() => {
    return transitionTo('speaking', 'response_ready');
  }, [transitionTo]);

  const goIdle = useCallback(() => {
    return transitionTo('idle', 'manual');
  }, [transitionTo]);

  const addMessage = useCallback((message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Trim to max history size
      return updated.slice(-config.maxHistorySize);
    });

    setContext(prev => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      lastActivity: new Date(),
    }));

    return newMessage;
  }, [config.maxHistorySize]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    setStateHistory([]);
    setContext(prev => ({
      ...prev,
      sessionId: generateSessionId(),
      startTime: new Date(),
      lastActivity: new Date(),
      messageCount: 0,
      totalDuration: 0,
      topics: [],
    }));
  }, []);

  const getStateDuration = useCallback((): number => {
    return calculateStateDuration(stateStartTimeRef.current, new Date());
  }, []);

  const isTransitionAllowed = useCallback((toState: ConversationState): boolean => {
    return canTransition(stateData.currentState, toState);
  }, [stateData.currentState]);

  return {
    // Current state
    state: stateData.currentState,
    stateData,
    
    // History and context
    messages,
    stateHistory,
    context,
    
    // State transitions
    transitionTo,
    startListening,
    startProcessing,
    startSpeaking,
    goIdle,
    
    // Message management
    addMessage,
    clearHistory,
    
    // Utilities
    getStateDuration,
    isTransitionAllowed,
    
    // Status checks
    isIdle: stateData.currentState === 'idle',
    isListening: stateData.currentState === 'listening',
    isProcessing: stateData.currentState === 'processing',
    isSpeaking: stateData.currentState === 'speaking',
  };
};

export default useConversationState;

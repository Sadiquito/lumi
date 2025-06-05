
import { useState, useCallback } from 'react';
import { ConversationState } from '@/types/conversationState';

interface ResponseTimeEstimation {
  estimatedMs: number;
  category: 'quick' | 'thoughtful' | 'deep';
  confidence: number;
}

export const useResponseTimeEstimation = () => {
  const [currentEstimation, setCurrentEstimation] = useState<ResponseTimeEstimation | null>(null);

  const estimateResponseTime = useCallback((
    userInput: string,
    conversationContext?: {
      messageCount: number;
      lastResponseTime?: number;
      complexity?: 'simple' | 'moderate' | 'complex';
    }
  ): ResponseTimeEstimation => {
    // Base estimation factors
    let baseTime = 5000; // 5 seconds base
    let confidence = 0.8;

    // Adjust based on input length
    const inputLength = userInput.length;
    if (inputLength > 200) {
      baseTime += 2000; // +2s for longer inputs
    } else if (inputLength < 50) {
      baseTime -= 1000; // -1s for shorter inputs
    }

    // Adjust based on conversation context
    if (conversationContext) {
      // First message tends to take longer
      if (conversationContext.messageCount === 0) {
        baseTime += 3000;
      }

      // Use historical data if available
      if (conversationContext.lastResponseTime) {
        const historicalWeight = 0.3;
        baseTime = baseTime * (1 - historicalWeight) + 
                  conversationContext.lastResponseTime * historicalWeight;
      }

      // Adjust for complexity
      if (conversationContext.complexity === 'complex') {
        baseTime += 3000;
        confidence -= 0.1;
      } else if (conversationContext.complexity === 'simple') {
        baseTime -= 1000;
        confidence += 0.1;
      }
    }

    // Determine category
    let category: 'quick' | 'thoughtful' | 'deep';
    if (baseTime <= 3000) {
      category = 'quick';
    } else if (baseTime <= 8000) {
      category = 'thoughtful';
    } else {
      category = 'deep';
    }

    // Ensure reasonable bounds
    baseTime = Math.max(2000, Math.min(15000, baseTime));
    confidence = Math.max(0.5, Math.min(1.0, confidence));

    const estimation = {
      estimatedMs: Math.round(baseTime),
      category,
      confidence: Math.round(confidence * 100) / 100
    };

    setCurrentEstimation(estimation);
    return estimation;
  }, []);

  const clearEstimation = useCallback(() => {
    setCurrentEstimation(null);
  }, []);

  return {
    currentEstimation,
    estimateResponseTime,
    clearEstimation,
  };
};

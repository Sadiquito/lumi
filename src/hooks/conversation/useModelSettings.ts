
import { useState, useEffect } from 'react';
import { ModelOption, VoiceOption } from '@/types/conversation';

export const useModelSettings = () => {
  const [selectedModel, setSelectedModel] = useState<ModelOption>(() => {
    // Load from localStorage or default to gpt-4o-mini
    const saved = localStorage.getItem('lumi-selected-model');
    return (saved as ModelOption) || 'gpt-4o-mini';
  });
  
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(() => {
    // Load from localStorage or default to alloy
    const saved = localStorage.getItem('lumi-selected-voice');
    return (saved as VoiceOption) || 'alloy';
  });

  // Save model selection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lumi-selected-model', selectedModel);
  }, [selectedModel]);

  // Save voice selection to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lumi-selected-voice', selectedVoice);
  }, [selectedVoice]);

  return {
    selectedModel,
    setSelectedModel,
    selectedVoice,
    setSelectedVoice
  };
};

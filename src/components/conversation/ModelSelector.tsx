
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModelOption } from '@/hooks/useRealtimeConversation';

interface ModelSelectorProps {
  selectedModel: ModelOption;
  onModelChange: (model: ModelOption) => void;
  disabled: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled
}) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="text-sm font-cinzel text-white/80">AI Model</label>
      <Select 
        value={selectedModel} 
        onValueChange={onModelChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-64 bg-white/10 border-white/20 text-white backdrop-blur-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-white/20 text-white">
          <SelectItem value="gpt-4o-mini" className="focus:bg-white/10 focus:text-white">
            GPT-4o Mini
          </SelectItem>
          <SelectItem value="gpt-4o" className="focus:bg-white/10 focus:text-white">
            GPT-4o
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

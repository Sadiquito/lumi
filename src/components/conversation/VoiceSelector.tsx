import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VoiceOption } from '@/types/conversation';

interface VoiceSelectorProps {
  selectedVoice: VoiceOption;
  onVoiceChange: (voice: VoiceOption) => void;
  disabled: boolean;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceChange,
  disabled
}) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <label className="text-sm font-cinzel text-white/80">Voice</label>
      <Select 
        value={selectedVoice} 
        onValueChange={onVoiceChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-64 bg-white/10 border-white/20 text-white backdrop-blur-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-white/20 text-white">
          <SelectItem value="alloy" className="focus:bg-white/10 focus:text-white">
            Alloy (Balanced)
          </SelectItem>
          <SelectItem value="ash" className="focus:bg-white/10 focus:text-white">
            Ash (Authoritative)
          </SelectItem>
          <SelectItem value="ballad" className="focus:bg-white/10 focus:text-white">
            Ballad (Soothing)
          </SelectItem>
          <SelectItem value="coral" className="focus:bg-white/10 focus:text-white">
            Coral (Warm)
          </SelectItem>
          <SelectItem value="echo" className="focus:bg-white/10 focus:text-white">
            Echo (Deep)
          </SelectItem>
          <SelectItem value="sage" className="focus:bg-white/10 focus:text-white">
            Sage (Wise)
          </SelectItem>
          <SelectItem value="shimmer" className="focus:bg-white/10 focus:text-white">
            Shimmer (Bright)
          </SelectItem>
          <SelectItem value="verse" className="focus:bg-white/10 focus:text-white">
            Verse (Expressive)
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

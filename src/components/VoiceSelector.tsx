
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { ELEVENLABS_VOICES } from '@/utils/elevenLabsConfig';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  disabled?: boolean;
  className?: string;
}

const voiceOptions = [
  { id: ELEVENLABS_VOICES.aria, name: 'Aria', description: 'Warm, natural voice' },
  { id: ELEVENLABS_VOICES.sarah, name: 'Sarah', description: 'Clear, professional' },
  { id: ELEVENLABS_VOICES.charlotte, name: 'Charlotte', description: 'Gentle, calming' },
  { id: ELEVENLABS_VOICES.alice, name: 'Alice', description: 'Friendly, expressive' },
];

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onVoiceChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <label className="text-sm text-white/80">Voice Style</label>
        <Badge variant="outline" className="border-lumi-aquamarine/30 text-lumi-aquamarine text-xs">
          <Crown className="w-3 h-3 mr-1" />
          Premium
        </Badge>
      </div>
      <Select value={selectedVoice} onValueChange={onVoiceChange} disabled={disabled}>
        <SelectTrigger className="bg-lumi-charcoal/50 border-lumi-sunset-coral/20 text-white">
          <SelectValue placeholder="Choose voice style" />
        </SelectTrigger>
        <SelectContent className="bg-lumi-charcoal border-lumi-sunset-coral/20">
          {voiceOptions.map((voice) => (
            <SelectItem 
              key={voice.id} 
              value={voice.id}
              className="text-white hover:bg-lumi-sunset-coral/20 focus:bg-lumi-sunset-coral/20"
            >
              <div>
                <div className="font-medium">{voice.name}</div>
                <div className="text-xs text-white/60">{voice.description}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VoiceSelector;

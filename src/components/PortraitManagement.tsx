
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { usePsychologicalPortrait } from '@/hooks/usePsychologicalPortrait';
import PsychologicalPortrait from './PsychologicalPortrait';
import PortraitTimeline from './PortraitTimeline';
import PortraitControls from './PortraitControls';
import PortraitPrivacyInfo from './PortraitPrivacyInfo';

const PortraitManagement: React.FC = () => {
  const { portrait, isLoading } = usePsychologicalPortrait();
  const [isVisible, setIsVisible] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  // Mock timeline data - in real implementation, this would come from the database
  const mockTimeline = portrait ? [
    {
      date: portrait.updated_at || new Date().toISOString(),
      version: 1,
      summary: "initial psychological understanding established through early conversations",
      keyInsights: [
        "communication style reflects thoughtful processing",
        "values authenticity and genuine connection",
        "shows resilience in navigating life transitions"
      ],
      growth_areas: ["self-compassion", "boundary setting", "stress management"]
    }
  ] : [];

  if (isLoading) {
    return (
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy & Controls */}
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <Shield className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            portrait privacy & controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PortraitControls
            portrait={portrait}
            isVisible={isVisible}
            showTimeline={showTimeline}
            onVisibilityToggle={() => setIsVisible(!isVisible)}
            onTimelineToggle={() => setShowTimeline(!showTimeline)}
          />
          <PortraitPrivacyInfo />
        </CardContent>
      </Card>

      {/* Portrait Display */}
      {isVisible && (
        <PsychologicalPortrait variant="full" />
      )}

      {/* Timeline Display */}
      {showTimeline && (
        <PortraitTimeline timeline={mockTimeline} />
      )}
    </div>
  );
};

export default PortraitManagement;

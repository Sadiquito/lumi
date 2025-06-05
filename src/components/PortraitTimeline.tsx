
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineEntry {
  date: string;
  version: number;
  summary: string;
  keyInsights: string[];
  growth_areas?: string[];
}

interface PortraitTimelineProps {
  timeline: TimelineEntry[];
  className?: string;
}

const PortraitTimeline: React.FC<PortraitTimelineProps> = ({ timeline, className }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/70 mb-2">no evolution yet</p>
            <p className="text-white/50 text-sm">
              your psychological portrait will develop through our conversations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-lumi-charcoal/80 border-lumi-sunset-coral/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-lumi-aquamarine" />
          understanding evolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.map((entry, index) => (
            <div key={index} className="relative">
              {index !== timeline.length - 1 && (
                <div className="absolute left-4 top-8 w-0.5 h-full bg-lumi-sunset-coral/20" />
              )}
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-lumi-sunset-coral/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-lumi-sunset-coral" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(entry.date), 'MMM dd, yyyy')}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-lumi-aquamarine/30 text-lumi-aquamarine">
                      v{entry.version}
                    </Badge>
                  </div>
                  
                  <p className="text-white/80 text-sm mb-3 leading-relaxed">
                    {entry.summary}
                  </p>
                  
                  {entry.keyInsights && entry.keyInsights.length > 0 && (
                    <div className="mb-3">
                      <p className="text-white/60 text-xs mb-2">key insights discovered:</p>
                      <ul className="space-y-1">
                        {entry.keyInsights.map((insight, i) => (
                          <li key={i} className="text-white/70 text-xs flex items-start">
                            <div className="w-1 h-1 rounded-full bg-lumi-aquamarine mt-2 mr-2 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {entry.growth_areas && entry.growth_areas.length > 0 && (
                    <div>
                      <p className="text-white/60 text-xs mb-2">growth areas identified:</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.growth_areas.map((area, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-lumi-sunset-coral/30 text-lumi-sunset-coral">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortraitTimeline;

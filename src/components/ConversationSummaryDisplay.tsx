
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Clock, 
  MessageCircle, 
  Heart, 
  Lightbulb, 
  Download,
  Share
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationSummaryDisplayProps {
  summary: {
    id: string;
    conversation_id: string;
    summary_text: string;
    key_insights: string[];
    emotional_tone: string;
    duration_minutes: number;
    message_count: number;
    created_at: string;
  };
  onExport?: () => void;
  onShare?: () => void;
  className?: string;
}

const getToneConfig = (tone: string) => {
  switch (tone.toLowerCase()) {
    case 'positive':
    case 'uplifting':
    case 'joyful':
      return { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    case 'reflective':
    case 'thoughtful':
    case 'contemplative':
      return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    case 'concerned':
    case 'worried':
    case 'anxious':
      return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
    case 'supportive':
    case 'caring':
    case 'empathetic':
      return { color: 'text-lumi-aquamarine', bg: 'bg-lumi-aquamarine/10', border: 'border-lumi-aquamarine/20' };
    default:
      return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
  }
};

const ConversationSummaryDisplay: React.FC<ConversationSummaryDisplayProps> = ({
  summary,
  onExport,
  onShare,
  className
}) => {
  const toneConfig = getToneConfig(summary.emotional_tone);
  const createdDate = new Date(summary.created_at);

  return (
    <Card className={cn(
      'w-full bg-lumi-charcoal/60 border-lumi-sunset-coral/20',
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            Conversation Summary
          </CardTitle>
          <div className="flex items-center space-x-2">
            {onExport && (
              <Button
                onClick={onExport}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            )}
            {onShare && (
              <Button
                onClick={onShare}
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Share className="w-3 h-3 mr-1" />
                Share
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-white/60">
          Generated on {format(createdDate, 'EEEE, MMMM dd, yyyy \'at\' h:mm a')}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-white/60">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">{summary.duration_minutes} minutes</span>
          </div>
          <div className="flex items-center text-white/60">
            <MessageCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{summary.message_count} messages</span>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Emotional Tone */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-lumi-sunset-coral" />
            <span className="text-sm font-medium text-white">Emotional Tone</span>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs',
              toneConfig.color,
              toneConfig.bg,
              toneConfig.border
            )}
          >
            {summary.emotional_tone}
          </Badge>
        </div>

        <Separator className="bg-white/10" />

        {/* Summary Text */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-lumi-aquamarine" />
            <span className="text-sm font-medium text-white">Summary</span>
          </div>
          <div className="bg-lumi-deep-space/30 p-4 rounded-lg border border-white/10">
            <p className="text-sm text-white/80 leading-relaxed">
              {summary.summary_text}
            </p>
          </div>
        </div>

        {/* Key Insights */}
        {summary.key_insights && summary.key_insights.length > 0 && (
          <>
            <Separator className="bg-white/10" />
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Key Insights</span>
              </div>
              <div className="space-y-2">
                {summary.key_insights.map((insight, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-lumi-deep-space/20 rounded-lg border border-white/5"
                  >
                    <div className="w-2 h-2 bg-lumi-aquamarine rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-white/70 leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Archive Notice */}
        <div className="mt-6 p-3 bg-lumi-aquamarine/10 border border-lumi-aquamarine/20 rounded-lg">
          <p className="text-xs text-lumi-aquamarine">
            📁 This conversation has been archived with insights. You can revisit it anytime in your conversation history.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationSummaryDisplay;

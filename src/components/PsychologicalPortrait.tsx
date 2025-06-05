
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Clock, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { usePsychologicalPortrait } from '@/hooks/usePsychologicalPortrait';
import { cn } from '@/lib/utils';

interface PsychologicalPortraitProps {
  className?: string;
  variant?: 'full' | 'summary';
}

const PsychologicalPortrait: React.FC<PsychologicalPortraitProps> = ({
  className,
  variant = 'full'
}) => {
  const { portrait, isLoading, error } = usePsychologicalPortrait();

  if (isLoading) {
    return (
      <Card className={cn("bg-lumi-charcoal/80 border-lumi-sunset-coral/20", className)}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("bg-lumi-charcoal/80 border-red-500/20", className)}>
        <CardContent className="pt-6">
          <div className="flex items-center text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            failed to load psychological insights
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!portrait) {
    return (
      <Card className={cn("bg-lumi-charcoal/80 border-lumi-sunset-coral/20", className)}>
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <Brain className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            psychological insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/70 mb-2">no insights yet</p>
            <p className="text-white/50 text-sm">
              lumi will develop a deeper understanding of you through our conversations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const updatedDate = portrait.updated_at ? new Date(portrait.updated_at) : null;

  if (variant === 'summary') {
    return (
      <Card className={cn("bg-lumi-charcoal/80 border-lumi-sunset-coral/20", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center">
              <Brain className="w-4 h-4 mr-2 text-lumi-aquamarine" />
              psychological insights
            </CardTitle>
            {updatedDate && (
              <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                <Clock className="w-3 h-3 mr-1" />
                {format(updatedDate, 'MMM dd')}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
            {portrait.psychological_portrait_text}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-lumi-charcoal/80 border-lumi-sunset-coral/20", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center">
            <Brain className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            lumi's understanding of you
          </CardTitle>
          {updatedDate && (
            <Badge variant="outline" className="border-white/20 text-white/60">
              <Clock className="w-4 h-4 mr-1" />
              updated {format(updatedDate, 'MMM dd, yyyy')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose prose-invert max-w-none">
          <div className="text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
            {portrait.psychological_portrait_text}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-lumi-sunset-coral/10">
          <p className="text-white/50 text-xs">
            this understanding evolves with each conversation, helping lumi provide more personalized support
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PsychologicalPortrait;


import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Sparkles, Coffee, Sun, Moon } from 'lucide-react';
import { useDailyGreeting } from '@/hooks/useDailyGreeting';
import { useDailyAdvice } from '@/hooks/useDailyAdvice';
import { useAuth } from '@/components/SimpleAuthProvider';
import TextToSpeech from './TextToSpeech';

interface DailyGreetingAutoStartProps {
  onGreetingComplete?: () => void;
  onStartConversation?: () => void;
  autoPlay?: boolean;
}

const DailyGreetingAutoStart: React.FC<DailyGreetingAutoStartProps> = ({
  onGreetingComplete,
  onStartConversation,
  autoPlay = false
}) => {
  const { user } = useAuth();
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  
  const {
    todaysGreeting,
    isLoading: isLoadingGreeting,
    isGenerating,
    shouldGenerateGreeting,
    generateGreeting,
    getTimeOfDay
  } = useDailyGreeting();

  const { privacySettings } = useDailyAdvice();

  // Auto-generate greeting if needed
  useEffect(() => {
    if (shouldGenerateGreeting && user?.id && !isGenerating) {
      generateGreeting();
    }
  }, [shouldGenerateGreeting, user?.id, isGenerating, generateGreeting]);

  // Check if greeting was already played today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastPlayedDate = localStorage.getItem(`greeting-played-${user?.id}`);
    setHasPlayedToday(lastPlayedDate === today);
  }, [user?.id]);

  const handleGreetingComplete = () => {
    if (user?.id) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`greeting-played-${user?.id}`, today);
      setHasPlayedToday(true);
    }
    onGreetingComplete?.();
  };

  const getTimeIcon = () => {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case 'morning': return Sun;
      case 'afternoon': return Sun;
      case 'evening': return Moon;
      default: return Coffee;
    }
  };

  const TimeIcon = getTimeIcon();

  if (isLoadingGreeting || isGenerating) {
    return (
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-aquamarine/20">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-lumi-aquamarine animate-pulse" />
            <span className="text-white/70">preparing your daily greeting...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!todaysGreeting) {
    return null;
  }

  const shouldAutoPlay = autoPlay && !hasPlayedToday;

  return (
    <Card className="bg-gradient-to-r from-lumi-charcoal/80 to-lumi-deep-space/80 backdrop-blur-sm border-lumi-aquamarine/20 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TimeIcon className="w-6 h-6 text-lumi-aquamarine" />
              <h3 className="text-white text-lg font-medium">
                good {getTimeOfDay()}, {user?.user_metadata?.name || 'there'}
              </h3>
            </div>
            
            <div className="flex items-center space-x-2">
              {todaysGreeting.metadata?.hasAdvice && (
                <span className="text-xs text-lumi-sunset-coral bg-lumi-sunset-coral/20 px-2 py-1 rounded">
                  wisdom included
                </span>
              )}
              <span className="text-xs text-white/50">
                {todaysGreeting.personalization_level} personalization
              </span>
            </div>
          </div>

          <div className="bg-lumi-deep-space/40 rounded-lg p-4 border border-lumi-aquamarine/10">
            <p className="text-white/90 leading-relaxed">
              {todaysGreeting.greeting_text}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TextToSpeech
                text={todaysGreeting.greeting_text}
                variant="compact"
                autoPlay={shouldAutoPlay}
              />
              
              {shouldAutoPlay && !hasPlayedToday && (
                <span className="text-xs text-lumi-aquamarine">
                  playing automatically...
                </span>
              )}
            </div>

            <Button
              onClick={() => {
                handleGreetingComplete();
                onStartConversation?.();
              }}
              className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
              size="sm"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              start chatting
            </Button>
          </div>

          {todaysGreeting.metadata?.conversationCount !== undefined && (
            <div className="text-xs text-white/50 pt-2 border-t border-lumi-aquamarine/10">
              {todaysGreeting.metadata.conversationCount > 0 
                ? `we've had ${todaysGreeting.metadata.conversationCount} conversation${todaysGreeting.metadata.conversationCount !== 1 ? 's' : ''} together`
                : "this would be our first conversation together"
              }
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyGreetingAutoStart;

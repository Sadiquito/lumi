
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Zap, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import { supabase } from '@/integrations/supabase/client';
import FeatureGate from '@/components/FeatureGate';
import DailyAdviceGenerator from '@/components/DailyAdviceGenerator';
import PsychologicalPortrait from '@/components/PsychologicalPortrait';
import ConversationFeatureGate from '@/components/ConversationFeatureGate';
import TTSFeatureGate from '@/components/TTSFeatureGate';

const JournalSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isTrialExpired, daysRemaining, hasPremiumAccess } = useTrialStatus();

  // Fetch user's daily advice
  const { data: dailyAdvice, isLoading: adviceLoading } = useQuery({
    queryKey: ['daily-advice', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('daily_advice')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      {/* Psychological Portrait with Privacy Integration */}
      <FeatureGate feature="ai_insights">
        <PsychologicalPortrait variant="summary" />
      </FeatureGate>

      {/* Daily Advice Generator with Privacy Awareness */}
      <FeatureGate feature="ai_advice">
        <DailyAdviceGenerator />
      </FeatureGate>

      {/* Daily Wisdom */}
      <FeatureGate feature="ai_advice">
        <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white text-lg">daily wisdom</CardTitle>
          </CardHeader>
          <CardContent>
            {adviceLoading ? (
              <div className="text-white/70 text-center py-4">
                loading wisdom...
              </div>
            ) : dailyAdvice && dailyAdvice.length > 0 ? (
              <div className="space-y-4">
                {dailyAdvice.slice(0, 1).map((advice) => (
                  <div key={advice.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-white/80 text-sm leading-relaxed flex-1">
                        {advice.advice_text}
                      </p>
                      <TTSFeatureGate 
                        text={advice.advice_text}
                        variant="icon-only"
                        showAlert={false}
                      />
                    </div>
                    <p className="text-white/50 text-xs">
                      {format(parseISO(advice.created_at), 'MMM dd')}
                    </p>
                  </div>
                ))}
                <ConversationFeatureGate feature="advanced_history">
                  <div className="pt-2 border-t border-lumi-sunset-coral/10">
                    <Button 
                      variant="link" 
                      className="text-lumi-aquamarine hover:text-lumi-aquamarine/80 p-0 h-auto text-sm"
                    >
                      view all wisdom
                    </Button>
                  </div>
                </ConversationFeatureGate>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-white/70 text-sm">
                  your personalized wisdom will appear here after our conversations
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </FeatureGate>

      {/* Subscription Status Card */}
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <Crown className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            subscription status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasPremiumAccess && !isTrialExpired ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">status:</span>
                <span className="text-lumi-aquamarine font-medium text-sm">Premium Active</span>
              </div>
              <p className="text-white/60 text-xs">
                enjoying all lumi features ✨
              </p>
            </div>
          ) : isTrialExpired ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">status:</span>
                <span className="text-red-400 font-medium text-sm">Trial Expired</span>
              </div>
              <Button
                onClick={() => navigate('/subscription')}
                className="w-full bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-1" />
                upgrade to continue
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-sm">trial:</span>
                <span className="text-lumi-sunset-coral font-medium text-sm">
                  {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                </span>
              </div>
              <Button
                onClick={() => navigate('/subscription')}
                variant="outline"
                className="w-full border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
                size="sm"
              >
                <Zap className="w-4 h-4 mr-1" />
                upgrade early
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Quick View */}
      <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <User className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            your profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">name:</span>
            <span className="text-white font-medium">{userName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">email:</span>
            <span className="text-white text-sm">{user?.email}</span>
          </div>
          {preferences?.phone_number && (
            <div className="flex items-center justify-between">
              <span className="text-white/80 text-sm">phone:</span>
              <span className="text-white text-sm">{preferences.phone_number}</span>
            </div>
          )}
          <Button
            onClick={() => navigate('/settings')}
            variant="outline"
            size="sm"
            className="w-full mt-3 border-lumi-sunset-coral/20 text-white hover:bg-lumi-sunset-coral/10"
          >
            edit preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JournalSidebar;

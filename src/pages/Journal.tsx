
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageCircle, 
  Clock, 
  Mic, 
  Square, 
  Volume2, 
  VolumeX, 
  Send,
  Lightbulb,
  Calendar,
  TrendingUp,
  FileText,
  Sparkles,
  Brain,
  User,
  Settings,
  Crown,
  AlertTriangle,
  Zap,
  Phone
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTrialStatus } from '@/hooks/useTrialStatus';
import ConversationFeatureGate from '@/components/ConversationFeatureGate';
import ConversationStateIndicator from '@/components/ConversationStateIndicator';
import AudioRecordingFeature from '@/components/AudioRecordingFeature';
import FeatureGate from '@/components/FeatureGate';
import DailyAdviceGenerator from '@/components/DailyAdviceGenerator';
import PortraitManagement from '@/components/PortraitManagement';
import PsychologicalPortrait from '@/components/PsychologicalPortrait';
import TrialCountdown from '@/components/TrialCountdown';
import TTSFeatureGate from '@/components/TTSFeatureGate';
import TTSTestingPanel from '@/components/TTSTestingPanel';

const Journal = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isTrialExpired, daysRemaining, hasPremiumAccess } = useTrialStatus();

  // Fetch user's conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* Header with Trial Status */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 bg-lumi-sunset-coral">
            <AvatarFallback className="bg-lumi-sunset-coral text-white font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-medium text-white">welcome back, {userName}</h1>
            <p className="text-white/70 text-sm">ready for today's reflection?</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <TrialCountdown variant="compact" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="text-white hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/subscription')}
            className="text-white hover:bg-white/10"
          >
            <Crown className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-white hover:bg-white/10 text-sm"
          >
            sign out
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 pb-8">
        {/* Trial Status Alert */}
        {isTrialExpired && (
          <Alert className="mb-6 bg-red-500/20 border-red-500/30 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-white">
              <div className="flex items-center justify-between">
                <span>Your 7-day free trial has expired. Upgrade now to continue using Lumi's premium features.</span>
                <Button
                  onClick={() => navigate('/subscription')}
                  className="ml-4 bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
                  size="sm"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade Now
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {daysRemaining <= 3 && !isTrialExpired && (
          <Alert className="mb-6 bg-lumi-sunset-coral/20 border-lumi-sunset-coral/30 backdrop-blur-sm">
            <Clock className="h-4 w-4 text-lumi-sunset-coral" />
            <AlertDescription className="text-white">
              <div className="flex items-center justify-between">
                <span>Your trial expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Don't lose access to your journaling progress!</span>
                <Button
                  onClick={() => navigate('/subscription')}
                  variant="outline"
                  className="ml-4 border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
                  size="sm"
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Secure Access
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Call Status */}
            <FeatureGate feature="premium">
              <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-lumi-aquamarine" />
                    today's check-in
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {preferences ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">scheduled for:</span>
                        <span className="text-white font-medium flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {preferences.call_time || '07:30'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">method:</span>
                        <span className="text-white font-medium">
                          {preferences.preferred_channel === 'whatsapp' ? 'WhatsApp' : 'Phone call'}
                        </span>
                      </div>
                      <div className="mt-4 p-3 bg-lumi-deep-space/30 rounded-lg">
                        <p className="text-white/70 text-sm">
                          i'll reach out to you today at {preferences.call_time}. 
                          looking forward to our conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-white/70 mb-3">
                        let's set up your daily check-in time
                      </p>
                      <Button
                        onClick={() => navigate('/settings')}
                        className="bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
                      >
                        configure settings
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FeatureGate>

            {/* Audio Recording - Always Available */}
            <AudioRecordingFeature
              onTranscriptionComplete={(transcript) => {
                console.log('Transcription received:', transcript);
              }}
            />

            {/* Recent Conversations */}
            <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2 text-lumi-aquamarine" />
                  recent conversations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conversationsLoading ? (
                  <div className="text-white/70 text-center py-4">
                    loading your conversations...
                  </div>
                ) : conversations && conversations.length > 0 ? (
                  <div className="space-y-4">
                    {conversations.map((conversation) => (
                      <div 
                        key={conversation.id} 
                        className="p-4 bg-lumi-deep-space/30 rounded-lg border border-lumi-sunset-coral/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lumi-aquamarine text-sm font-medium">
                            conversation
                          </span>
                          <span className="text-white/60 text-xs flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(parseISO(conversation.created_at), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm line-clamp-2">
                          {conversation.transcript || 'No transcript available'}
                        </p>
                        {conversation.ai_response && (
                          <ConversationFeatureGate feature="ai_insights">
                            <div className="mt-2 pt-2 border-t border-lumi-sunset-coral/10">
                              <div className="flex items-start justify-between">
                                <p className="text-white/70 text-xs flex-1">
                                  <span className="text-lumi-aquamarine">lumi's insight:</span> {conversation.ai_response}
                                </p>
                                <TTSFeatureGate 
                                  text={conversation.ai_response}
                                  variant="icon-only"
                                  showAlert={false}
                                />
                              </div>
                            </div>
                          </ConversationFeatureGate>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/70 mb-2">no conversations yet</p>
                    <p className="text-white/50 text-sm">
                      your first daily check-in will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TTS Enhanced Demo - Updated for trial integration */}
            <TTSFeatureGate 
              text="Welcome to Lumi's enhanced voice feature! This showcases our premium audio experience with voice selection, progress tracking, and advanced controls. Upgrade to unlock unlimited voice responses."
              variant="enhanced"
              showAlert={true} 
              showVoiceSelector={true}
            />

            {/* TTS Testing Panel - Development/Admin Feature */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8">
                <TTSTestingPanel />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Psychological Portrait */}
            <FeatureGate feature="ai_insights">
              <PsychologicalPortrait variant="summary" />
            </FeatureGate>

            {/* Daily Advice Generator */}
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
        </div>
      </div>
    </div>
  );
};

export default Journal;

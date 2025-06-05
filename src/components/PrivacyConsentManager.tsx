
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  Brain, 
  Clock, 
  Info, 
  Settings,
  FileText,
  Trash2
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettings {
  psychological_analysis_consent: boolean;
  data_retention_days: number;
  personalization_level: 'minimal' | 'moderate' | 'full';
  share_insights_for_improvement: boolean;
  auto_delete_conversations: boolean;
}

const PrivacyConsentManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [localSettings, setLocalSettings] = useState<PrivacySettings>({
    psychological_analysis_consent: false,
    data_retention_days: 365,
    personalization_level: 'moderate',
    share_insights_for_improvement: false,
    auto_delete_conversations: false,
  });

  // Fetch current privacy settings
  const { data: privacySettings, isLoading } = useQuery({
    queryKey: ['privacy-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('privacy_settings')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data?.privacy_settings || localSettings;
    },
    enabled: !!user?.id,
  });

  // Update privacy settings
  const updatePrivacySettings = useMutation({
    mutationFn: async (newSettings: Partial<PrivacySettings>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          privacy_settings: { ...localSettings, ...newSettings },
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings', user?.id] });
      toast({
        title: "Privacy Settings Updated",
        description: "Your privacy preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Unable to save privacy settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (privacySettings) {
      setLocalSettings(privacySettings);
    }
  }, [privacySettings]);

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updatePrivacySettings.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
            <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consent Overview */}
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <Shield className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            privacy & consent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-lumi-deep-space/30 border-lumi-aquamarine/20">
            <Info className="h-4 w-4 text-lumi-aquamarine" />
            <AlertDescription className="text-white/80">
              lumi uses psychological analysis to provide personalized guidance. you have full control 
              over how your data is used and stored. all insights remain private and are never shared 
              with third parties.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-white text-sm font-medium">psychological analysis</span>
                <p className="text-white/60 text-xs">
                  allow lumi to analyze conversations for personalized insights
                </p>
              </div>
              <Switch
                checked={localSettings.psychological_analysis_consent}
                onCheckedChange={(checked) => 
                  handleSettingChange('psychological_analysis_consent', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-white text-sm font-medium">improve lumi's understanding</span>
                <p className="text-white/60 text-xs">
                  anonymously share insights to help improve lumi for everyone
                </p>
              </div>
              <Switch
                checked={localSettings.share_insights_for_improvement}
                onCheckedChange={(checked) => 
                  handleSettingChange('share_insights_for_improvement', checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-white text-sm font-medium">auto-delete old conversations</span>
                <p className="text-white/60 text-xs">
                  automatically remove conversations after retention period
                </p>
              </div>
              <Switch
                checked={localSettings.auto_delete_conversations}
                onCheckedChange={(checked) => 
                  handleSettingChange('auto_delete_conversations', checked)
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personalization Level */}
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <Brain className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            personalization level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                level: 'minimal' as const,
                title: 'minimal personalization',
                description: 'basic conversation memory only',
                badge: 'privacy focused'
              },
              {
                level: 'moderate' as const,
                title: 'moderate personalization',
                description: 'conversation patterns and general insights',
                badge: 'recommended'
              },
              {
                level: 'full' as const,
                title: 'full personalization',
                description: 'deep psychological understanding and growth tracking',
                badge: 'comprehensive'
              }
            ].map((option) => (
              <div
                key={option.level}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  localSettings.personalization_level === option.level
                    ? 'border-lumi-aquamarine bg-lumi-aquamarine/10'
                    : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => handleSettingChange('personalization_level', option.level)}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-medium">{option.title}</span>
                      <Badge variant="outline" className="text-xs border-white/20 text-white/60">
                        {option.badge}
                      </Badge>
                    </div>
                    <p className="text-white/60 text-xs">{option.description}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    localSettings.personalization_level === option.level
                      ? 'border-lumi-aquamarine bg-lumi-aquamarine'
                      : 'border-white/40'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <Clock className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            data retention
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">current retention period:</span>
            <span className="text-lumi-aquamarine font-medium">
              {localSettings.data_retention_days} days
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {[90, 365, 730].map((days) => (
              <Button
                key={days}
                variant={localSettings.data_retention_days === days ? "default" : "outline"}
                size="sm"
                onClick={() => handleSettingChange('data_retention_days', days)}
                className={
                  localSettings.data_retention_days === days
                    ? "bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
                    : "border-white/20 text-white/70 hover:bg-white/10"
                }
              >
                {days === 90 ? '3 months' : days === 365 ? '1 year' : '2 years'}
              </Button>
            ))}
          </div>
          
          <p className="text-white/60 text-xs">
            conversations and insights older than this period will be automatically deleted
          </p>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center">
            <FileText className="w-5 h-5 mr-2 text-lumi-aquamarine" />
            your data rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="text-white/70 text-sm space-y-2">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-lumi-aquamarine mt-2 mr-2 flex-shrink-0" />
              <span>you can export all your data at any time from the portrait management page</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-lumi-aquamarine mt-2 mr-2 flex-shrink-0" />
              <span>you can delete your psychological portrait and start fresh whenever you want</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-lumi-aquamarine mt-2 mr-2 flex-shrink-0" />
              <span>all data is encrypted and stored securely - never shared with third parties</span>
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-lumi-aquamarine mt-2 mr-2 flex-shrink-0" />
              <span>you can withdraw consent for analysis at any time without losing access to lumi</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyConsentManager;

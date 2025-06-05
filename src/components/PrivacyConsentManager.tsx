
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Database, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const PrivacyConsentManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user privacy settings
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('privacy_settings')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const privacySettings = preferences?.privacy_settings || {
    psychological_analysis_consent: true,
    personalization_level: 'moderate',
    data_retention_days: 365
  };

  // Update privacy settings mutation
  const updatePrivacySettings = useMutation({
    mutationFn: async (newSettings: any) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          privacy_settings: newSettings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] });
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

  const handleConsentChange = (consent: boolean) => {
    const newSettings = {
      ...privacySettings,
      psychological_analysis_consent: consent
    };
    updatePrivacySettings.mutate(newSettings);
  };

  const handlePersonalizationChange = (level: string) => {
    const newSettings = {
      ...privacySettings,
      personalization_level: level
    };
    updatePrivacySettings.mutate(newSettings);
  };

  const handleRetentionChange = (days: number) => {
    const newSettings = {
      ...privacySettings,
      data_retention_days: days
    };
    updatePrivacySettings.mutate(newSettings);
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
    <Card className="bg-lumi-charcoal/80 border-lumi-sunset-coral/20">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center">
          <Shield className="w-5 h-5 mr-2 text-lumi-aquamarine" />
          privacy & personalization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Psychological Analysis Consent */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-white font-medium">psychological insights</h4>
              <p className="text-white/60 text-sm">allow lumi to analyze conversations for deeper understanding</p>
            </div>
            <Switch
              checked={privacySettings.psychological_analysis_consent}
              onCheckedChange={handleConsentChange}
              disabled={updatePrivacySettings.isPending}
            />
          </div>
          <Badge 
            variant="outline" 
            className={`text-xs ${privacySettings.psychological_analysis_consent 
              ? 'border-green-500/30 text-green-400' 
              : 'border-red-500/30 text-red-400'}`}
          >
            {privacySettings.psychological_analysis_consent ? 'enabled' : 'disabled'}
          </Badge>
        </div>

        {/* Personalization Level */}
        {privacySettings.psychological_analysis_consent && (
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-white font-medium flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                personalization level
              </h4>
              <p className="text-white/60 text-sm">choose how much personal data informs lumi's responses</p>
            </div>
            <Select 
              value={privacySettings.personalization_level} 
              onValueChange={handlePersonalizationChange}
              disabled={updatePrivacySettings.isPending}
            >
              <SelectTrigger className="bg-lumi-deep-space/30 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-lumi-charcoal border-white/20">
                <SelectItem value="minimal" className="text-white">
                  minimal - general advice only
                </SelectItem>
                <SelectItem value="moderate" className="text-white">
                  moderate - themed insights
                </SelectItem>
                <SelectItem value="full" className="text-white">
                  full - complete personalization
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Data Retention */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="text-white font-medium flex items-center">
              <Database className="w-4 h-4 mr-2" />
              data retention
            </h4>
            <p className="text-white/60 text-sm">how long to keep your psychological profile</p>
          </div>
          <Select 
            value={privacySettings.data_retention_days.toString()} 
            onValueChange={(value) => handleRetentionChange(parseInt(value))}
            disabled={updatePrivacySettings.isPending}
          >
            <SelectTrigger className="bg-lumi-deep-space/30 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-lumi-charcoal border-white/20">
              <SelectItem value="30" className="text-white">30 days</SelectItem>
              <SelectItem value="90" className="text-white">90 days</SelectItem>
              <SelectItem value="365" className="text-white">1 year</SelectItem>
              <SelectItem value="999999" className="text-white">indefinitely</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Privacy Summary */}
        <div className="pt-4 border-t border-lumi-sunset-coral/10">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-4 h-4 text-lumi-aquamarine" />
            <span className="text-white/80 text-sm">your data is protected</span>
          </div>
          <ul className="text-white/60 text-xs space-y-1">
            <li>• all data is encrypted and stored securely</li>
            <li>• you can modify these settings anytime</li>
            <li>• deleting your account removes all data permanently</li>
            <li>• we never share your personal insights with third parties</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacyConsentManager;

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Phone, Clock, Settings as SettingsIcon, Crown, AlertTriangle, CheckCircle, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import ProfileManagement from "@/components/ProfileManagement";
import TrialCountdown from "@/components/TrialCountdown";
import FeatureGate from "@/components/FeatureGate";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Slider } from "@/components/ui/slider";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isTrialExpired, daysRemaining, hasPremiumAccess, subscriptionStatus } = useTrialStatus();
  
  const [formData, setFormData] = useState({
    phone_number: '',
    call_time: '07:30',
    preferred_channel: 'phone' as 'phone' | 'whatsapp',
    retry_enabled: true,
    max_retries: 3,
  });

  // Fetch user preferences
  const { data: preferences, isLoading } = useQuery({
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

  // Update form data when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormData({
        phone_number: preferences.phone_number || '',
        call_time: preferences.call_time || '07:30',
        preferred_channel: (preferences.preferred_channel as 'phone' | 'whatsapp') || 'phone',
        retry_enabled: preferences.retry_enabled ?? true,
        max_retries: preferences.max_retries || 3,
      });
    }
  }, [preferences]);

  // Save preferences mutation
  const savePreferences = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          phone_number: data.phone_number,
          call_time: data.call_time,
          preferred_channel: data.preferred_channel,
          retry_enabled: data.retry_enabled,
          max_retries: data.max_retries,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
    onError: (error) => {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number if provided
    if (formData.phone_number && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number.",
        variant: "destructive",
      });
      return;
    }

    savePreferences.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-cosmic-gradient">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/journal')}
            className="text-white hover:bg-white/10 mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-title font-medium text-white tracking-wide">settings</h1>
        </div>
        <TrialCountdown variant="full" />
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8 space-y-8">
        {/* Subscription Status Banner */}
        {isTrialExpired ? (
          <Alert className="bg-red-500/20 border-red-500/30 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Trial Expired:</strong> Upgrade now to restore access to all premium features including daily calls and AI insights.
                </div>
                <Button
                  onClick={() => navigate('/subscription')}
                  className="ml-4 bg-lumi-aquamarine hover:bg-lumi-aquamarine/90 text-white"
                  size="sm"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ) : hasPremiumAccess ? (
          <Alert className="bg-lumi-aquamarine/20 border-lumi-aquamarine/30 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-lumi-aquamarine" />
            <AlertDescription className="text-white">
              <strong>Premium Active:</strong> You have full access to all Lumi features. Enjoy your unlimited daily calls and AI-powered insights!
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-lumi-sunset-coral/20 border-lumi-sunset-coral/30 backdrop-blur-sm">
            <Clock className="h-4 w-4 text-lumi-sunset-coral" />
            <AlertDescription className="text-white">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Trial Active:</strong> {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining in your free trial.
                </div>
                <Button
                  onClick={() => navigate('/subscription')}
                  variant="outline"
                  className="ml-4 border-lumi-aquamarine text-lumi-aquamarine hover:bg-lumi-aquamarine/10"
                  size="sm"
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Management Section */}
        <div>
          <h2 className="text-xl font-title text-white mb-4 tracking-wide">account & profile</h2>
          <ProfileManagement />
        </div>

        <Separator className="bg-lumi-sunset-coral/10" />

        {/* Subscription Status Card */}
        <div>
          <h2 className="text-xl font-title text-white mb-4 tracking-wide">subscription details</h2>
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center font-title">
                <Crown className="w-5 h-5 mr-2 text-lumi-aquamarine" />
                current plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/60 text-sm">Status</Label>
                  <p className="text-white font-medium">
                    {subscriptionStatus === 'active' ? 'Premium' : 
                     isTrialExpired ? 'Expired Trial' : 'Free Trial'}
                  </p>
                </div>
                {!hasPremiumAccess && (
                  <div>
                    <Label className="text-white/60 text-sm">Days Remaining</Label>
                    <p className="text-white font-medium">
                      {isTrialExpired ? '0' : daysRemaining}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <Button
                  onClick={() => navigate('/subscription')}
                  className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white"
                >
                  {hasPremiumAccess ? 'Manage Subscription' : 'Upgrade to Premium'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-lumi-sunset-coral/10" />

        {/* TTS Settings - Premium Feature */}
        <div>
          <h2 className="text-xl font-title text-white mb-4 tracking-wide">voice responses</h2>
          
          <FeatureGate feature="tts">
            <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center font-title">
                  <Volume2 className="w-5 h-5 mr-2 text-lumi-aquamarine" />
                  text-to-speech configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/80 font-sans">voice selection</Label>
                  <Select defaultValue="alloy">
                    <SelectTrigger className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-lumi-deep-space border-lumi-sunset-coral/20">
                      <SelectItem value="alloy" className="text-white focus:bg-lumi-sunset-coral/20">Alloy (Default)</SelectItem>
                      <SelectItem value="echo" className="text-white focus:bg-lumi-sunset-coral/20">Echo</SelectItem>
                      <SelectItem value="fable" className="text-white focus:bg-lumi-sunset-coral/20">Fable</SelectItem>
                      <SelectItem value="onyx" className="text-white focus:bg-lumi-sunset-coral/20">Onyx</SelectItem>
                      <SelectItem value="nova" className="text-white focus:bg-lumi-sunset-coral/20">Nova</SelectItem>
                      <SelectItem value="shimmer" className="text-white focus:bg-lumi-sunset-coral/20">Shimmer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-white/80 font-sans">enable voice responses</Label>
                    <p className="text-white/60 text-sm font-sans">
                      receive spoken responses during conversations
                    </p>
                  </div>
                  <Switch
                    defaultChecked={true}
                    className="data-[state=checked]:bg-lumi-aquamarine"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 font-sans">speaking speed</Label>
                  <Slider
                    defaultValue={[1]}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/60">
                    <span>0.5x (slower)</span>
                    <span>1.0x (normal)</span>
                    <span>2.0x (faster)</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 text-lg font-medium rounded-xl font-sans"
                >
                  save voice settings
                </Button>
              </CardContent>
            </Card>
          </FeatureGate>
        </div>

        <Separator className="bg-lumi-sunset-coral/10" />

        {/* Call Preferences */}
        <div>
          <h2 className="text-xl font-title text-white mb-4 tracking-wide">daily call preferences</h2>
          
          <FeatureGate feature="premium">
            <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center font-title">
                  <SettingsIcon className="w-5 h-5 mr-2 text-lumi-aquamarine" />
                  call configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white/80 font-sans">phone number</Label>
                    <Input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                      placeholder="+1 (555) 123-4567"
                    />
                    <p className="text-white/60 text-sm font-sans">
                      required for receiving daily calls
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-sans">preferred call time</Label>
                    <Input
                      type="time"
                      value={formData.call_time}
                      onChange={(e) => handleInputChange('call_time', e.target.value)}
                      className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 font-sans">communication method</Label>
                    <Select
                      value={formData.preferred_channel}
                      onValueChange={(value: 'phone' | 'whatsapp') => handleInputChange('preferred_channel', value)}
                    >
                      <SelectTrigger className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-lumi-deep-space border-lumi-sunset-coral/20">
                        <SelectItem value="phone" className="text-white focus:bg-lumi-sunset-coral/20">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            phone call
                          </div>
                        </SelectItem>
                        <SelectItem value="whatsapp" className="text-white focus:bg-lumi-sunset-coral/20">
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            whatsapp
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-white/80 font-sans">enable call retries</Label>
                        <p className="text-white/60 text-sm font-sans">
                          retry missed calls automatically
                        </p>
                      </div>
                      <Switch
                        checked={formData.retry_enabled}
                        onCheckedChange={(checked) => handleInputChange('retry_enabled', checked)}
                        className="data-[state=checked]:bg-lumi-aquamarine"
                      />
                    </div>

                    {formData.retry_enabled && (
                      <div className="space-y-2">
                        <Label className="text-white/80 font-sans">maximum retry attempts</Label>
                        <Select
                          value={formData.max_retries.toString()}
                          onValueChange={(value) => handleInputChange('max_retries', parseInt(value))}
                        >
                          <SelectTrigger className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-lumi-deep-space border-lumi-sunset-coral/20">
                            <SelectItem value="1" className="text-white focus:bg-lumi-sunset-coral/20">1 retry</SelectItem>
                            <SelectItem value="2" className="text-white focus:bg-lumi-sunset-coral/20">2 retries</SelectItem>
                            <SelectItem value="3" className="text-white focus:bg-lumi-sunset-coral/20">3 retries</SelectItem>
                            <SelectItem value="5" className="text-white focus:bg-lumi-sunset-coral/20">5 retries</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 text-lg font-medium rounded-xl font-sans"
                    disabled={savePreferences.isPending || isLoading}
                  >
                    {savePreferences.isPending ? "saving..." : "save preferences"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </FeatureGate>
        </div>
      </div>
    </div>
  );
};

export default Settings;

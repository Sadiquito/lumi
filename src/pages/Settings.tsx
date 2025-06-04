import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Phone, Clock, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import ProfileManagement from "@/components/ProfileManagement";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
      <div className="flex items-center p-4 md:p-6">
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

      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8 space-y-8">
        {/* Profile Management Section */}
        <div>
          <h2 className="text-xl font-title text-white mb-4 tracking-wide">account & profile</h2>
          <ProfileManagement />
        </div>

        <Separator className="bg-lumi-sunset-coral/10" />

        {/* Call Preferences */}
        <div>
          <h2 className="text-xl font-title text-white mb-4 tracking-wide">daily call preferences</h2>
          
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
        </div>
      </div>
    </div>
  );
};

export default Settings;


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Phone, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserPreferences {
  id?: string;
  call_time: string;
  phone_number: string;
  preferred_channel: 'phone' | 'whatsapp';
  retry_enabled: boolean;
  max_retries: number;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user preferences
  const { data: preferences, isLoading, error } = useQuery({
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

  // State for form data
  const [formData, setFormData] = useState<UserPreferences>({
    call_time: "07:30",
    phone_number: "",
    preferred_channel: "phone",
    retry_enabled: true,
    max_retries: 3,
  });

  // Update form data when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormData({
        call_time: preferences.call_time || "07:30",
        phone_number: preferences.phone_number || "",
        preferred_channel: preferences.preferred_channel || "phone",
        retry_enabled: preferences.retry_enabled ?? true,
        max_retries: preferences.max_retries || 3,
      });
    }
  }, [preferences]);

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (data: UserPreferences) => {
      if (!user?.id) throw new Error('User not authenticated');

      const payload = {
        user_id: user.id,
        call_time: data.call_time,
        phone_number: data.phone_number,
        preferred_channel: data.preferred_channel,
        retry_enabled: data.retry_enabled,
        max_retries: data.max_retries,
      };

      if (preferences?.id) {
        // Update existing preferences
        const { data: result, error } = await supabase
          .from('user_preferences')
          .update(payload)
          .eq('id', preferences.id)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      } else {
        // Create new preferences
        const { data: result, error } = await supabase
          .from('user_preferences')
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
      toast({
        title: "Preferences saved",
        description: "Your settings have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    savePreferencesMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cosmic-gradient">
        <div className="flex items-center p-4 md:p-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/journal')}
            className="text-white hover:bg-white/10 mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-medium text-white">when should i call you?</h1>
        </div>
        <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8">
          <div className="text-center text-white">Loading your preferences...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cosmic-gradient">
        <div className="flex items-center p-4 md:p-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/journal')}
            className="text-white hover:bg-white/10 mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-medium text-white">when should i call you?</h1>
        </div>
        <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8">
          <div className="text-center text-white">
            <p className="mb-4">Failed to load your preferences.</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-medium text-white">when should i call you?</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8">
        <div className="space-y-6">
          {/* Call Time */}
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg">your daily check-in time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">what time works best for you?</Label>
                <Input
                  type="time"
                  value={formData.call_time}
                  onChange={(e) => setFormData({ ...formData, call_time: e.target.value })}
                  className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white"
                />
                <p className="text-sm text-white/60">
                  i'll call you every day at this time. we can always adjust this later.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Phone Number */}
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg">how can i reach you?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">your phone number</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white placeholder:text-white/40"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-white/80">how would you prefer i reach out?</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="phone"
                      name="channel"
                      value="phone"
                      checked={formData.preferred_channel === "phone"}
                      onChange={(e) => setFormData({ ...formData, preferred_channel: e.target.value as 'phone' | 'whatsapp' })}
                      className="text-lumi-sunset-coral focus:ring-lumi-aquamarine"
                    />
                    <label htmlFor="phone" className="flex items-center space-x-2 text-white">
                      <Phone className="w-4 h-4" />
                      <span>phone call</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="whatsapp"
                      name="channel"
                      value="whatsapp"
                      checked={formData.preferred_channel === "whatsapp"}
                      onChange={(e) => setFormData({ ...formData, preferred_channel: e.target.value as 'phone' | 'whatsapp' })}
                      className="text-lumi-sunset-coral focus:ring-lumi-aquamarine"
                    />
                    <label htmlFor="whatsapp" className="flex items-center space-x-2 text-white">
                      <MessageSquare className="w-4 h-4" />
                      <span>whatsapp</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retry Settings */}
          <Card className="bg-lumi-charcoal/80 backdrop-blur-sm border-lumi-sunset-coral/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg">if you miss my call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-white/80">should i try calling again?</Label>
                  <p className="text-sm text-white/60">
                    life happens. i understand if you can't always answer.
                  </p>
                </div>
                <Switch
                  checked={formData.retry_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, retry_enabled: checked })}
                />
              </div>
              
              {formData.retry_enabled && (
                <div className="space-y-2">
                  <Label className="text-white/80">how many times should i retry?</Label>
                  <Select 
                    value={formData.max_retries.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, max_retries: parseInt(value) })}
                  >
                    <SelectTrigger className="border-lumi-sunset-coral/20 focus:border-lumi-aquamarine bg-lumi-deep-space/50 text-white">
                      <SelectValue placeholder="Select retry count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 time</SelectItem>
                      <SelectItem value="2">2 times</SelectItem>
                      <SelectItem value="3">3 times (recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-white/60">
                    i'll space these out throughout the day, so don't worry about being bothered.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave}
            disabled={savePreferencesMutation.isPending}
            className="w-full bg-lumi-sunset-coral hover:bg-lumi-sunset-coral/90 text-white py-3 text-lg font-medium rounded-xl"
          >
            {savePreferencesMutation.isPending ? "saving..." : "save my preferences"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

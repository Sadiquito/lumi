
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useAnalyticsTracking } from '@/components/AnalyticsProvider';
import { FeatureTracker } from '@/components/Analytics/FeatureTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User, CreditCard, Bell, Shield } from 'lucide-react';
import ProfileManagement from '@/components/ProfileManagement';
import TrialCountdown from '@/components/TrialCountdown';
import ActivityTracker from '@/components/Admin/ActivityTracker';

const Settings: React.FC = () => {
  const { user, trialStatus, updateProfile } = useAuth();
  const { trackFeatureUsage, trackTrialConversion } = useAnalyticsTracking();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.name || '');

  // Track settings page visit
  useEffect(() => {
    trackFeatureUsage('settings_page');
  }, [trackFeatureUsage]);

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    try {
      const { error } = await updateProfile({ name });
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      trackFeatureUsage('profile_update');
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubscriptionClick = () => {
    trackFeatureUsage('subscription_intent');
    trackTrialConversion('subscription');
    // Navigate to subscription page or show subscription modal
  };

  if (!user) {
    return <div>Please log in to access settings.</div>;
  }

  return (
    <ActivityTracker activityType="settings_usage">
      <div className="min-h-screen bg-gradient-to-br from-lumi-sage/10 to-lumi-aquamarine/10 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-lumi-charcoal mb-2">Settings</h1>
            <p className="text-lumi-charcoal/60">Manage your account and preferences</p>
          </div>

          {/* Trial Status */}
          {trialStatus.subscriptionStatus === 'trial' && (
            <FeatureTracker feature="trial_status_view" trackOnMount>
              <Card className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5" />
                    <span>Trial Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TrialCountdown />
                  <FeatureTracker feature="upgrade_button" trackOnClick>
                    <Button 
                      onClick={handleSubscriptionClick}
                      className="w-full mt-4 bg-lumi-aquamarine hover:bg-lumi-aquamarine/80"
                    >
                      Upgrade to Premium
                    </Button>
                  </FeatureTracker>
                </CardContent>
              </Card>
            </FeatureTracker>
          )}

          {/* Profile Settings */}
          <FeatureTracker feature="profile_settings" trackOnMount>
            <Card className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user.email || ''}
                    disabled
                    className="bg-gray-100"
                  />
                </div>

                <FeatureTracker feature="profile_save" trackOnClick>
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={isUpdating}
                    className="w-full bg-lumi-aquamarine hover:bg-lumi-aquamarine/80"
                  >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </Button>
                </FeatureTracker>
              </CardContent>
            </Card>
          </FeatureTracker>

          {/* Enhanced Profile Management */}
          <FeatureTracker feature="advanced_profile" trackOnMount>
            <ProfileManagement />
          </FeatureTracker>

          {/* Privacy Settings */}
          <FeatureTracker feature="privacy_settings" trackOnMount>
            <Card className="bg-white/60 backdrop-blur-sm border-lumi-aquamarine/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Privacy & Data</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-lumi-charcoal/60 mb-4">
                  Your privacy is important to us. We collect anonymized analytics to improve our service.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-lumi-charcoal/50">
                    • Conversation metrics (length, frequency) - aggregated only
                  </p>
                  <p className="text-xs text-lumi-charcoal/50">
                    • Feature usage analytics - no personal content stored
                  </p>
                  <p className="text-xs text-lumi-charcoal/50">
                    • System performance monitoring - technical metrics only
                  </p>
                </div>
              </CardContent>
            </Card>
          </FeatureTracker>
        </div>
      </div>
    </ActivityTracker>
  );
};

export default Settings;

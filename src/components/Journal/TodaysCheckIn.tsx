
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import FeatureGate from '@/components/FeatureGate';

const TodaysCheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  return (
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
  );
};

export default TodaysCheckIn;

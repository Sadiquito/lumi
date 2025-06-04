
import { supabase } from '@/integrations/supabase/client';

// Enhanced function to ensure trial start date is set with validation
export const ensureTrialStartDate = async (userId: string) => {
  try {
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('trial_start_date, subscription_status, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching user data:', fetchError);
      return;
    }

    // If user exists but doesn't have trial_start_date set, set it now
    if (userData && !userData.trial_start_date && userData.subscription_status === 'trial') {
      // Use created_at date if available, otherwise use current time
      const trialStartDate = userData.created_at || new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ trial_start_date: trialStartDate })
        .eq('id', userId);

      if (updateError) {
        console.error('Error setting trial start date:', updateError);
      } else {
        console.log('Trial start date set for existing user');
      }
    }
  } catch (error) {
    console.error('Error in ensureTrialStartDate:', error);
  }
};

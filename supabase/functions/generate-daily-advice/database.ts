
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { PrivacySettings, UserData } from './types.ts';

export class DatabaseService {
  private supabase;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  async checkExistingAdvice(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAdvice } = await this.supabase
      .from('daily_advice')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .maybeSingle();

    return !!existingAdvice;
  }

  async fetchUserData(userId: string, privacySettings: PrivacySettings): Promise<UserData> {
    let portraitText = null;
    let recentConversations = [];

    // Only fetch personalized data if user has consented
    if (privacySettings.hasConsent) {
      // Get user's psychological portrait based on personalization level
      if (privacySettings.personalizationLevel === 'full' || privacySettings.personalizationLevel === 'moderate') {
        const { data: portrait, error: portraitError } = await this.supabase
          .from('personalization_profiles')
          .select('psychological_portrait_text')
          .eq('user_id', userId)
          .maybeSingle();

        if (!portraitError && portrait) {
          portraitText = portrait.psychological_portrait_text;
        }
      }

      // Get recent conversations based on personalization level
      const conversationLimit = privacySettings.personalizationLevel === 'full' ? 5 : 
                                privacySettings.personalizationLevel === 'moderate' ? 3 : 1;
      
      const { data: conversations, error: conversationsError } = await this.supabase
        .from('conversations')
        .select('transcript, ai_response, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(conversationLimit);

      if (!conversationsError && conversations) {
        recentConversations = conversations;
      }
    }

    return { portraitText, recentConversations };
  }

  async storeAdvice(userId: string, advice: string, privacySettings: PrivacySettings): Promise<void> {
    const { error: insertError } = await this.supabase
      .from('daily_advice')
      .insert({
        user_id: userId,
        advice_text: advice,
        created_at: new Date().toISOString(),
        metadata: {
          personalizationLevel: privacySettings.personalizationLevel,
          hasConsent: privacySettings.hasConsent,
          privacyRespected: true,
        },
      });

    if (insertError) {
      console.error('Error storing daily advice:', insertError);
      throw new Error('Failed to store daily advice');
    }
  }
}

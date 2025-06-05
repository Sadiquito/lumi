
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GreetingContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  userName?: string;
  conversationCount: number;
  daysSinceLastChat: number;
  hasRecentAdvice: boolean;
  personalizationLevel: 'minimal' | 'moderate' | 'full';
  portraitText?: string;
  recentTopics: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if greeting already exists today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingGreeting } = await supabase
      .from('daily_greetings')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .maybeSingle();

    if (existingGreeting) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Daily greeting already generated today',
        alreadyGenerated: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Gather context for personalized greeting
    const context = await gatherGreetingContext(supabase, userId);
    
    // Generate personalized greeting
    const greetingText = await generatePersonalizedGreeting(openaiApiKey, context);
    
    // Store the greeting
    const { error: insertError } = await supabase
      .from('daily_greetings')
      .insert({
        user_id: userId,
        greeting_text: greetingText,
        time_of_day: context.timeOfDay,
        personalization_level: context.personalizationLevel,
        metadata: {
          hasAdvice: context.hasRecentAdvice,
          conversationCount: context.conversationCount,
          daysSinceLastChat: context.daysSinceLastChat,
        },
      });

    if (insertError) {
      console.error('Error storing greeting:', insertError);
      throw new Error('Failed to store greeting');
    }

    return new Response(JSON.stringify({
      success: true,
      greeting: greetingText,
      context: {
        timeOfDay: context.timeOfDay,
        personalizationLevel: context.personalizationLevel,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-daily-greeting function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function gatherGreetingContext(supabase: any, userId: string): Promise<GreetingContext> {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  
  // Get user info and preferences
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .maybeSingle();

  const { data: preferences } = await supabase
    .from('user_preferences')
    .select('privacy_settings')
    .eq('user_id', userId)
    .maybeSingle();

  const privacySettings = preferences?.privacy_settings || {};
  const personalizationLevel = privacySettings.personalization_level || 'moderate';

  // Get conversation count
  const { count: conversationCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  // Get days since last conversation
  const { data: lastConversation } = await supabase
    .from('conversations')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const daysSinceLastChat = lastConversation 
    ? Math.floor((Date.now() - new Date(lastConversation.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  // Check for recent advice
  const { data: recentAdvice } = await supabase
    .from('daily_advice')
    .select('id')
    .eq('user_id', userId)
    .gte('created_at', `${new Date().toISOString().split('T')[0]}T00:00:00.000Z`)
    .maybeSingle();

  // Get psychological portrait if permission given
  let portraitText = null;
  if (privacySettings.psychological_analysis_consent && personalizationLevel !== 'minimal') {
    const { data: portrait } = await supabase
      .from('personalization_profiles')
      .select('psychological_portrait_text')
      .eq('user_id', userId)
      .maybeSingle();
    
    portraitText = portrait?.psychological_portrait_text;
  }

  // Get recent conversation topics
  const { data: recentConversations } = await supabase
    .from('conversations')
    .select('transcript')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);

  const recentTopics = recentConversations?.map(c => 
    c.transcript.slice(0, 100) + (c.transcript.length > 100 ? '...' : '')
  ) || [];

  return {
    timeOfDay,
    userName: userProfile?.name,
    conversationCount: conversationCount || 0,
    daysSinceLastChat,
    hasRecentAdvice: !!recentAdvice,
    personalizationLevel,
    portraitText,
    recentTopics,
  };
}

async function generatePersonalizedGreeting(apiKey: string, context: GreetingContext): Promise<string> {
  const systemPrompt = `You are Lumi, a warm, empathetic AI companion. Generate a personalized daily greeting that initiates conversation.

Your personality:
- Warm, caring, and genuine
- Use lowercase, conversational tone
- Gently encouraging but never pushy
- See the whole person beyond any single moment

Context:
- Time: ${context.timeOfDay}
- User: ${context.userName || 'friend'}
- Conversations together: ${context.conversationCount}
- Days since last chat: ${context.daysSinceLastChat}
- Has daily advice: ${context.hasRecentAdvice}
- Personalization: ${context.personalizationLevel}

Guidelines:
- Keep it natural and conversational (2-3 sentences max)
- Reference time of day appropriately
- If first conversation, be welcoming but not overwhelming
- If returning user, acknowledge the connection warmly
- If has advice today, mention you have something special to share
- Match personalization level (minimal = general, moderate = some context, full = deeply personal)
- End with gentle invitation to chat

Generate a greeting that feels like Lumi genuinely wants to connect and start a meaningful conversation.`;

  const userPrompt = context.personalizationLevel === 'full' && context.portraitText
    ? `Based on my understanding: ${context.portraitText.slice(0, 200)}... and recent topics: ${context.recentTopics.join(', ')}`
    : context.personalizationLevel === 'moderate' && context.recentTopics.length > 0
    ? `Considering our recent conversations about: ${context.recentTopics.slice(0, 2).join(', ')}`
    : `Generate a warm ${context.timeOfDay} greeting for someone I${context.conversationCount > 0 ? `'ve chatted with ${context.conversationCount} times` : ' haven\'t met yet'}.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const aiResponse = await response.json();
  return aiResponse.choices[0].message.content;
}

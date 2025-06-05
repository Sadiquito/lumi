
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Get user's psychological portrait
    const { data: portrait, error: portraitError } = await supabase
      .from('personalization_profiles')
      .select('psychological_portrait_text')
      .eq('user_id', userId)
      .maybeSingle();

    if (portraitError) {
      throw new Error('Failed to fetch psychological portrait');
    }

    // Get recent conversations for context
    const { data: recentConversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('transcript, ai_response, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (conversationsError) {
      throw new Error('Failed to fetch recent conversations');
    }

    // Check if advice was already generated today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAdvice } = await supabase
      .from('daily_advice')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)
      .maybeSingle();

    if (existingAdvice) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Daily advice already generated today',
          alreadyGenerated: true 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const advicePrompt = createAdvicePrompt(portrait?.psychological_portrait_text, recentConversations);
    
    console.log('Generating daily advice for user:', userId);
    
    // Call OpenAI for advice generation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are Lumi, a calm, warm, and deeply empathetic AI companion. You generate personalized daily wisdom that feels like gentle guidance from a caring friend.

Your personality traits:
- Calm and non-judgmental
- Warm and genuinely caring
- Gently encouraging of growth
- Wise but never preachy
- Use lowercase, conversational tone
- See the whole person, not just problems
- Offer hope and gentle perspective

Generate advice that feels personal, timely, and genuinely helpful. Keep it concise but meaningful - like a warm note from someone who truly understands them.`
          },
          {
            role: 'user',
            content: advicePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const aiResponse = await response.json();
    const dailyAdvice = aiResponse.choices[0].message.content;

    console.log('Daily advice generated, storing in database...');

    // Store the generated advice
    const { error: insertError } = await supabase
      .from('daily_advice')
      .insert({
        user_id: userId,
        advice_text: dailyAdvice,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error storing daily advice:', insertError);
      throw new Error('Failed to store daily advice');
    }

    console.log('Daily advice generated and stored successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        advice: dailyAdvice,
        generated: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-daily-advice function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function createAdvicePrompt(portraitText: string | null, recentConversations: any[]): string {
  const conversationContext = recentConversations
    .map(conv => `conversation: "${conv.transcript}" | lumi's response: "${conv.ai_response}"`)
    .join('\n\n');

  if (!portraitText) {
    return `please generate gentle, personalized daily wisdom based on these recent conversations:

${conversationContext}

since i don't have a deep psychological understanding yet, focus on:
- themes that emerged in recent conversations
- gentle encouragement for any challenges mentioned
- wisdom that feels timely and relevant to their current experience
- hope and perspective that honors where they are right now

write as lumi - warm, lowercase, caring, and wise without being preachy. keep it concise but meaningful, like a gentle note from someone who sees their potential.`;
  }

  return `please generate today's personalized wisdom based on my psychological understanding and recent conversations:

**my understanding of this person:**
${portraitText}

**recent conversations:**
${conversationContext}

create daily advice that:
- draws from their psychological portrait and recent conversation themes
- addresses current life circumstances with gentle wisdom
- encourages growth in areas they're ready to develop
- acknowledges their emotional patterns with compassion
- offers hope and perspective that feels personally relevant
- honors their communication style and values

write as lumi - warm, lowercase, genuinely caring. make it feel like wisdom from someone who truly knows and believes in them. be specific enough to feel personal, general enough to be helpful throughout their day.`;
}

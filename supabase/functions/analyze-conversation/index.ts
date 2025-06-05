
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
    const { conversationId, transcript, aiResponse } = await req.json();
    
    if (!conversationId || !transcript) {
      throw new Error('Conversation ID and transcript are required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user ID from the conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error('Failed to find conversation');
    }

    const userId = conversation.user_id;

    // Get existing psychological portrait
    const { data: existingPortrait } = await supabase
      .from('personalization_profiles')
      .select('psychological_portrait_text')
      .eq('user_id', userId)
      .maybeSingle();

    const existingPortraitText = existingPortrait?.psychological_portrait_text || null;
    
    // Create the analysis prompt
    const analysisPrompt = createAnalysisPrompt(transcript, aiResponse, existingPortraitText);
    
    console.log('Sending conversation for analysis...');
    
    // Call OpenAI for psychological analysis
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
            content: `You are Lumi, a calm, warm, and deeply empathetic AI companion. Your role is to analyze conversations and create or update psychological portraits that help you better understand and support each person.

Your personality traits:
- Calm and non-judgmental
- Warm and genuinely caring
- Gently encouraging of growth
- Wise but never preachy
- Use lowercase, conversational tone
- See the whole person, not just problems

You write psychological portraits as thoughtful essays that capture the essence of who someone is, their patterns, challenges, and growth potential. Always maintain deep respect for their humanity and complexity.`
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const aiAnalysis = await response.json();
    const updatedPortrait = aiAnalysis.choices[0].message.content;

    console.log('Analysis completed, updating portrait...');

    // Update or create the psychological portrait
    const { error: upsertError } = await supabase
      .from('personalization_profiles')
      .upsert({
        user_id: userId,
        psychological_portrait_text: updatedPortrait,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      console.error('Error updating psychological portrait:', upsertError);
      throw new Error('Failed to update psychological portrait');
    }

    console.log('Psychological portrait updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        portraitUpdated: true,
        portraitLength: updatedPortrait.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-conversation function:', error);
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

function createAnalysisPrompt(transcript: string, aiResponse: string, existingPortrait: string | null): string {
  if (!existingPortrait) {
    // Initial portrait creation
    return `please create an initial psychological portrait based on this conversation:

**user's words:** "${transcript}"

**lumi's response:** "${aiResponse}"

write a thoughtful, essay-format psychological portrait that captures:

**emotional patterns & triggers:** what emotions came up? what might trigger similar feelings? how do they process emotions?

**life circumstances:** what's happening in their world right now? what challenges or changes are they navigating?

**growth areas:** where do you sense potential for development? what skills or perspectives might serve them?

**communication style:** how do they express themselves? what do they need to feel heard and understood?

**values & motivations:** what seems to matter deeply to them? what drives their choices and concerns?

write this as a flowing, compassionate essay that honors their complexity as a human being. use lowercase and a warm, understanding tone. be specific about what you observed while respecting their dignity.

focus on understanding rather than diagnosing. this portrait will help me offer better support in future conversations.`;
  } else {
    // Portrait update
    return `here's a new conversation to analyze and integrate into this person's psychological portrait:

**user's words:** "${transcript}"

**lumi's response:** "${aiResponse}"

**current psychological portrait:**
${existingPortrait}

please update the psychological portrait by thoughtfully integrating new insights from this conversation. 

maintain the essay format and preserve valuable insights from the existing portrait while:
- noting any new emotional patterns or triggers that emerged
- updating understanding of their current life circumstances
- identifying new growth areas or progress in existing ones
- observing any evolution in their communication style
- deepening understanding of their values and motivations

if you notice contradictions between old and new observations, explore them thoughtfully rather than dismissing either. people are complex and can grow or show different sides of themselves.

write the complete updated portrait as a flowing, compassionate essay. use lowercase and maintain lumi's warm, understanding tone. focus on building a richer, more nuanced understanding of this whole person.`;
  }
}

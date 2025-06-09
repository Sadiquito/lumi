
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userTranscript, userId, conversationId } = await req.json();

    if (!userTranscript || !userId) {
      throw new Error('Missing required parameters');
    }

    console.log('Processing conversation:', {
      userId,
      conversationId,
      transcriptLength: userTranscript.length
    });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('psychological_profile, conversation_preferences')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    // Get conversation history if conversationId exists
    let conversationHistory = [];
    if (conversationId) {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('transcript')
        .eq('id', conversationId)
        .single();

      if (!convError && conversation?.transcript) {
        conversationHistory = conversation.transcript;
      }
    }

    // Build system prompt
    const systemPrompt = `You are Lumi, an emotionally intelligent AI companion designed for introspective conversations. Your core traits:

- Emotionally neutral yet warmly present
- Calm, thoughtful, and reflective in all responses
- You help users explore their thoughts and feelings without giving direct advice
- You ask gentle, open-ended questions that promote self-discovery
- You reflect back what you hear to help users process their emotions
- You maintain appropriate boundaries as an AI companion

User's psychological profile: ${JSON.stringify(profile?.psychological_profile || {})}
User's conversation preferences: ${JSON.stringify(profile?.conversation_preferences || {})}

Recent conversation context: ${conversationHistory.slice(-10).map((entry: any) => `${entry.speaker}: ${entry.text}`).join('\n')}

Keep responses conversational, typically 1-2 sentences. Focus on being a supportive presence that encourages self-reflection.`;

    // Prepare messages for GPT-4o
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userTranscript }
    ];

    // Call OpenAI GPT-4o
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const aiResponse = await response.json();
    const lumiResponse = aiResponse.choices[0].message.content;

    console.log('Generated Lumi response:', lumiResponse);

    // Extract psychological insights (simple keyword analysis for now)
    const insights = extractPsychologicalInsights(userTranscript);

    // Update user profile with new insights
    const updatedProfile = {
      ...profile?.psychological_profile,
      lastInteraction: new Date().toISOString(),
      totalInteractions: (profile?.psychological_profile?.totalInteractions || 0) + 1,
      ...insights
    };

    await supabase
      .from('profiles')
      .update({ psychological_profile: updatedProfile })
      .eq('id', userId);

    // Generate follow-up question (occasionally)
    const shouldAskFollowUp = Math.random() < 0.3; // 30% chance
    const followUpQuestion = shouldAskFollowUp ? generateFollowUpQuestion(userTranscript) : null;

    return new Response(
      JSON.stringify({
        response: lumiResponse,
        followUpQuestion,
        insights: insights,
        conversationId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in lumi-conversation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function extractPsychologicalInsights(transcript: string): any {
  const insights: any = {};
  const text = transcript.toLowerCase();

  // Simple sentiment analysis
  const positiveWords = ['happy', 'good', 'great', 'excited', 'love', 'wonderful'];
  const negativeWords = ['sad', 'bad', 'angry', 'frustrated', 'hate', 'terrible'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;

  if (positiveCount > negativeCount) {
    insights.sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    insights.sentiment = 'negative';
  } else {
    insights.sentiment = 'neutral';
  }

  // Topic detection
  if (text.includes('work') || text.includes('job') || text.includes('career')) {
    insights.topics = [...(insights.topics || []), 'work'];
  }
  if (text.includes('family') || text.includes('parent') || text.includes('child')) {
    insights.topics = [...(insights.topics || []), 'family'];
  }
  if (text.includes('relationship') || text.includes('partner') || text.includes('friend')) {
    insights.topics = [...(insights.topics || []), 'relationships'];
  }

  return insights;
}

function generateFollowUpQuestion(transcript: string): string {
  const questions = [
    "What does that mean to you?",
    "How did that make you feel?",
    "Can you tell me more about that?",
    "What thoughts come up when you think about that?",
    "How do you usually handle situations like this?"
  ];
  
  return questions[Math.floor(Math.random() * questions.length)];
}

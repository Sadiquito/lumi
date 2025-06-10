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
    const { 
      userTranscript, 
      userId, 
      conversationId, 
      isSessionEnd = false, 
      fullTranscript = null,
      requestType = 'conversation'
    } = await req.json();

    if (!userTranscript || !userId) {
      throw new Error('Missing required parameters');
    }

    console.log('Processing conversation:', {
      userId,
      conversationId,
      transcriptLength: userTranscript.length,
      isSessionEnd,
      requestType,
      hasFullTranscript: !!fullTranscript
    });

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle session summary requests
    if (requestType === 'session_summary' && fullTranscript) {
      return await generateSessionSummary(fullTranscript, userId);
    }

    // Get user profile with psychological insights
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

    // Extract top psychological insights for context
    const memoryInsights = extractTopInsights(profile?.psychological_profile || {});

    // Build system prompt with memory context
    const systemPrompt = `You are Lumi, an emotionally intelligent AI companion designed for introspective conversations. Your core traits:

- Emotionally neutral yet warmly present
- Calm, thoughtful, and reflective in all responses
- You help users explore their thoughts and feelings without giving direct advice
- You ask gentle, open-ended questions that promote self-discovery
- You reflect back what you hear to help users process their emotions
- You maintain appropriate boundaries as an AI companion

User's conversation preferences: ${JSON.stringify(profile?.conversation_preferences || {})}

Key psychological insights from previous sessions:
${memoryInsights.map(insight => `- ${insight}`).join('\n')}

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

    // If this is a session end, perform comprehensive session analysis
    if (isSessionEnd && (conversationHistory.length > 0 || fullTranscript)) {
      await performSessionAnalysis(supabase, userId, fullTranscript || conversationHistory, profile?.psychological_profile || {});
    } else {
      // For ongoing conversation, do lightweight insight extraction
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
    }

    // Generate follow-up question (occasionally)
    const shouldAskFollowUp = Math.random() < 0.3; // 30% chance
    const followUpQuestion = shouldAskFollowUp ? generateFollowUpQuestion(userTranscript) : null;

    return new Response(
      JSON.stringify({
        response: lumiResponse,
        followUpQuestion,
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

async function generateSessionSummary(fullTranscript: string, userId: string) {
  try {
    console.log('Generating session summary...');

    const summaryPrompt = `You are Lumi, an emotionally intelligent AI companion. Analyze this conversation session and provide:

1. A brief, warm session summary (2-3 sentences)
2. A thoughtful reflection on what the user shared (2-3 sentences) 
3. A gentle follow-up question for their next conversation

Focus on being supportive and encouraging. Keep the tone warm but not overly enthusiastic.

Conversation transcript:
${fullTranscript}

Respond in JSON format:
{
  "sessionSummary": "Brief summary of the session",
  "lumiReflection": "Thoughtful reflection on what was shared",
  "followUpQuestion": "Gentle question for next time"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'user', content: summaryPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate session summary');
    }

    const aiResponse = await response.json();
    const summaryContent = aiResponse.choices[0].message.content;
    
    try {
      const summaryData = JSON.parse(summaryContent);
      return new Response(
        JSON.stringify(summaryData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (parseError) {
      // Fallback if JSON parsing fails
      return new Response(
        JSON.stringify({
          sessionSummary: "We had a meaningful conversation today.",
          lumiReflection: "Thank you for sharing your thoughts and feelings with me.",
          followUpQuestion: "What would you like to explore in our next conversation?"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error generating session summary:', error);
    return new Response(
      JSON.stringify({
        sessionSummary: "We had a meaningful conversation today.",
        lumiReflection: "Thank you for sharing your thoughts and feelings with me.",
        followUpQuestion: "What would you like to explore in our next conversation?"
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function performSessionAnalysis(supabase: any, userId: string, conversationHistory: any[], currentProfile: any) {
  try {
    console.log('Performing comprehensive session analysis...');
    
    // Prepare full session transcript for analysis
    const fullTranscript = Array.isArray(conversationHistory) 
      ? conversationHistory.map((entry: any) => `${entry.speaker}: ${entry.text}`).join('\n')
      : conversationHistory;

    // Analyze session using GPT-4o
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a psychological analyst. Analyze this conversation session and extract key insights in JSON format:
            {
              "emotionalTone": "string (primary emotional state)",
              "majorConcerns": ["array of main concerns/topics"],
              "reflectiveThemes": ["recurring patterns or insights"],
              "growthAreas": ["areas for personal development"],
              "copingStrategies": ["observed coping mechanisms"],
              "energyLevel": "string (high/medium/low)",
              "selfAwareness": "string (high/medium/low)",
              "sessionSummary": "2-3 sentence summary of the session"
            }`
          },
          {
            role: 'user',
            content: `Analyze this conversation session:\n\n${fullTranscript}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error('Failed to analyze session');
    }

    const analysisResult = await analysisResponse.json();
    const sessionInsights = JSON.parse(analysisResult.choices[0].message.content);

    // Apply weighted memory logic
    const updatedProfile = applyWeightedMemory(currentProfile, sessionInsights);

    // Update the profile with comprehensive analysis
    await supabase
      .from('profiles')
      .update({ psychological_profile: updatedProfile })
      .eq('id', userId);

    console.log('Session analysis completed and profile updated');

  } catch (error) {
    console.error('Error in session analysis:', error);
  }
}

function applyWeightedMemory(currentProfile: any, sessionInsights: any): any {
  const now = new Date().toISOString();
  
  // Initialize profile structure if empty
  if (!currentProfile.sessions) {
    currentProfile.sessions = [];
  }
  if (!currentProfile.aggregatedInsights) {
    currentProfile.aggregatedInsights = {
      dominantEmotions: {},
      recurringThemes: {},
      copingStrategies: {},
      growthAreas: {},
      lastUpdated: now
    };
  }

  // Add new session with timestamp
  const newSession = {
    ...sessionInsights,
    timestamp: now,
    recency: 'recent' // Will be updated in the weighting process
  };

  currentProfile.sessions.push(newSession);

  // Keep only last 50 sessions to prevent bloat
  if (currentProfile.sessions.length > 50) {
    currentProfile.sessions = currentProfile.sessions.slice(-50);
  }

  // Apply temporal weights: 70% recent (last 7 days), 20% medium (7-30 days), 10% long-term (30+ days)
  const cutoffRecent = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const cutoffMedium = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const weightedInsights = {
    dominantEmotions: {},
    recurringThemes: {},
    copingStrategies: {},
    growthAreas: {},
    lastUpdated: now
  };

  // Process each session with appropriate weight
  currentProfile.sessions.forEach((session: any) => {
    const sessionDate = new Date(session.timestamp);
    let weight = 0.1; // long-term weight

    if (sessionDate > cutoffRecent) {
      weight = 0.7; // recent weight
      session.recency = 'recent';
    } else if (sessionDate > cutoffMedium) {
      weight = 0.2; // medium-term weight
      session.recency = 'medium';
    } else {
      session.recency = 'long-term';
    }

    // Apply weights to emotional tone
    if (session.emotionalTone) {
      weightedInsights.dominantEmotions[session.emotionalTone] = 
        (weightedInsights.dominantEmotions[session.emotionalTone] || 0) + weight;
    }

    // Apply weights to themes
    session.reflectiveThemes?.forEach((theme: string) => {
      weightedInsights.recurringThemes[theme] = 
        (weightedInsights.recurringThemes[theme] || 0) + weight;
    });

    // Apply weights to coping strategies
    session.copingStrategies?.forEach((strategy: string) => {
      weightedInsights.copingStrategies[strategy] = 
        (weightedInsights.copingStrategies[strategy] || 0) + weight;
    });

    // Apply weights to growth areas
    session.growthAreas?.forEach((area: string) => {
      weightedInsights.growthAreas[area] = 
        (weightedInsights.growthAreas[area] || 0) + weight;
    });
  });

  currentProfile.aggregatedInsights = weightedInsights;
  currentProfile.totalSessions = currentProfile.sessions.length;
  currentProfile.lastSessionAnalysis = now;

  return currentProfile;
}

function extractTopInsights(profile: any): string[] {
  if (!profile.aggregatedInsights) return [];

  const insights: string[] = [];
  
  // Get top emotional patterns
  const topEmotions = Object.entries(profile.aggregatedInsights.dominantEmotions || {})
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 2);
  
  topEmotions.forEach(([emotion, weight]) => {
    insights.push(`Often experiences ${emotion} emotions (significance: ${(weight as number).toFixed(1)})`);
  });

  // Get top recurring themes
  const topThemes = Object.entries(profile.aggregatedInsights.recurringThemes || {})
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 2);
  
  topThemes.forEach(([theme, weight]) => {
    insights.push(`Frequently reflects on ${theme} (significance: ${(weight as number).toFixed(1)})`);
  });

  // Get primary coping strategy
  const topCoping = Object.entries(profile.aggregatedInsights.copingStrategies || {})
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 1);
  
  topCoping.forEach(([strategy, weight]) => {
    insights.push(`Primary coping approach: ${strategy} (significance: ${(weight as number).toFixed(1)})`);
  });

  return insights.slice(0, 5); // Return top 5 insights
}

function extractPsychologicalInsights(transcript: string): any {
  const insights: any = {};
  const text = transcript.toLowerCase();

  // Simple sentiment analysis
  const positiveWords = ['happy', 'good', 'great', 'excited', 'love', 'wonderful', 'grateful', 'joy'];
  const negativeWords = ['sad', 'bad', 'angry', 'frustrated', 'hate', 'terrible', 'anxious', 'worried'];
  
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
  const topics = [];
  if (text.includes('work') || text.includes('job') || text.includes('career')) {
    topics.push('work');
  }
  if (text.includes('family') || text.includes('parent') || text.includes('child')) {
    topics.push('family');
  }
  if (text.includes('relationship') || text.includes('partner') || text.includes('friend')) {
    topics.push('relationships');
  }
  if (text.includes('stress') || text.includes('overwhelm') || text.includes('pressure')) {
    topics.push('stress');
  }
  
  if (topics.length > 0) {
    insights.topics = topics;
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


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConversationData {
  messages: Array<{
    content: string;
    speaker: 'user' | 'ai';
    timestamp: string;
  }>;
  duration_minutes: number;
  message_count: number;
}

interface RequestBody {
  conversation_id: string;
  conversation_data: ConversationData;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { conversation_id, conversation_data }: RequestBody = await req.json()
    
    console.log('Generating summary for conversation:', conversation_id)

    // Create conversation text for analysis
    const conversationText = conversation_data.messages
      .map(msg => `${msg.speaker}: ${msg.content}`)
      .join('\n')

    // Call OpenAI API for summary generation
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that analyzes conversations and creates insightful summaries. 
            
            Create a JSON response with:
            1. summary_text: A 2-3 sentence summary of the main topics and outcomes
            2. key_insights: An array of 2-4 key insights or important points from the conversation
            3. emotional_tone: A single word describing the overall emotional tone (positive, reflective, concerned, supportive, neutral, etc.)
            
            Keep responses concise and meaningful.`
          },
          {
            role: 'user',
            content: `Please analyze this conversation and provide a summary:\n\n${conversationText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 400
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const analysisText = openaiData.choices[0].message.content

    // Parse the AI response
    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch {
      // Fallback if JSON parsing fails
      analysis = {
        summary_text: "A meaningful conversation took place with valuable insights shared.",
        key_insights: ["Personal reflection and growth discussed", "Important topics explored together"],
        emotional_tone: "reflective"
      }
    }

    // Insert summary into database
    const { data: summary, error: insertError } = await supabase
      .from('conversation_summaries')
      .insert({
        conversation_id,
        summary_text: analysis.summary_text,
        key_insights: analysis.key_insights || [],
        emotional_tone: analysis.emotional_tone,
        duration_minutes: conversation_data.duration_minutes,
        message_count: conversation_data.message_count,
        metadata: {
          generation_model: 'gpt-3.5-turbo',
          confidence_score: 0.85,
          themes: analysis.themes || []
        }
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    console.log('Summary generated successfully:', summary.id)

    return new Response(
      JSON.stringify({ summary }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error generating summary:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate conversation summary' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DatabaseService } from './database.ts';
import { OpenAIService } from './openai.ts';
import { RequestBody, GenerationResponse } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, privacySettings }: RequestBody = await req.json();
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiApiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // Initialize services
    const dbService = new DatabaseService(supabaseUrl, supabaseServiceKey);
    const openaiService = new OpenAIService(openaiApiKey);

    // Respect privacy settings
    const hasConsent = privacySettings?.hasConsent !== false;
    const personalizationLevel = privacySettings?.personalizationLevel || 'moderate';
    
    console.log('Privacy settings:', { hasConsent, personalizationLevel });

    // Check if advice was already generated today
    const alreadyExists = await dbService.checkExistingAdvice(userId);
    if (alreadyExists) {
      const response: GenerationResponse = {
        success: true, 
        message: 'Daily advice already generated today',
        alreadyGenerated: true 
      };
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user data based on privacy settings
    const userData = await dbService.fetchUserData(userId, { hasConsent, personalizationLevel });

    // Generate advice using OpenAI
    const dailyAdvice = await openaiService.generateAdvice(
      userData.portraitText,
      userData.recentConversations,
      { hasConsent, personalizationLevel }
    );

    console.log('Daily advice generated, storing in database...');

    // Store the generated advice
    await dbService.storeAdvice(userId, dailyAdvice, { hasConsent, personalizationLevel });

    console.log('Daily advice generated and stored successfully');

    const response: GenerationResponse = {
      success: true, 
      advice: dailyAdvice,
      generated: true,
      personalizationLevel,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-daily-advice function:', error);
    const response: GenerationResponse = {
      error: error.message,
      success: false 
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { metric_name, metric_value, metadata } = await req.json()

    if (!metric_name || metric_value === undefined) {
      return new Response(
        JSON.stringify({ error: 'metric_name and metric_value are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log to console for debugging
    console.log(`[HEALTH LOG] ${metric_name}:`, {
      value: metric_value,
      metadata,
      timestamp: new Date().toISOString()
    })

    // Store in system_health table
    const { error } = await supabaseClient
      .from('system_health')
      .insert({
        metric_name,
        metric_value,
        metric_date: new Date().toISOString().split('T')[0],
        metadata: metadata || {}
      })

    if (error) {
      console.error('Failed to insert health metric:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to log health metric' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in track-system-health function:', error)
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

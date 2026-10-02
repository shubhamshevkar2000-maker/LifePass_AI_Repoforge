import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Missing auth header' } }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Invalid or missing token' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Malformed JSON payload' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const AI_SERVICE_URL = Deno.env.get('AI_SERVICE_URL') || 'http://192.168.0.101:8000';

    try {
      const aiResponse = await fetch(`${AI_SERVICE_URL}/api/explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 400) { return new Response(JSON.stringify({ error: { code: "MALFORMED_OUTPUT", message: "Malformed output" } }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); } if (aiResponse.status === 503) {
           return new Response(JSON.stringify({ error: { code: 'AI_UNAVAILABLE', message: 'AI Service Unavailable' } }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'AI Service Error' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const aiData = await aiResponse.json();

      return new Response(JSON.stringify(aiData), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: { code: 'AI_UNAVAILABLE', message: 'Could not connect to AI service' } }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal server error' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

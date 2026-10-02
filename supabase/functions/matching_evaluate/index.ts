import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { evaluateMatching } from "../shared/matching.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Malformed JSON payload' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!body || !body.requirement_profile_id) {
      return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'requirement_profile_id is required' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call the deterministic matching service
    try {
      const matchResult = await evaluateMatching(supabaseClient, body.requirement_profile_id);
      return new Response(JSON.stringify(matchResult), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (e: any) {
      if (e.message === 'REQUIREMENT_PROFILE_NOT_FOUND') {
        return new Response(JSON.stringify({ error: { code: 'REQUIREMENT_PROFILE_NOT_FOUND', message: 'Requirement profile not found' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal matching failure' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal matching failure' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

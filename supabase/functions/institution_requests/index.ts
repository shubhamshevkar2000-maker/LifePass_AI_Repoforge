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

    const { institution_id, user_id, requirement_profile_id, purpose, expires_at } = body;

    if (!institution_id || !user_id || !requirement_profile_id || !purpose || !expires_at) {
      return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Missing required fields' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call the RPC transaction
    const { data, error } = await supabaseClient.rpc('create_institution_access_request', {
      p_institution_id: institution_id,
      p_user_id: user_id,
      p_requirement_profile_id: requirement_profile_id,
      p_purpose: purpose,
      p_expires_at: expires_at
    });

    if (error) {
      // Return safe 400s for expected logic errors raised by the RPC
      if (error.message.includes('unauthorized: missing auth context')) {
        return new Response(JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Missing auth context' } }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (error.message.includes('not an active member')) {
        return new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Not an active institution member' } }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (error.message.includes('invalid_request: specified recipient user does not exist') || error.message.includes('specified requirement profile does not exist')) {
        return new Response(JSON.stringify({ error: { code: 'INVALID_REQUEST', message: error.message } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      console.error(error);
      return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal server error during request creation' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ id: data, status: 'draft' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal server error' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

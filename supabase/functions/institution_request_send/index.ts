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

    const { request_id } = body;
    if (!request_id) {
      return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Missing request_id' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data, error } = await supabaseClient.rpc('send_institution_access_request', {
      p_request_id: request_id
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('unauthorized: missing auth context')) {
        return new Response(JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Missing auth context' } }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (msg.includes('not_found: request does not exist')) {
        return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Request not found' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (msg.includes('invalid_state: request is not in draft status') || msg.includes('invalid_state: request has already expired') || msg.includes('invalid_state: request cannot be sent without request items')) {
        return new Response(JSON.stringify({ error: { code: 'INVALID_STATE', message: msg } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (msg.includes('permission denied for function')) {
        return new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Forbidden' } }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      console.error(error);
      return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal server error during request transition' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ id: data, status: 'pending_user' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal server error' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

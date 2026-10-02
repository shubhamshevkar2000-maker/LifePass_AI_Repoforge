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

    const { request_id, decision, selected_record_ids } = body;
    if (!request_id || !decision) {
      return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Missing required fields' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (decision !== 'grant' && decision !== 'deny') {
      return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Invalid decision' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let p_mapped_items: any[] = [];

    if (decision === 'grant') {
      if (!Array.isArray(selected_record_ids)) {
        return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'selected_record_ids must be an array' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Fetch request to get requirement profile
      const { data: requestData, error: requestError } = await supabaseClient
        .from('access_requests')
        .select('requirement_profile_id')
        .eq('id', request_id)
        .single();

      if (requestError || !requestData) {
        return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Request not found' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Run matching logic
      const matchResult = await evaluateMatching(supabaseClient, requestData.requirement_profile_id);

      // Verify that all selected_record_ids are actually part of the matched items
      const selectedSet = new Set(selected_record_ids);
      for (const m of matchResult.matched) {
        if (selectedSet.has(m.record.id)) {
          p_mapped_items.push({
            requirement_id: m.requirement.id,
            record_id: m.record.id
          });
          selectedSet.delete(m.record.id);
        }
      }

      if (selectedSet.size > 0) {
        return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Arbitrary record IDs that are not part of the matched request_items are not allowed' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    const { data, error } = await supabaseClient.rpc('submit_consent_decision', {
      p_request_id: request_id,
      p_decision: decision,
      p_mapped_items: p_mapped_items
    });

    if (error) {
      const msg = error.message || '';
      if (msg.includes('unauthorized: missing auth context')) {
        return new Response(JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Missing auth context' } }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (msg.includes('not_found: request does not exist')) {
        return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Request not found' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (msg.includes('invalid_state:')) {
        return new Response(JSON.stringify({ error: { code: 'INVALID_STATE', message: msg } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (msg.includes('invalid_input:')) {
        return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: msg } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (msg.includes('permission denied for function')) {
        return new Response(JSON.stringify({ error: { code: 'FORBIDDEN', message: 'Forbidden' } }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      console.error(error);
      return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal server error during consent submission' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ consent_id: data, status: decision === 'grant' ? 'granted' : 'denied' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal server error' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

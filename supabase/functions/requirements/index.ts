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

    const body = await req.json();
    if (!body.task) {
      return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'Task code is required' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const taskCode = body.task;

    const { data: profile, error: profileError } = await supabaseClient
      .from('requirement_profiles')
      .select('*')
      .eq('task_code', taskCode)
      .eq('status', 'active')
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: { code: 'REQUIREMENT_PROFILE_NOT_FOUND', message: 'Requirement profile not found' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: requirements, error: reqError } = await supabaseClient
      .from('requirements')
      .select('*')
      .eq('profile_id', profile.id)
      .order('display_order', { ascending: true });

    if (reqError) {
      return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: reqError.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const responsePayload = {
      profile_id: profile.id,
      version: profile.version,
      name: profile.name,
      domain: profile.domain,
      description: profile.description,
      requirements: requirements
    };

    return new Response(JSON.stringify(responsePayload), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: error.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

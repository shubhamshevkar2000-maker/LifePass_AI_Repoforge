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
    if (!authHeader) throw new Error("Missing auth header");
    const token = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Invalid or missing token', details: authError } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method === 'GET') {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PATCH') {
      const body = await req.json();
      const allowedFields = ['full_name', 'avatar_url'];

      const updateData: any = {};
      for (const key of Object.keys(body)) {
        if (allowedFields.includes(key)) {
          updateData[key] = body[key];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'No valid fields provided' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data, error } = await supabaseClient
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: { code: 'UPDATE_FAILED', message: error.message } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: error.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

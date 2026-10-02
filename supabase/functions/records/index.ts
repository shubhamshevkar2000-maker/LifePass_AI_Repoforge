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
        JSON.stringify({ error: { code: 'UNAUTHENTICATED', message: 'Invalid or missing token' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const functionIndex = pathParts.indexOf('records');

    let id = null;
    let action = null;

    if (functionIndex !== -1 && functionIndex + 1 < pathParts.length) {
      id = pathParts[functionIndex + 1];
    }
    if (functionIndex !== -1 && functionIndex + 2 < pathParts.length) {
      action = pathParts[functionIndex + 2];
    }

    if (req.method === 'GET' && !id) {
      const { data, error } = await supabaseClient
        .from('records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: error.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST' && !id) {
      const body = await req.json();

      if (!body.storage_path) {
         return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'storage_path is required' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      if (!body.storage_path.startsWith(`${user.id}/`)) {
         return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: 'storage_path must start with your user_id' } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data, error } = await supabaseClient
        .from('records')
        .insert({
           user_id: user.id,
           title: body.title,
           category: body.category,
           document_type: body.document_type,
           status: 'uploaded',
           external_verification_status: 'not_verified',
           source_type: body.source_type || 'upload',
           storage_path: body.storage_path,
           mime_type: body.mime_type,
           file_size: body.file_size
        })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: { code: 'INVALID_INPUT', message: error.message } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify(data), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET' && id && !action) {
      const { data, error } = await supabaseClient
        .from('records')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Record not found' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE' && id && !action) {
      const { data, error } = await supabaseClient
        .from('records')
        .delete()
        .eq('id', id)
        .select();

      if (error || data.length === 0) {
        return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found or unauthorized' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method === 'POST' && id && action === 'process') {
      const { data: record, error: recordError } = await supabaseClient
        .from('records')
        .select('id, status')
        .eq('id', id)
        .single();

      if (recordError || !record) {
        return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Record not found or unauthorized' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data, error: updateError } = await supabaseClient
        .from('records')
        .update({ status: 'processing' })
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        return new Response(JSON.stringify({ error: { code: 'UPDATE_FAILED', message: updateError.message } }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await serviceClient.from('audit_events').insert({
        actor_user_id: user.id,
        event_type: 'record_processing_started',
        entity_type: 'record',
        entity_id: id,
        metadata: { action: 'process_triggered' }
      });

      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: error.message } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

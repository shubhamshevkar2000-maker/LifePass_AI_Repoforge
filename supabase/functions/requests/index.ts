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

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = pathParts[pathParts.length - 1] !== 'requests' ? pathParts[pathParts.length - 1] : null;

    if (req.method === 'GET') {
      let query = supabaseClient
        .from('access_requests')
        .select(`
          id,
          institution_id,
          purpose,
          status,
          requirement_profile_id,
          created_at,
          expires_at,
          institutions ( name ),
          requirement_profiles ( name ),
          request_items (
            id,
            match_status,
            requirements ( id, name, code, category ),
            records ( id, title, category, document_type )
          )
        `);

      if (id) {
        query = query.eq('id', id).single();
      } else {
        const filterStatus = url.searchParams.get('status');
        if (filterStatus) {
           // map UI status to backend status loosely, or just handle it as raw status
           if (filterStatus === 'pending') {
             query = query.in('status', ['draft', 'pending_user']);
           } else if (filterStatus === 'active') {
             query = query.eq('status', 'approved');
           } else {
             query = query.eq('status', filterStatus);
           }
        }
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === 'PGRST116' && id) { // Not found
          return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Request not found or access denied.' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        console.error("DB Query Error:", error);
        return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Database error' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Fetch institution names using service role because RLS restricts non-members
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const institutionIds = [...new Set((data ? (Array.isArray(data) ? data : [data]) : []).map((r: any) => r.institution_id))];
      let instMap: Record<string, string> = {};
      if (institutionIds.length > 0) {
        const { data: instData } = await serviceClient.from('institutions').select('id, name').in('id', institutionIds);
        if (instData) {
          instMap = instData.reduce((acc: any, inst: any) => ({ ...acc, [inst.id]: inst.name }), {});
        }
      }

      // Format response to match frontend expectations
      const formatRequest = (req: any) => {
        const uiStatus = (req.status === 'draft' || req.status === 'pending_user') ? 'pending' 
                        : (req.status === 'approved' ? 'active' : req.status);
                        
        return {
          id: req.id,
          institution_id: req.institution_id,
          institution_name: instMap[req.institution_id] || req.institutions?.name || 'Unknown Institution',
          purpose: req.purpose,
          status: uiStatus,
          raw_status: req.status,
          requirement_profile_id: req.requirement_profile_id,
          requirement_profile_name: req.requirement_profiles?.name || 'Unknown Profile',
          requested_requirements: (req.request_items || []).map((item: any) => ({
            id: item.requirements?.id,
            name: item.requirements?.name,
            code: item.requirements?.code,
            category: item.requirements?.category,
            matchedRecordId: item.records?.id,
            matchedRecordTitle: item.records?.title,
            isMissing: item.match_status === 'missing' || !item.records
          })),
          selected_records: (req.request_items || [])
            .filter((item: any) => item.records)
            .map((item: any) => ({
              id: item.records?.id,
              title: item.records?.title,
              category: item.records?.category,
              documentType: item.records?.document_type
            })),
          created_at: req.created_at,
          expires_at: req.expires_at
        };
      };

      if (id) {
        if (!data) {
          return new Response(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Request not found' } }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
        return new Response(JSON.stringify({ request: formatRequest(data) }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      } else {
        return new Response(JSON.stringify({ requests: (data || []).map(formatRequest) }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    return new Response(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error("Unhandled Error:", error);
    return new Response(JSON.stringify({ error: { code: 'PROCESSING_FAILED', message: 'Internal server error' } }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

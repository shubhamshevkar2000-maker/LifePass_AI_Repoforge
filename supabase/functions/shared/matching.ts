import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export interface MatchResult {
  readiness_percent: number;
  matched: any[];
  missing: any[];
  attention_needed: any[];
}

export async function evaluateMatching(
  supabaseClient: SupabaseClient,
  requirementProfileId: string
): Promise<MatchResult> {
  // 1. Retrieve requirement profile and requirements
  const { data: profile, error: profileError } = await supabaseClient
    .from('requirement_profiles')
    .select('*')
    .eq('id', requirementProfileId)
    .eq('status', 'active')
    .single();

  if (profileError || !profile) {
    throw new Error('REQUIREMENT_PROFILE_NOT_FOUND');
  }

  const { data: requirements, error: reqError } = await supabaseClient
    .from('requirements')
    .select('*')
    .eq('profile_id', profile.id)
    .order('display_order', { ascending: true });

  if (reqError) {
    throw new Error('INTERNAL_ERROR');
  }

  // 2. Retrieve records belonging ONLY to the authenticated user
  const { data: records, error: recError } = await supabaseClient
    .from('records')
    .select('*');

  if (recError) {
    throw new Error('INTERNAL_ERROR');
  }

  // 3 & 4 & 5. Matching logic
  const matched = [];
  const missing = [];
  const attention_needed = [];

  let requiredCount = 0;
  let requiredMatchedCount = 0;
  const now = new Date();

  for (const req of requirements) {
    const isRequired = req.required === true;
    if (isRequired) requiredCount++;

    const candidates = records.filter(record => {
      // Rule 1: Document type exact match
      const acceptedTypes = req.accepted_document_types || [];
      if (!acceptedTypes.includes(record.document_type)) return false;

      // Rule 2: Status = processed
      if (record.status !== 'processed') return false;

      // Rule 3: Expiry
      if (record.expiry_date) {
        const expiryDate = new Date(record.expiry_date);
        if (expiryDate < now) return false;
      }

      // Rule 4: External verification status
      if (record.external_verification_status === 'source_rejected') return false;

      // Check explicit rules if any (future-proofing as per spec)
      if (req.rules?.requires_source_verification === true) {
         if (record.external_verification_status !== 'source_verified') {
            return false;
         }
      }

      return true;
    });

    if (candidates.length > 0) {
      // Rule 6: Duplicate/Multiple Candidates Priority
      candidates.sort((a, b) => {
        // a. Verification state (prefer 'source_verified' over others)
        const aVerified = a.external_verification_status === 'source_verified' ? 1 : 0;
        const bVerified = b.external_verification_status === 'source_verified' ? 1 : 0;
        if (aVerified !== bVerified) return bVerified - aVerified;

        // b. latest updated_at
        const aTime = new Date(a.updated_at).getTime();
        const bTime = new Date(b.updated_at).getTime();
        if (aTime !== bTime) return bTime - aTime;

        // c. record id tie breaker
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
      });

      const selected = candidates[0];

      matched.push({
        requirement: req,
        required: isRequired,
        matched: true,
        record: selected
      });

      if (isRequired) requiredMatchedCount++;
    } else {
      missing.push({
        requirement: req,
        required: isRequired,
        matched: false,
        reason: 'No eligible records found'
      });
    }
  }

  // 8. Calculate readiness
  let readiness = 100;
  if (requiredCount > 0) {
    readiness = Math.round((requiredMatchedCount / requiredCount) * 100);
  }

  // 7. Return structured internal result
  return {
    readiness_percent: readiness,
    matched,
    missing,
    attention_needed
  };
}

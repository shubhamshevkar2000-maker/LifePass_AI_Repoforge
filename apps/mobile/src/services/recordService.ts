import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  RecordItem,
  RecordCategory,
  CreateRecordInput,
} from '@lifepass/shared';

export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
  isBackendAvailable?: boolean;
}

/**
 * Clearly labelled development fixtures.
 * Used ONLY when the PostgreSQL public.records table is not yet provisioned
 * by Workstream 1 (Nidhi), allowing safe UI inspection and verification
 * without pretending the backend is complete.
 */
export const DEV_FIXTURE_RECORDS: RecordItem[] = [
  {
    id: 'dev-fix-001',
    user_id: 'dev-citizen-user',
    title: 'Aadhaar Card (National Identity)',
    category: 'identity',
    document_type: 'national_id',
    issuer_name: 'UIDAI',
    issue_date: '2021-04-15',
    expiry_date: null,
    status: 'processed',
    external_verification_status: 'not_verified',
    source_type: 'upload',
    storage_path: 'dev-citizen-user/aadhaar_card_masked.pdf',
    mime_type: 'application/pdf',
    file_size: 245760,
    metadata: {
      notes: 'Development fixture representing verified format',
      is_dev_fixture: true,
    },
    created_at: '2026-09-15T10:00:00Z',
    updated_at: '2026-09-15T10:05:00Z',
  },
  {
    id: 'dev-fix-002',
    user_id: 'dev-citizen-user',
    title: 'B.Tech Degree Certificate',
    category: 'education',
    document_type: 'degree_certificate',
    issuer_name: 'State Technical University',
    issue_date: '2024-06-30',
    expiry_date: null,
    status: 'processed',
    external_verification_status: 'not_verified',
    source_type: 'upload',
    storage_path: 'dev-citizen-user/degree_certificate.pdf',
    mime_type: 'application/pdf',
    file_size: 512000,
    metadata: {
      degree: 'Computer Science & Engineering',
      is_dev_fixture: true,
    },
    created_at: '2026-09-16T11:20:00Z',
    updated_at: '2026-09-16T11:25:00Z',
  },
  {
    id: 'dev-fix-003',
    user_id: 'dev-citizen-user',
    title: 'Employment Offer Letter',
    category: 'employment',
    document_type: 'offer_letter',
    issuer_name: 'FinTech Technologies Ltd',
    issue_date: '2024-08-01',
    expiry_date: null,
    status: 'uploaded',
    external_verification_status: 'not_verified',
    source_type: 'upload',
    storage_path: 'dev-citizen-user/employment_offer.pdf',
    mime_type: 'application/pdf',
    file_size: 184320,
    metadata: {
      role: 'Software Engineer',
      is_dev_fixture: true,
    },
    created_at: '2026-09-20T08:15:00Z',
    updated_at: '2026-09-20T08:15:00Z',
  },
  {
    id: 'dev-fix-004',
    user_id: 'dev-citizen-user',
    title: 'Bank Statement (Last 6 Months)',
    category: 'finance',
    document_type: 'bank_statement',
    issuer_name: 'Apex National Bank',
    issue_date: '2026-08-31',
    expiry_date: '2026-11-30',
    status: 'needs_review',
    external_verification_status: 'not_verified',
    source_type: 'upload',
    storage_path: 'dev-citizen-user/bank_statement_aug2026.pdf',
    mime_type: 'application/pdf',
    file_size: 892000,
    metadata: {
      account_type: 'Savings',
      is_dev_fixture: true,
    },
    created_at: '2026-09-25T14:40:00Z',
    updated_at: '2026-09-25T14:45:00Z',
  },
];

/**
 * Checks whether an error is due to missing backend tables/buckets
 */
const isTableMissingError = (err: any): boolean => {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const code = err.code || '';
  return (
    code === '42P01' || // PostgreSQL undefined_table
    code === 'PGRST204' ||
    code === 'PGRST200' ||
    msg.includes('relation "public.records" does not exist') ||
    msg.includes('relation "records" does not exist') ||
    msg.includes('does not exist') ||
    msg.includes('not found')
  );
};

/**
 * Fetch records for the authenticated citizen from Supabase PostgreSQL public.records.
 * Enforces RLS: auth.uid() = records.user_id.
 */
export const listRecords = async (category?: RecordCategory): Promise<ServiceResult<RecordItem[]>> => {
  if (!isSupabaseConfigured) {
    return {
      data: category
        ? DEV_FIXTURE_RECORDS.filter((r) => r.category === category)
        : DEV_FIXTURE_RECORDS,
      error: 'Supabase client environment is not configured. Displaying labeled development fixtures.',
      isBackendAvailable: false,
    };
  }

  try {
    const { data: respData, error: respError } = await supabase.functions.invoke('records', {
      method: 'GET'
    });

    if (respError) {
      if (isTableMissingError(respError)) {
        // Backend migration not yet applied by Workstream 1
        const filtered = category
          ? DEV_FIXTURE_RECORDS.filter((r) => r.category === category)
          : DEV_FIXTURE_RECORDS;
        return {
          data: filtered,
          error:
            'Backend table "public.records" is not yet provisioned in PostgreSQL (Phase 2 backend pending). Displaying labeled development fixtures.',
          isBackendAvailable: false,
        };
      }
      return { data: null, error: respError.message, isBackendAvailable: true };
    }

    let finalData = respData;
    if (category) { finalData = finalData.filter((r: any) => r.category === category); }

    return { data: (finalData as RecordItem[]) || [], error: null, isBackendAvailable: true };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Failed to fetch personal records from database.',
      isBackendAvailable: false,
    };
  }
};

/**
 * Fetch a single record by ID for the authenticated citizen.
 */
export const getRecord = async (recordId: string): Promise<ServiceResult<RecordItem>> => {
  // Check development fixtures first if ID matches
  const fixtureMatch = DEV_FIXTURE_RECORDS.find((r) => r.id === recordId);

  if (!isSupabaseConfigured) {
    if (fixtureMatch) {
      return { data: fixtureMatch, error: null, isBackendAvailable: false };
    }
    return { data: null, error: 'Record not found in development fixtures.', isBackendAvailable: false };
  }

  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('id', recordId)
      .single();

    if (error) {
      if (isTableMissingError(error) && fixtureMatch) {
        return {
          data: fixtureMatch,
          error: 'Backend table not provisioned. Displaying development fixture.',
          isBackendAvailable: false,
        };
      }
      return { data: null, error: error.message, isBackendAvailable: true };
    }

    return { data: data as RecordItem, error: null, isBackendAvailable: true };
  } catch (err: any) {
    if (fixtureMatch) {
      return { data: fixtureMatch, error: null, isBackendAvailable: false };
    }
    return { data: null, error: err?.message || 'Failed to retrieve record.', isBackendAvailable: false };
  }
};

/**
 * Upload a document file to the PRIVATE records storage bucket.
 * Bucket: records
 * Path: {userId}/{timestamp}_{cleanFileName}
 */
export const uploadRecordFile = async (
  userId: string,
  fileUri: string,
  fileName: string,
  mimeType: string
): Promise<{ storagePath: string | null; error: string | null }> => {
  if (!isSupabaseConfigured) {
    return {
      storagePath: null,
      error: 'Supabase storage is not configured. Provide live EXPO_PUBLIC_SUPABASE_URL and anon key.',
    };
  }

  try {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${Date.now()}_${cleanFileName}`;

    // Read local file from Expo URI
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('records')
      .upload(storagePath, blob, {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      return {
        storagePath: null,
        error: `Storage upload failed: ${uploadError.message}. Ensure private 'records' bucket exists in Supabase Storage.`,
      };
    }

    return { storagePath, error: null };
  } catch (err: any) {
    return {
      storagePath: null,
      error: err?.message || 'Unexpected failure reading or uploading document file.',
    };
  }
};

/**
 * Insert record metadata into public.records table.
 * Authoritative schema: docs/DATABASE_SCHEMA.md Section 3.
 */
export const createRecordMetadata = async (
  userId: string,
  input: CreateRecordInput
): Promise<ServiceResult<RecordItem>> => {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: 'Supabase client environment is not configured.',
      isBackendAvailable: false,
    };
  }

  try {
    const payload = {
      user_id: userId,
      title: input.title.trim(),
      category: input.category,
      document_type: input.document_type.trim(),
      issuer_name: input.issuer_name?.trim() || null,
      issue_date: input.issue_date || null,
      expiry_date: input.expiry_date || null,
      status: 'uploaded' as const,
      external_verification_status: 'not_verified' as const,
      source_type: input.source_type || 'upload',
      storage_path: input.storage_path,
      mime_type: input.mime_type,
      file_size: input.file_size,
      metadata: input.metadata || {},
    };

    const { data, error } = await supabase.functions.invoke('records', {
      method: 'POST',
      body: payload
    });

    if (error) {
      if (isTableMissingError(error)) {
        return {
          data: null,
          error:
            'Database error: public.records table does not exist in PostgreSQL. Workstream 1 migration required before persisting records.',
          isBackendAvailable: false,
        };
      }
      return { data: null, error: error.message, isBackendAvailable: true };
    }

    return { data: data as RecordItem, error: null, isBackendAvailable: true };
  } catch (err: any) {
    return {
      data: null,
      error: err?.message || 'Failed to create record metadata in database.',
      isBackendAvailable: false,
    };
  }
};

/**
 * Request a temporary signed URL for private document viewing.
 * NEVER creates or exposes permanent public URLs.
 */
export const getSignedDocumentUrl = async (
  storagePath: string,
  expiresInSeconds: number = 300
): Promise<{ signedUrl: string | null; error: string | null }> => {
  if (!isSupabaseConfigured) {
    return {
      signedUrl: null,
      error: 'Supabase storage is not configured.',
    };
  }

  try {
    const { data, error } = await supabase.storage
      .from('records')
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error) {
      return { signedUrl: null, error: error.message };
    }

    return { signedUrl: data?.signedUrl || null, error: null };
  } catch (err: any) {
    return { signedUrl: null, error: err?.message || 'Failed to generate signed document URL.' };
  }
};

/**
 * Delete / archive record by ID.
 * Follows RLS policy: only owner can delete.
 */
export const deleteRecord = async (
  recordId: string,
  storagePath?: string
): Promise<{ success: boolean; error: string | null }> => {
  if (!isSupabaseConfigured) {
    // If it's a fixture in dev mode
    const idx = DEV_FIXTURE_RECORDS.findIndex((r) => r.id === recordId);
    if (idx !== -1) {
      DEV_FIXTURE_RECORDS.splice(idx, 1);
      return { success: true, error: null };
    }
    return { success: false, error: 'Database not configured.' };
  }

  try {
    const { error: dbError } = await supabase
      .from('records')
      .delete()
      .eq('id', recordId);

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    // Clean up private storage file if path was provided
    if (storagePath) {
      await supabase.storage.from('records').remove([storagePath]);
    }

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete record.' };
  }
};

export const processRecord = async (recordId: string): Promise<ServiceResult<RecordItem>> => {
  if (!isSupabaseConfigured) {
    return { data: null, error: 'Database not configured.', isBackendAvailable: false };
  }
  try {
    const { data, error } = await supabase.functions.invoke(`records/${recordId}/process`, {
      method: 'POST'
    });
    if (error) return { data: null, error: error.message, isBackendAvailable: true };
    return { data: data as RecordItem, error: null, isBackendAvailable: true };
  } catch (err: any) {
    return { data: null, error: err?.message, isBackendAvailable: false };
  }
};

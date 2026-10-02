-- ============================================================
-- LIFEPASS AI — PHASE 2 DATABASE MIGRATION
-- Storage buckets and policies
-- ============================================================

-- 1. Create the private records bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'records',
    'records',
    false,
    52428800, -- 50 MB
    '{"application/pdf","image/jpeg","image/png","image/webp"}'
)
ON CONFLICT (id) DO UPDATE
SET public = false;

-- 2. Storage Policies

-- INSERT: User can upload only to their own folder (path first segment == auth.uid())
CREATE POLICY "records_storage_insert_own"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'records' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- SELECT: User can read if they own the folder OR if they can read the corresponding record
CREATE POLICY "records_storage_select"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'records' AND
    auth.role() = 'authenticated' AND
    (
        (storage.foldername(name))[1] = auth.uid()::text
        OR
        EXISTS (
            SELECT 1 FROM public.records
            WHERE public.records.storage_path = storage.objects.name
        )
    )
);

-- UPDATE: User can update their own files
CREATE POLICY "records_storage_update_own"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'records' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'records' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE: User can delete their own files
CREATE POLICY "records_storage_delete_own"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'records' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

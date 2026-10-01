-- ============================================================
-- LIFEPASS AI — PHASE 1 SEED DATA FIXTURES
-- ============================================================

-- Seed Institutions (Predefined Institutions for Testing / Workflows)
INSERT INTO public.institutions (id, name, type, status)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'National Education Loan Authority', 'bank', 'active'),
    ('a0000000-0000-0000-0000-000000000002', 'Apex Technology Institute', 'university', 'active')
ON CONFLICT (id) DO NOTHING;

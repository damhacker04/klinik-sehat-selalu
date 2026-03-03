-- ============================================================
-- FIX: Trigger handle_new_user() — search_path + auto-create pasien
-- Jalankan di Supabase SQL Editor JIKA sudah run migration sebelumnya
-- TIDAK PERLU dijalankan jika menggunakan run-all-migrations.sql terbaru
-- ============================================================

-- Fix 1: Update handle_new_user() dengan auto-create pasien
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    _role public.user_role;
BEGIN
    _role := COALESCE(NEW.raw_user_meta_data->>'role', 'pasien')::public.user_role;

    -- 1. Create user_accounts entry
    INSERT INTO public.user_accounts (id, email, role, status)
    VALUES (NEW.id, NEW.email, _role, 'active');

    -- 2. Auto-create pasien profile if role = pasien AND nik is provided
    IF _role = 'pasien' AND COALESCE(NEW.raw_user_meta_data->>'nik', '') != '' THEN
        INSERT INTO public.pasien (user_id, nama, nik, email)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'nama', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'nik',
            NEW.email
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 2: Update get_user_role() dengan explicit search_path
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.user_accounts WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public, auth;

-- Fix 3: Backfill user_accounts untuk user yang sudah register sebelumnya
INSERT INTO public.user_accounts (id, email, role, status)
SELECT id, email, 'pasien'::public.user_role, 'active'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.user_accounts)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- DONE!
-- ============================================================

-- ============================================
-- Google OAuth Authentication Setup
-- ============================================
-- This script sets up Google OAuth authentication with email whitelist
-- Only teachers registered in the 'teachers' table can log in
-- ============================================

-- Step 1: Add auth_user_id column to teachers table
-- Links teachers to Supabase auth.users
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_teachers_auth_user_id ON public.teachers(auth_user_id);

-- Add comment
COMMENT ON COLUMN public.teachers.auth_user_id IS 'Foreign key linking to auth.users - set automatically on first login';

-- ============================================
-- Step 2: Create whitelist validation function (Auth Hook)
-- ============================================
-- This function is called BEFORE a user is created via OAuth
-- It checks if the email exists in the teachers table
CREATE OR REPLACE FUNCTION public.check_teacher_whitelist(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
  is_whitelisted boolean;
BEGIN
  -- Extract email from the event payload
  user_email := event->'user'->>'email';

  -- Check if email exists in teachers table and is active
  SELECT EXISTS(
    SELECT 1 FROM public.teachers
    WHERE lower(email) = lower(user_email)
    AND is_active = true
  ) INTO is_whitelisted;

  -- If not whitelisted, reject signup
  IF NOT is_whitelisted THEN
    RETURN jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Acesso restrito. Apenas professores autorizados podem fazer login.'
      )
    );
  END IF;

  -- Allow signup
  RETURN jsonb_build_object();
END;
$$;

-- Grant permissions to Supabase auth
GRANT EXECUTE ON FUNCTION public.check_teacher_whitelist TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.check_teacher_whitelist FROM authenticated, anon, public;

-- Add comment
COMMENT ON FUNCTION public.check_teacher_whitelist IS 'Auth hook to validate teacher email before allowing Google OAuth signup';

-- ============================================
-- Step 3: Create auto-linking trigger
-- ============================================
-- Automatically links teachers to auth.users after successful login
CREATE OR REPLACE FUNCTION public.link_teacher_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  teacher_id_val integer;
BEGIN
  -- Find teacher by email and link to auth.users
  UPDATE public.teachers
  SET auth_user_id = NEW.id,
      updated_at = NOW()
  WHERE lower(email) = lower(NEW.email)
  AND auth_user_id IS NULL
  RETURNING id INTO teacher_id_val;

  -- Log success
  IF teacher_id_val IS NOT NULL THEN
    RAISE NOTICE 'Teacher % linked to auth user %', teacher_id_val, NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_teacher_auth_created ON auth.users;

CREATE TRIGGER on_teacher_auth_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.link_teacher_on_signup();

-- Add comment
COMMENT ON FUNCTION public.link_teacher_on_signup IS 'Automatically links teachers.auth_user_id to auth.users.id on first login';

-- ============================================
-- Step 4: Update RLS Policies
-- ============================================
-- Replace public access with authenticated-only access

-- STUDENTS TABLE
DROP POLICY IF EXISTS "Allow public read access" ON students;
DROP POLICY IF EXISTS "Allow public insert access" ON students;
DROP POLICY IF EXISTS "Allow public update access" ON students;
DROP POLICY IF EXISTS "Allow public delete access" ON students;

CREATE POLICY "Teachers can read students" ON students
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can insert students" ON students
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can update students" ON students
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can delete students" ON students
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- ATTENDANCE_RECORDS TABLE
DROP POLICY IF EXISTS "Allow public read access" ON attendance_records;
DROP POLICY IF EXISTS "Allow public insert access" ON attendance_records;
DROP POLICY IF EXISTS "Allow public update access" ON attendance_records;
DROP POLICY IF EXISTS "Allow public delete access" ON attendance_records;

CREATE POLICY "Teachers can read attendance" ON attendance_records
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can create attendance" ON attendance_records
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can update attendance" ON attendance_records
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can delete attendance" ON attendance_records
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- SCHEDULES TABLE
DROP POLICY IF EXISTS "Allow public read access" ON schedules;
DROP POLICY IF EXISTS "Allow public insert access" ON schedules;
DROP POLICY IF EXISTS "Allow public update access" ON schedules;
DROP POLICY IF EXISTS "Allow public delete access" ON schedules;

CREATE POLICY "Teachers can read schedules" ON schedules
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can create schedules" ON schedules
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can update schedules" ON schedules
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can delete schedules" ON schedules
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- SCHEDULE_ASSIGNMENTS TABLE
DROP POLICY IF EXISTS "Allow public read access" ON schedule_assignments;
DROP POLICY IF EXISTS "Allow public insert access" ON schedule_assignments;
DROP POLICY IF EXISTS "Allow public update access" ON schedule_assignments;
DROP POLICY IF EXISTS "Allow public delete access" ON schedule_assignments;

CREATE POLICY "Teachers can read assignments" ON schedule_assignments
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can create assignments" ON schedule_assignments
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can update assignments" ON schedule_assignments
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can delete assignments" ON schedule_assignments
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- LESSONS TABLE
DROP POLICY IF EXISTS "Allow public read access" ON lessons;
DROP POLICY IF EXISTS "Allow public insert access" ON lessons;
DROP POLICY IF EXISTS "Allow public update access" ON lessons;
DROP POLICY IF EXISTS "Allow public delete access" ON lessons;

CREATE POLICY "Teachers can read lessons" ON lessons
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can create lessons" ON lessons
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can update lessons" ON lessons
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can delete lessons" ON lessons
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- SERVICE_TIMES TABLE
DROP POLICY IF EXISTS "Allow public read access" ON service_times;
DROP POLICY IF EXISTS "Allow public insert access" ON service_times;
DROP POLICY IF EXISTS "Allow public update access" ON service_times;
DROP POLICY IF EXISTS "Allow public delete access" ON service_times;

CREATE POLICY "Teachers can read service times" ON service_times
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can create service times" ON service_times
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can update service times" ON service_times
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Teachers can delete service times" ON service_times
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- TEACHERS TABLE (read-only for all authenticated users)
DROP POLICY IF EXISTS "Allow public read access" ON teachers;
DROP POLICY IF EXISTS "Allow public insert access" ON teachers;
DROP POLICY IF EXISTS "Allow public update access" ON teachers;
DROP POLICY IF EXISTS "Allow public delete access" ON teachers;

CREATE POLICY "Teachers can view all teachers" ON teachers
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Note: Insert/Update/Delete for teachers table should be admin-only in future
-- For now, no one can modify teachers via the app (managed via SQL/admin tools)

-- ============================================
-- Step 5: Verification Queries
-- ============================================
-- Run these to verify setup is correct

-- Check auth_user_id column exists
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'teachers' AND column_name = 'auth_user_id';

-- Check functions exist
-- SELECT routine_name
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
-- AND routine_name IN ('check_teacher_whitelist', 'link_teacher_on_signup');

-- Check triggers exist
-- SELECT trigger_name, event_object_table, action_statement
-- FROM information_schema.triggers
-- WHERE trigger_name = 'on_teacher_auth_created';

-- Check RLS policies
-- SELECT tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Next steps (MANUAL - do in Supabase Dashboard):
-- 1. Enable Google OAuth provider in Supabase Dashboard
-- 2. Add Google Client ID and Client Secret
-- 3. Enable auth hook: Authentication → Hooks → Before User Created
--    Select function: public.check_teacher_whitelist
-- ============================================

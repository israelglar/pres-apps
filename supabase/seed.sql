-- ============================================================================
-- Seed Data for Local Development
-- ============================================================================
-- This file provides realistic sample data for testing the Prés App locally
-- Run with: supabase db reset (or it runs automatically on first start)
-- ============================================================================

-- Clear existing data (for idempotent seeds)
TRUNCATE students, lessons, schedules, schedule_assignments, attendance_records CASCADE;

-- Note: service_times and teachers tables are already seeded by schema.sql
-- We don't truncate them to preserve the pre-populated data

-- ============================================================================
-- Seed 0: Test Users for Local Development
-- ============================================================================
-- Create test users in auth.users for local authentication testing
-- These users allow testing different role-based permissions

-- IMPORTANT: These test users are ONLY for local development!
-- In production, only Google OAuth authentication is used.

-- Test User 1: Admin (full access)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'authenticated',
  'authenticated',
  'admin@test.local',
  crypt('admin123', gen_salt('bf')), -- Password: admin123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Teacher"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Test User 2: Regular Teacher (standard access)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'authenticated',
  'authenticated',
  'teacher@test.local',
  crypt('teacher123', gen_salt('bf')), -- Password: teacher123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Regular Teacher"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Test User 3: Viewer (read-only access)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'authenticated',
  'authenticated',
  'viewer@test.local',
  crypt('viewer123', gen_salt('bf')), -- Password: viewer123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Viewer Only"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Add these test users to the teachers whitelist with appropriate roles
-- Note: Using VARCHAR role values as defined in initial_schema.sql
INSERT INTO teachers (email, name, is_active, role) VALUES
  ('admin@test.local', 'Admin Teacher', true, 'admin'),
  ('teacher@test.local', 'Regular Teacher', true, 'teacher'),
  ('viewer@test.local', 'Viewer Only', true, 'viewer')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  role = EXCLUDED.role;

-- ============================================================================
-- Seed 1: Students (15 sample students)
-- ============================================================================
INSERT INTO students (name, date_of_birth, status, is_visitor, notes) VALUES
  ('João Silva', '2012-03-15', 'active', false, 'Participativo nas discussões'),
  ('Maria Santos', '2011-07-22', 'active', false, 'Boa leitora da Bíblia'),
  ('Pedro Costa', '2012-11-08', 'active', false, NULL),
  ('Ana Rodrigues', '2011-05-14', 'active', false, 'Ajuda os mais novos'),
  ('Miguel Fernandes', '2012-09-30', 'active', false, NULL),
  ('Sofia Alves', '2011-12-18', 'active', false, 'Criativa nos trabalhos manuais'),
  ('Tiago Pereira', '2012-02-25', 'active', false, NULL),
  ('Beatriz Sousa', '2011-08-09', 'active', false, 'Memoriza versos facilmente'),
  ('Lucas Martins', '2012-06-12', 'active', false, NULL),
  ('Mariana Oliveira', '2011-10-03', 'active', false, 'Lidera bem os grupos'),
  ('Rafael Gonçalves', '2012-04-27', 'active', false, NULL),
  ('Carolina Dias', '2011-09-16', 'active', false, NULL),
  ('Diogo Ribeiro', '2012-01-20', 'active', false, 'Gosta de fazer perguntas'),
  ('Inês Carvalho', '2011-11-05', 'active', false, NULL),
  ('Teste Visitante', NULL, 'active', true, 'Amigo do João Silva');

-- ============================================================================
-- Seed 2: Lessons (10 sample lessons from Genesis and Exodus)
-- ============================================================================
INSERT INTO lessons (name, resource_url, description, curriculum_series, lesson_number) VALUES
  ('A Criação - No Princípio', 'https://example.com/lessons/genesis/01-criacao', 'Deus cria o mundo em seis dias', 'Genesis', 1),
  ('O Dilúvio - Noé e a Arca', 'https://example.com/lessons/genesis/02-noe', 'Noé constrói a arca e salva os animais', 'Genesis', 2),
  ('A Torre de Babel', 'https://example.com/lessons/genesis/03-babel', 'Os homens tentam construir uma torre até ao céu', 'Genesis', 3),
  ('Abraão - A Promessa de Deus', 'https://example.com/lessons/genesis/04-abraao', 'Deus promete fazer de Abraão uma grande nação', 'Genesis', 4),
  ('José e os Seus Irmãos', 'https://example.com/lessons/genesis/05-jose', 'José é vendido como escravo mas Deus está com ele', 'Genesis', 5),
  ('Moisés e a Sarça Ardente', 'https://example.com/lessons/exodus/01-moisés', 'Deus fala com Moisés numa sarça que arde', 'Exodus', 1),
  ('As Dez Pragas do Egito', 'https://example.com/lessons/exodus/02-pragas', 'Deus envia pragas para libertar o seu povo', 'Exodus', 2),
  ('A Páscoa e o Êxodo', 'https://example.com/lessons/exodus/03-pascoa', 'O povo de Israel sai do Egito', 'Exodus', 3),
  ('Os Dez Mandamentos', 'https://example.com/lessons/exodus/04-mandamentos', 'Deus dá a lei no Monte Sinai', 'Exodus', 4),
  ('O Bezerro de Ouro', 'https://example.com/lessons/exodus/05-bezerro', 'O povo peca e Moisés intercede', 'Exodus', 5);

-- ============================================================================
-- Seed 3: Schedules (5 past Sundays + 5 future Sundays, both services)
-- ============================================================================
DO $$
DECLARE
  service_9h_id INTEGER;
  service_11h_id INTEGER;
  lesson_ids INTEGER[];
  base_sunday DATE;
  schedule_date DATE;
  i INTEGER;
  lesson_idx INTEGER;
BEGIN
  -- Get service time IDs
  SELECT id INTO service_9h_id FROM service_times WHERE name = '9h' LIMIT 1;
  SELECT id INTO service_11h_id FROM service_times WHERE name = '11h' LIMIT 1;

  -- Get all lesson IDs in order
  SELECT ARRAY_AGG(id ORDER BY lesson_number) INTO lesson_ids FROM lessons;

  -- Find the most recent Sunday (or today if it's Sunday)
  base_sunday := CURRENT_DATE - ((EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 6) % 7);

  -- Generate schedules for past 5 Sundays
  FOR i IN 1..5 LOOP
    schedule_date := base_sunday - (i * 7);
    lesson_idx := ((6 - i - 1) % 10) + 1; -- Cycle through lessons

    -- Insert for 9h service
    INSERT INTO schedules (date, service_time_id, lesson_id, event_type, notes)
    VALUES (schedule_date, service_9h_id, lesson_ids[lesson_idx], 'regular', NULL);

    -- Insert for 11h service
    INSERT INTO schedules (date, service_time_id, lesson_id, event_type, notes)
    VALUES (schedule_date, service_11h_id, lesson_ids[lesson_idx], 'regular', NULL);
  END LOOP;

  -- Generate schedules for next 5 Sundays
  FOR i IN 0..4 LOOP
    schedule_date := base_sunday + (i * 7);
    lesson_idx := ((5 + i) % 10) + 1; -- Continue cycling through lessons

    -- Insert for 9h service
    INSERT INTO schedules (date, service_time_id, lesson_id, event_type, notes)
    VALUES (schedule_date, service_9h_id, lesson_ids[lesson_idx], 'regular', NULL);

    -- Insert for 11h service
    INSERT INTO schedules (date, service_time_id, lesson_id, event_type, notes)
    VALUES (schedule_date, service_11h_id, lesson_ids[lesson_idx], 'regular', NULL);
  END LOOP;

  RAISE NOTICE 'Created schedules from % to %', base_sunday - (5 * 7), base_sunday + (4 * 7);
END $$;

-- ============================================================================
-- Seed 4: Schedule Assignments (Assign teachers to schedules)
-- ============================================================================
-- Assign 2-3 teachers to each schedule
DO $$
DECLARE
  schedule_rec RECORD;
  teacher_rec RECORD;
  assignment_count INTEGER;
BEGIN
  -- Loop through all schedules
  FOR schedule_rec IN SELECT id FROM schedules LOOP
    assignment_count := 0;

    -- Assign 2-3 random teachers to each schedule
    FOR teacher_rec IN
      SELECT id FROM teachers
      WHERE is_active = true
      ORDER BY RANDOM()
      LIMIT 2 + FLOOR(RANDOM() * 2)::INTEGER  -- 2 or 3 teachers
    LOOP
      INSERT INTO schedule_assignments (schedule_id, teacher_id, role)
      VALUES (schedule_rec.id, teacher_rec.id, 'teacher')
      ON CONFLICT (schedule_id, teacher_id) DO NOTHING;

      assignment_count := assignment_count + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Created schedule assignments';
END $$;

-- ============================================================================
-- Seed 5: Sample Attendance Records
-- ============================================================================
-- Add attendance for the 2 most recent Sundays (9h service only)
DO $$
DECLARE
  schedule_id_1 INTEGER;
  schedule_id_2 INTEGER;
  service_9h_id INTEGER;
  student_rec RECORD;
  attendance_status TEXT;
  i INTEGER := 1;
BEGIN
  -- Get 9h service ID
  SELECT id INTO service_9h_id FROM service_times WHERE name = '9h' LIMIT 1;

  -- Get the 2 most recent schedule IDs for 9h service
  SELECT id INTO schedule_id_1
  FROM schedules
  WHERE service_time_id = service_9h_id
  AND date <= CURRENT_DATE
  ORDER BY date DESC
  LIMIT 1;

  SELECT id INTO schedule_id_2
  FROM schedules
  WHERE service_time_id = service_9h_id
  AND date <= CURRENT_DATE
  AND id != schedule_id_1
  ORDER BY date DESC
  LIMIT 1;

  -- Insert attendance for most recent Sunday (schedule_id_1)
  -- 10 present, 4 absent, 1 late
  FOR student_rec IN
    SELECT id FROM students WHERE is_visitor = false ORDER BY id LIMIT 15
  LOOP
    IF i <= 10 THEN
      attendance_status := 'present';
    ELSIF i <= 14 THEN
      attendance_status := 'absent';
    ELSE
      attendance_status := 'late';
    END IF;

    INSERT INTO attendance_records (student_id, schedule_id, status, service_time_id, marked_at)
    VALUES (student_rec.id, schedule_id_1, attendance_status, service_9h_id, NOW() - INTERVAL '1 day');

    i := i + 1;
  END LOOP;

  -- Insert attendance for second most recent Sunday (schedule_id_2)
  -- 11 present, 3 absent
  i := 1;
  FOR student_rec IN
    SELECT id FROM students WHERE is_visitor = false ORDER BY id LIMIT 14
  LOOP
    IF i <= 11 THEN
      attendance_status := 'present';
    ELSE
      attendance_status := 'absent';
    END IF;

    INSERT INTO attendance_records (student_id, schedule_id, status, service_time_id, marked_at)
    VALUES (student_rec.id, schedule_id_2, attendance_status, service_9h_id, NOW() - INTERVAL '8 days');

    i := i + 1;
  END LOOP;

  RAISE NOTICE 'Created attendance records for 2 recent Sundays';
END $$;

-- ============================================================================
-- Verification Queries (for debugging - commented out by default)
-- ============================================================================
-- SELECT COUNT(*) AS student_count FROM students;
-- SELECT COUNT(*) AS lesson_count FROM lessons;
-- SELECT COUNT(*) AS schedule_count FROM schedules;
-- SELECT COUNT(*) AS schedule_assignment_count FROM schedule_assignments;
-- SELECT COUNT(*) AS attendance_count FROM attendance_records;
--
-- -- Show recent schedules with lessons
-- SELECT s.date, st.name AS service, l.name AS lesson
-- FROM schedules s
-- JOIN service_times st ON s.service_time_id = st.id
-- JOIN lessons l ON s.lesson_id = l.id
-- WHERE s.date >= CURRENT_DATE - INTERVAL '2 weeks'
-- ORDER BY s.date DESC, st.display_order;

-- ============================================================================
-- Seed Complete!
-- ============================================================================
-- To reset and re-seed: supabase db reset
-- ============================================================================

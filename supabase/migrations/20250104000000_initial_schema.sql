-- ============================================================================
-- Pre-Teens Ministry Attendance App - Database Schema
-- ============================================================================
-- This SQL script creates all Phase 1 tables in Supabase
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- ==========================================================================
-- Table 1: students
-- ==========================================================================
CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  is_visitor BOOLEAN DEFAULT false,
  visitor_date DATE,
  date_of_birth DATE,
  age_group VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_active ON students(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_students_visitor ON students(is_visitor);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);

-- ==========================================================================
-- Table 2: teachers
-- ==========================================================================
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'teacher',
  is_active BOOLEAN DEFAULT true,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teachers_active ON teachers(is_active);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);

-- Insert teacher data
INSERT INTO teachers (name, email, role) VALUES
  ('Israel', 'israelab23@gmail.com', 'admin'),
  ('Jeisi', 'barbosadamasj@gmail.com', 'admin'),
  ('Ailton', 'dywqz93@gmail.com', 'teacher'),
  ('Isabel', 'isabel.ceandre@gmail.com', 'teacher'),
  ('Ivandro', 'ivandro.nascimentorodrigues@gmail.com', 'teacher'),
  ('Ana', 'anapazrodrigues@gmail.com', 'teacher'),
  ('Samuel', 'samuellevic15@gmail.com', 'teacher'),
  ('Margarida', 'margarida123asc@gmail.com', 'teacher')
ON CONFLICT (email) DO NOTHING;

-- ==========================================================================
-- Table 3: service_times
-- ==========================================================================
CREATE TABLE IF NOT EXISTS service_times (
  id SERIAL PRIMARY KEY,
  time TIME NOT NULL,
  name VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert service times
INSERT INTO service_times (time, name, display_order) VALUES
  ('09:00:00', '9h', 1),
  ('11:00:00', '11h', 2)
ON CONFLICT DO NOTHING;

-- ==========================================================================
-- Table 4: lessons
-- ==========================================================================
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  resource_url TEXT,
  curriculum_series VARCHAR(50),
  lesson_number INTEGER,
  description TEXT,
  is_special_event BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name)
);

CREATE INDEX IF NOT EXISTS idx_lessons_series ON lessons(curriculum_series);

-- ==========================================================================
-- Table 5: schedules
-- ==========================================================================
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  service_time_id INTEGER REFERENCES service_times(id),
  lesson_id INTEGER REFERENCES lessons(id),
  event_type VARCHAR(50) DEFAULT 'regular',
  notes TEXT,
  is_cancelled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, service_time_id)
);

CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(date);
CREATE INDEX IF NOT EXISTS idx_schedules_upcoming ON schedules(date) WHERE is_cancelled = false;

-- ==========================================================================
-- Table 6: schedule_assignments
-- ==========================================================================
CREATE TABLE IF NOT EXISTS schedule_assignments (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'teacher',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(schedule_id, teacher_id)
);

CREATE INDEX IF NOT EXISTS idx_schedule_assignments_schedule ON schedule_assignments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_teacher ON schedule_assignments(teacher_id);

-- ==========================================================================
-- Table 7: attendance_records
-- ==========================================================================
CREATE TABLE IF NOT EXISTS attendance_records (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  service_time_id INTEGER REFERENCES service_times(id),
  notes TEXT,
  marked_by INTEGER REFERENCES teachers(id),
  marked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, schedule_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_schedule ON attendance_records(schedule_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(schedule_id, status);

-- ==========================================================================
-- Enable Row Level Security (RLS)
-- ==========================================================================
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- ==========================================================================
-- Create permissive policies (public access for now, will add auth later)
-- ==========================================================================

-- Students policies
DROP POLICY IF EXISTS "Allow public read access" ON students;
DROP POLICY IF EXISTS "Allow public insert access" ON students;
DROP POLICY IF EXISTS "Allow public update access" ON students;
CREATE POLICY "Allow public read access" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON students FOR UPDATE USING (true);

-- Teachers policies
DROP POLICY IF EXISTS "Allow public read access" ON teachers;
CREATE POLICY "Allow public read access" ON teachers FOR SELECT USING (true);

-- Service times policies
DROP POLICY IF EXISTS "Allow public read access" ON service_times;
CREATE POLICY "Allow public read access" ON service_times FOR SELECT USING (true);

-- Lessons policies
DROP POLICY IF EXISTS "Allow public read access" ON lessons;
DROP POLICY IF EXISTS "Allow public insert access" ON lessons;
DROP POLICY IF EXISTS "Allow public update access" ON lessons;
CREATE POLICY "Allow public read access" ON lessons FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON lessons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON lessons FOR UPDATE USING (true);

-- Schedules policies
DROP POLICY IF EXISTS "Allow public read access" ON schedules;
DROP POLICY IF EXISTS "Allow public insert access" ON schedules;
DROP POLICY IF EXISTS "Allow public update access" ON schedules;
CREATE POLICY "Allow public read access" ON schedules FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON schedules FOR UPDATE USING (true);

-- Schedule assignments policies
DROP POLICY IF EXISTS "Allow public read access" ON schedule_assignments;
DROP POLICY IF EXISTS "Allow public insert access" ON schedule_assignments;
CREATE POLICY "Allow public read access" ON schedule_assignments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON schedule_assignments FOR INSERT WITH CHECK (true);

-- Attendance records policies
DROP POLICY IF EXISTS "Allow public read access" ON attendance_records;
DROP POLICY IF EXISTS "Allow public insert access" ON attendance_records;
DROP POLICY IF EXISTS "Allow public update access" ON attendance_records;
CREATE POLICY "Allow public read access" ON attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON attendance_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON attendance_records FOR UPDATE USING (true);

-- ============================================================================
-- Setup Complete!
-- ============================================================================
-- Next steps:
-- 1. Run the data migration script: npm run db:migrate
-- 2. Test the application: npm run dev
-- ============================================================================

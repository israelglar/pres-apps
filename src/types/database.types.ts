/**
 * Database Types
 * TypeScript interfaces matching DATABASE_SCHEMA.md
 * Generated for Supabase integration
 */

// ============================================================================
// Core Entity Types
// ============================================================================

export interface Student {
  id: number;
  name: string; // UNIQUE constraint in database
  is_visitor: boolean;
  visitor_date: string | null;
  date_of_birth: string | null;
  age_group: string | null;
  status: 'active' | 'inactive' | 'aged-out' | 'moved';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  is_active: boolean;
  phone: string | null;
  auth_user_id: string | null; // Links to auth.users.id after first login
  created_at: string;
  updated_at?: string;
}

export interface ServiceTime {
  id: number;
  time: string; // HH:MM:SS format (e.g., '09:00:00')
  name: string; // Display name (e.g., '9h', '11h')
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface Lesson {
  id: number;
  name: string;
  resource_url: string | null;
  curriculum_series: string | null; // 'Q4', 'Q2', 'Q6', 'Holiday'
  lesson_number: number | null;
  description: string | null;
  is_special_event: boolean;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  date: string; // YYYY-MM-DD format
  service_time_id: number | null;
  lesson_id: number | null;
  event_type: 'regular' | 'family_service' | 'cancelled' | 'retreat' | 'party';
  notes: string | null;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleAssignment {
  id: number;
  schedule_id: number;
  teacher_id: number;
  role: 'lead' | 'teacher' | 'assistant';
  created_at: string;
}

export interface AttendanceRecord {
  id: number;
  student_id: number;
  schedule_id: number;
  status: 'present' | 'absent' | 'excused' | 'late';
  service_time_id: number | null;
  notes: string | null;
  marked_by: number | null;
  marked_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Relationship Types (for queries with joins)
// ============================================================================

export interface ScheduleWithRelations extends Schedule {
  lesson?: Lesson;
  service_time?: ServiceTime;
  assignments?: (ScheduleAssignment & { teacher?: Teacher })[];
  attendance_records?: { count: number }[] | AttendanceRecord[];
}

export interface AttendanceRecordWithRelations extends AttendanceRecord {
  student?: Student;
  schedule?: ScheduleWithRelations;
}

// ============================================================================
// Insert Types (for creating new records)
// ============================================================================

export type StudentInsert = Omit<Student, 'id' | 'created_at' | 'updated_at'>;
export type TeacherInsert = Omit<Teacher, 'id' | 'created_at' | 'updated_at'>;
export type ServiceTimeInsert = Omit<ServiceTime, 'id' | 'created_at'>;
export type LessonInsert = Omit<Lesson, 'id' | 'created_at' | 'updated_at'>;
export type ScheduleInsert = Omit<Schedule, 'id' | 'created_at' | 'updated_at'>;
export type ScheduleAssignmentInsert = Omit<ScheduleAssignment, 'id' | 'created_at'>;
export type AttendanceRecordInsert = Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>;

// ============================================================================
// Update Types (for updating existing records)
// ============================================================================

export type StudentUpdate = Partial<Omit<Student, 'id' | 'created_at'>>;
export type TeacherUpdate = Partial<Omit<Teacher, 'id' | 'created_at'>>;
export type LessonUpdate = Partial<Omit<Lesson, 'id' | 'created_at'>>;
export type ScheduleUpdate = Partial<Omit<Schedule, 'id' | 'created_at'>>;
export type AttendanceRecordUpdate = Partial<Omit<AttendanceRecord, 'id' | 'created_at'>>;

// ============================================================================
// Database Schema Type (for Supabase client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      students: {
        Row: Student;
        Insert: StudentInsert;
        Update: StudentUpdate;
      };
      teachers: {
        Row: Teacher;
        Insert: TeacherInsert;
        Update: TeacherUpdate;
      };
      service_times: {
        Row: ServiceTime;
        Insert: ServiceTimeInsert;
        Update: Partial<ServiceTimeInsert>;
      };
      lessons: {
        Row: Lesson;
        Insert: LessonInsert;
        Update: LessonUpdate;
      };
      schedules: {
        Row: Schedule;
        Insert: ScheduleInsert;
        Update: ScheduleUpdate;
      };
      schedule_assignments: {
        Row: ScheduleAssignment;
        Insert: ScheduleAssignmentInsert;
        Update: Partial<ScheduleAssignmentInsert>;
      };
      attendance_records: {
        Row: AttendanceRecord;
        Insert: AttendanceRecordInsert;
        Update: AttendanceRecordUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

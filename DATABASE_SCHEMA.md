# Database Schema Documentation
## Pre-Teens Ministry Attendance App

**Version:** 1.0
**Date:** 2025-10-31
**Database Type:** PostgreSQL (recommended) or MySQL

---

## Overview

This database schema replaces the Google Sheets backend with a proper relational database structure. It supports all current features plus enables future enhancements like multiple service times, teacher scheduling, student carers, and attendance analytics.

### Key Features Supported
- Student management (~48 active students + visitors)
- Attendance tracking (multiple service times: 9h, 11h)
- Teacher scheduling and assignments
- Lesson curriculum management
- Student-carer relationships
- Lesson resources and feedback
- Historical data and analytics

---

## Database Tables

### 1. students

Stores all pre-teen students and visitors.

```sql
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  is_visitor BOOLEAN DEFAULT false,
  visitor_date DATE,                    -- First visit date for visitors
  date_of_birth DATE,                   -- For age tracking (future)
  age_group VARCHAR(50),                -- 'pre-teen', 'aged-out', etc.
  status VARCHAR(20) DEFAULT 'active',  -- 'active' | 'inactive' | 'aged-out' | 'moved'
  notes TEXT,                           -- General notes about student
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_students_active ON students(status) WHERE status = 'active';
CREATE INDEX idx_students_visitor ON students(is_visitor);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `name` - Full name of student (e.g., "Alice Lopes de Matos")
- `is_visitor` - True if student is a visitor (not regular attendee)
- `visitor_date` - Date of first visit (for visitors)
- `date_of_birth` - Birth date for age calculations (optional)
- `age_group` - Current age group status
- `status` - Current enrollment status
- `notes` - Any notes about the student
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Indexes:**
- Active students filter (most queries filter by active)
- Visitor flag for visitor-specific queries

---

### 2. teachers

All teachers and volunteers in the ministry.

```sql
CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) DEFAULT 'teacher',   -- 'admin' | 'teacher'
  is_active BOOLEAN DEFAULT true,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teachers_active ON teachers(is_active);
CREATE INDEX idx_teachers_email ON teachers(email);
```

**Pre-populated Data:**
```sql
INSERT INTO teachers (name, email, role) VALUES
  ('Israel', 'israelab23@gmail.com', 'admin'),
  ('Jeisi', 'barbosadamasj@gmail.com', 'admin'),
  ('Ailton', 'dywqz93@gmail.com', 'teacher'),
  ('Isabel', 'isabel.ceandre@gmail.com', 'teacher'),
  ('Ivandro', 'ivandro.nascimentorodrigues@gmail.com', 'teacher'),
  ('Ana', 'anapazrodrigues@gmail.com', 'teacher'),
  ('Samuel', 'samuellevic15@gmail.com', 'teacher'),
  ('Margarida', 'margarida123asc@gmail.com', 'teacher');
```

**Fields:**
- `id` - Auto-incrementing primary key
- `name` - Teacher's name
- `email` - Email address (used for Google OAuth login)
- `role` - Permission level ('admin' has full access, 'teacher' has limited access)
- `is_active` - Whether teacher is currently active in ministry
- `phone` - Contact phone number (optional)
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Roles:**
- **admin** - Israel and wife (full access to all features)
- **teacher** - Regular volunteers (attendance, view schedules, add feedback)

---

### 3. service_times

Defines available service times (9h, 11h, future expansions).

```sql
CREATE TABLE service_times (
  id SERIAL PRIMARY KEY,
  time TIME NOT NULL,                   -- '09:00:00', '11:00:00'
  name VARCHAR(50) NOT NULL,            -- '9h', '11h'
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO service_times (time, name, display_order) VALUES
  ('09:00:00', '9h', 1),
  ('11:00:00', '11h', 2);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `time` - Actual time of service (HH:MM:SS format)
- `name` - Display name for service ('9h', '11h')
- `is_active` - Whether this service time is currently active
- `display_order` - Order to show in UI dropdowns
- `created_at` - Record creation timestamp

**Usage:**
- Currently: 11h service only
- Planned: Add 9h service soon
- Future-proof for additional service times

---

### 4. lessons

Master catalog of all curriculum lessons.

```sql
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  resource_url TEXT,                    -- Google Drive link
  curriculum_series VARCHAR(50),        -- 'Q4', 'Q2', 'Q6', 'Holiday'
  lesson_number INTEGER,
  description TEXT,
  is_special_event BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(name)
);

CREATE INDEX idx_lessons_series ON lessons(curriculum_series);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `name` - Full lesson title (e.g., "Q4 1. How Could a Loving God Let People Go To Hell?")
- `resource_url` - Google Drive link to curriculum PDF
- `curriculum_series` - Series code ('Q4', 'Q2', 'Q6', 'Holiday')
- `lesson_number` - Lesson number within series (1, 2, 3...)
- `description` - Additional lesson description (optional)
- `is_special_event` - True for non-curriculum events (Reforma Protestante, Retiro, etc.)
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Examples:**
```sql
INSERT INTO lessons (name, resource_url, curriculum_series, lesson_number) VALUES
  ('Q4 1. How Could a Loving God Let People Go To Hell?',
   'https://drive.google.com/file/d/1diVFFL2kw8BQdSlJ6BTdQoXiCBFWlzCn/view',
   'Q4', 1),
  ('Reforma Protestante', NULL, NULL, NULL, true);
```

---

### 5. schedules

Main scheduling table - when lessons are taught, at which service time.

```sql
CREATE TABLE schedules (
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

CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_schedules_upcoming ON schedules(date) WHERE is_cancelled = false;
```

**Fields:**
- `id` - Auto-incrementing primary key
- `date` - Date of the lesson (YYYY-MM-DD)
- `service_time_id` - Foreign key to service_times (9h or 11h)
- `lesson_id` - Foreign key to lessons
- `event_type` - Type of event
  - `'regular'` - Normal lesson
  - `'family_service'` - Culto da Família (no pre-teen class)
  - `'cancelled'` - Cancelled class
  - `'retreat'` - Retiro Bíblico
  - `'party'` - Festa de Natal, special events
- `notes` - Observations (from "Obs." column in Escala sheet)
- `is_cancelled` - Whether this schedule is cancelled
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp

**Constraints:**
- One schedule per date+service_time combination (UNIQUE)

**Example:**
```sql
-- October 12, 2025, 11h service, Q4 Lesson 1
INSERT INTO schedules (date, service_time_id, lesson_id) VALUES
  ('2025-10-12', 2, 1);
```

---

### 6. schedule_assignments

Links teachers to specific schedules (many-to-many relationship).

```sql
CREATE TABLE schedule_assignments (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'teacher',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(schedule_id, teacher_id)
);

CREATE INDEX idx_schedule_assignments_schedule ON schedule_assignments(schedule_id);
CREATE INDEX idx_schedule_assignments_teacher ON schedule_assignments(teacher_id);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `schedule_id` - Foreign key to schedules
- `teacher_id` - Foreign key to teachers
- `role` - Teacher's role for this schedule
  - `'lead'` - Lead teacher
  - `'teacher'` - Regular teacher
  - `'assistant'` - Assistant/helper
- `created_at` - Record creation timestamp

**Constraints:**
- Same teacher can't be assigned twice to same schedule (UNIQUE)
- Cascading delete: If schedule deleted, assignments deleted too

**Example:**
```sql
-- Israel and Jeisi teaching October 12
INSERT INTO schedule_assignments (schedule_id, teacher_id, role) VALUES
  (1, 1, 'lead'),  -- Israel as lead
  (1, 2, 'teacher'); -- Jeisi as teacher
```

---

### 7. attendance_records

Core table: tracks student attendance for each schedule.

```sql
CREATE TABLE attendance_records (
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

CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_schedule ON attendance_records(schedule_id);
CREATE INDEX idx_attendance_status ON attendance_records(status);
CREATE INDEX idx_attendance_date ON attendance_records(schedule_id, status);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `student_id` - Foreign key to students
- `schedule_id` - Foreign key to schedules (combines date + service time)
- `status` - Attendance status:
  - `'present'` - Student was present
  - `'absent'` - Student was absent
  - `'excused'` - Excused absence (future)
  - `'late'` - Arrived late (future)
- `service_time_id` - Which service time student attended (9h vs 11h)
  - Important for tracking cross-service attendance (student goes to 9h instead of 11h)
- `notes` - Teacher observations (future feature: "Seemed tired", "Asked questions")
- `marked_by` - Which teacher marked the attendance
- `marked_at` - When attendance was marked
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp (for edits)

**Constraints:**
- One attendance record per student per schedule (UNIQUE)
- Cascading delete: If student/schedule deleted, attendance deleted too

**Example:**
```sql
-- Alice was present on October 12, marked by Israel
INSERT INTO attendance_records (student_id, schedule_id, status, service_time_id, marked_by) VALUES
  (1, 1, 'present', 2, 1);
```

**Migration Note:**
- Current Google Sheets has "P (9h)" notation
- In DB, this becomes: status='present' + service_time_id=1 (9h)

---

### 8. student_carers

Links students to their assigned carers (teachers responsible for shepherding).

```sql
CREATE TABLE student_carers (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(student_id, teacher_id)
);

CREATE INDEX idx_carers_teacher ON student_carers(teacher_id);
CREATE INDEX idx_carers_student ON student_carers(student_id);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `student_id` - Foreign key to students
- `teacher_id` - Foreign key to teachers (the carer)
- `assigned_at` - When carer was assigned
- `notes` - Special care notes for this relationship

**Purpose:**
- Implements "Meus Pré-adolescentes" (Carers List) feature
- Each teacher assigned 3-5 students to shepherd/mentor
- Currently managed in separate Excel file

**Example:**
```sql
-- Israel is carer for Alice, Gabriel, and Guilherme
INSERT INTO student_carers (student_id, teacher_id) VALUES
  (1, 1),  -- Alice → Israel
  (14, 1), -- Gabriel → Israel
  (17, 1); -- Guilherme → Israel
```

---

### 9. lesson_resources

Attachments and resources shared for specific lessons (future feature).

```sql
CREATE TABLE lesson_resources (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  resource_type VARCHAR(50),
  title VARCHAR(255),
  url TEXT,
  description TEXT,
  uploaded_by INTEGER REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_resources_schedule ON lesson_resources(schedule_id);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `schedule_id` - Foreign key to schedules
- `resource_type` - Type of resource:
  - `'link'` - External URL
  - `'file'` - Uploaded file
  - `'note'` - Text note
  - `'image'` - Image file
- `title` - Resource title
- `url` - URL or file path
- `description` - Resource description
- `uploaded_by` - Teacher who uploaded resource
- `created_at` - Upload timestamp

**Purpose:**
- Teachers can attach additional resources to lessons
- Share links, files, notes after teaching
- Build lesson history and resource library

---

### 10. lesson_feedback

Teacher feedback and ratings for lessons (future feature).

```sql
CREATE TABLE lesson_feedback (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  what_worked TEXT,
  what_didnt_work TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(schedule_id, teacher_id)
);

CREATE INDEX idx_feedback_schedule ON lesson_feedback(schedule_id);
CREATE INDEX idx_feedback_teacher ON lesson_feedback(teacher_id);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `schedule_id` - Foreign key to schedules
- `teacher_id` - Foreign key to teachers
- `rating` - 1-5 star rating of lesson
- `comments` - General comments
- `what_worked` - What worked well in the lesson
- `what_didnt_work` - What didn't work / needs improvement
- `created_at` - Feedback submission timestamp
- `updated_at` - Last edit timestamp

**Purpose:**
- Evaluate curriculum effectiveness
- Collaborative lesson improvement
- Decide when to change curriculum

**Constraints:**
- One feedback per teacher per schedule (UNIQUE)

---

## Entity Relationships

```
┌──────────────┐
│   students   │◄────┐
└──────────────┘     │
       │             │
       │ 1           │
       │             │ many
       ▼ many        │
┌──────────────────┐ │
│ attendance_      │ │
│   records        │ │
└──────────────────┘ │
       │             │
       │ many        │
       │             │
       ▼ 1           │
┌──────────────┐    │
│  schedules   │    │
└──────────────┘    │
   │  │  │          │
   │  │  │          │
   │  │  └──────────┤
   │  │     1       │
   │  │             │
   │  ├─► lesson_id │
   │  │             │
   │  └─► service_  │
   │       time_id  │
   │                │
   │ 1              │
   ▼ many           │
┌──────────────────┐│
│ schedule_        ││
│  assignments     ││
└──────────────────┘│
       │            │
       │ many       │
       │            │
       ▼ 1          │
┌──────────────┐   │
│  teachers    │◄──┘
└──────────────┘
       │
       │ 1
       │
       ▼ many
┌──────────────┐
│ student_     │
│  carers      │
└──────────────┘
       │
       │ many
       │
       ▼ 1
     (students)
```

**Key Relationships:**
1. **Students → Attendance Records** (1:many)
2. **Schedules → Attendance Records** (1:many)
3. **Schedules → Schedule Assignments** (1:many)
4. **Teachers → Schedule Assignments** (1:many)
5. **Teachers → Student Carers** (1:many)
6. **Students → Student Carers** (1:many)
7. **Lessons → Schedules** (1:many)
8. **Service Times → Schedules** (1:many)

---

## Data Migration from Google Sheets

### Source Sheets

1. **Presenças** - Students and attendance data
2. **Escala** - Teacher scheduling (not structured)
3. **Transformada** - Structured schedule data
4. **Calendario** - Teacher emails and lesson links
5. **Link licoes** - Lesson catalog

### Migration Steps

#### Step 1: Import Students
```sql
-- Source: "Presenças" sheet, rows 3-50
-- Extract student names, mark visitors from "# VISITAS" section

INSERT INTO students (name, is_visitor, visitor_date, status) VALUES
  ('Alice Lopes de Matos', false, NULL, 'active'),
  ('Alice Vieira Carvalho', false, NULL, 'active'),
  -- ... (48 total students)
  ('Miguel Camacho', true, '2025-10-19', 'active'); -- Visitor
```

#### Step 2: Import Lessons
```sql
-- Source: "Link licoes" sheet
-- Match with "Transformada" to get all unique lessons

INSERT INTO lessons (name, resource_url, curriculum_series, lesson_number) VALUES
  ('Q4 1. How Could a Loving God Let People Go To Hell?',
   'https://drive.google.com/file/d/1diVFFL2kw8BQdSlJ6BTdQoXiCBFWlzCn/view',
   'Q4', 1),
  ('Q4 2. Where Did God Come From?',
   'https://drive.google.com/file/d/1zSH9efL29Kx23AuhMNBG5lLrg8aD58g5/view',
   'Q4', 2),
  -- ... (continue for all lessons)
  ('Reforma Protestante', NULL, NULL, NULL, true); -- Special event
```

#### Step 3: Import Schedules
```sql
-- Source: "Transformada" sheet
-- Each row = one schedule entry
-- Parse datetime to extract date and service time

INSERT INTO schedules (date, service_time_id, lesson_id, event_type) VALUES
  ('2025-10-12', 1, 1, 'regular'),  -- 9h service
  ('2025-10-12', 2, 1, 'regular'),  -- 11h service
  ('2025-10-19', 2, 2, 'regular'),
  -- ...
  ('2025-11-02', NULL, NULL, 'family_service'), -- Culto da Família
  ('2025-12-21', NULL, NULL, 'party');          -- Festa de Natal
```

#### Step 4: Import Schedule Assignments
```sql
-- Source: "Transformada" sheet, "Equipa" column
-- Parse teacher names (split by newlines)

-- October 12, 9h: Israel e Jeisi
INSERT INTO schedule_assignments (schedule_id, teacher_id, role) VALUES
  (1, 1, 'lead'),   -- Israel
  (1, 2, 'teacher'); -- Jeisi

-- October 12, 11h: Israel e Jeisi
INSERT INTO schedule_assignments (schedule_id, teacher_id, role) VALUES
  (2, 1, 'lead'),
  (2, 2, 'teacher');

-- October 19, 11h: Ailton e Isabel
INSERT INTO schedule_assignments (schedule_id, teacher_id, role) VALUES
  (3, 3, 'lead'),   -- Ailton
  (3, 4, 'teacher'); -- Isabel
```

**Parsing Logic:**
```javascript
// Parse "Equipa" field: "Israel e Jeisi\nSamuel"
const equipaText = "Israel e Jeisi\nSamuel";
const lines = equipaText.split('\n');
const teachers = lines.flatMap(line =>
  line.split(/\s+e\s+/).map(name => name.trim())
);
// Result: ["Israel", "Jeisi", "Samuel"]
```

#### Step 5: Import Attendance Records
```sql
-- Source: "Presenças" sheet
-- Columns C onwards are dates (12/10/25, 19/10/25, 26/10/25)
-- Each cell: "P" = present, "F" = absent, "P (9h)" = present at 9h

-- For each student row, for each date column:
INSERT INTO attendance_records
  (student_id, schedule_id, status, service_time_id, marked_at) VALUES
  (1, 2, 'absent', 2, '2025-10-12 11:30:00'),   -- Alice F on 12/10
  (2, 2, 'present', 2, '2025-10-12 11:30:00'),  -- Alice V. P on 12/10
  (8, 1, 'present', 1, '2025-10-12 09:30:00'),  -- Benjamin P (9h) on 12/10
  -- ... (continue for all dates and students)
```

**Special Cases:**
- `"P (9h)"` → status='present' + service_time_id=1
- `"P"` → status='present' + service_time_id=2 (default 11h)
- `"F"` → status='absent'
- Empty cell → No record (not marked yet)

---

## API Endpoints (Proposed)

### Students

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/students` | List all active students | Teacher |
| GET | `/api/students/:id` | Get student details | Teacher |
| GET | `/api/students/:id/attendance` | Student attendance history | Teacher |
| POST | `/api/students` | Add new student/visitor | Teacher |
| PUT | `/api/students/:id` | Update student info | Admin |
| DELETE | `/api/students/:id` | Soft delete student | Admin |

### Attendance

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/attendance?date={date}&service={id}` | Get attendance for date/service | Teacher |
| POST | `/api/attendance/bulk` | Bulk save attendance (current) | Teacher |
| PUT | `/api/attendance/:id` | Edit single attendance record | Teacher |
| GET | `/api/attendance/summary` | Summary stats | Teacher |
| GET | `/api/attendance/alerts` | Students absent 3+ times | Teacher |

### Schedules

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/schedules?date={date}` | Get schedule for date | Teacher |
| GET | `/api/schedules/upcoming?limit=5` | Next N schedules | Teacher |
| GET | `/api/schedules/:id` | Schedule details with teachers | Teacher |
| POST | `/api/schedules` | Create schedule | Admin |
| PUT | `/api/schedules/:id` | Update schedule | Admin |
| DELETE | `/api/schedules/:id` | Cancel schedule | Admin |

### Teachers

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/teachers` | List all teachers | Teacher |
| GET | `/api/teachers/:id/schedules` | Teacher's assigned dates | Teacher |
| GET | `/api/teachers/:id/carers` | Students assigned to teacher | Teacher |
| POST | `/api/student-carers` | Assign carer to student | Admin |
| DELETE | `/api/student-carers/:id` | Remove carer assignment | Admin |

### Lessons

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/lessons` | List all lessons | Teacher |
| GET | `/api/lessons/:id` | Lesson details | Teacher |
| POST | `/api/lessons/:id/resources` | Add resource to lesson | Teacher |
| POST | `/api/lessons/:id/feedback` | Add teacher feedback | Teacher |
| GET | `/api/lessons/:id/feedback` | Get lesson feedback | Teacher |

---

## Frontend Integration Changes

### Updated Data Models

**New TypeScript interfaces:**
```typescript
// src/types/database.ts

export interface Student {
  id: number;
  name: string;
  isVisitor: boolean;
  visitorDate?: Date;
  dateOfBirth?: Date;
  ageGroup?: string;
  status: 'active' | 'inactive' | 'aged-out' | 'moved';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Teacher {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher';
  isActive: boolean;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceTime {
  id: number;
  time: string;
  name: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Lesson {
  id: number;
  name: string;
  resourceUrl?: string;
  curriculumSeries?: string;
  lessonNumber?: number;
  description?: string;
  isSpecialEvent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Schedule {
  id: number;
  date: Date;
  serviceTimeId: number;
  lessonId?: number;
  eventType: 'regular' | 'family_service' | 'cancelled' | 'retreat' | 'party';
  notes?: string;
  isCancelled: boolean;
  lesson?: Lesson;
  serviceTime?: ServiceTime;
  assignments?: ScheduleAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleAssignment {
  id: number;
  scheduleId: number;
  teacherId: number;
  role: 'lead' | 'teacher' | 'assistant';
  teacher?: Teacher;
  createdAt: Date;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  scheduleId: number;
  status: 'present' | 'absent' | 'excused' | 'late';
  serviceTimeId?: number;
  notes?: string;
  markedBy?: number;
  markedAt: Date;
  student?: Student;
  schedule?: Schedule;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentCarer {
  id: number;
  studentId: number;
  teacherId: number;
  assignedAt: Date;
  notes?: string;
  student?: Student;
  teacher?: Teacher;
}
```

### Updated API Calls

**Update src/api/attendance.ts:**
```typescript
// Current getAttendance() returns flat structure
// New version fetches from REST API with proper relationships

export async function getScheduleWithAttendance(
  date: string,
  serviceTimeId: number
): Promise<ScheduleWithAttendance> {
  const response = await fetch(
    `${API_URL}/schedules?date=${date}&service_time=${serviceTimeId}`
  );
  const data = await response.json();
  return data;
}

export async function bulkSaveAttendance(
  scheduleId: number,
  records: Array<{ studentId: number; status: string; serviceTimeId: number }>
) {
  const response = await fetch(`${API_URL}/attendance/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduleId, records })
  });
  return response.json();
}
```

### Component Updates

**DateSelectionPage - Add service time selector:**
```typescript
// Add dropdown for service time (9h vs 11h)
const [selectedServiceTime, setSelectedServiceTime] = useState<number>(2); // Default 11h

<select value={selectedServiceTime} onChange={...}>
  <option value={1}>9h</option>
  <option value={2}>11h</option>
</select>
```

**AttendanceMarkingPage - Use schedule IDs:**
```typescript
// Instead of passing just date, pass schedule ID
const { data: schedule } = useQuery({
  queryKey: ['schedule', date, serviceTimeId],
  queryFn: () => getScheduleWithAttendance(date, serviceTimeId)
});

// Save attendance with schedule ID
await bulkSaveAttendance(schedule.id, attendanceRecords);
```

---

## Technology Stack Recommendations

### Database
**Recommended: PostgreSQL**
- ✅ Robust relational database
- ✅ Excellent performance
- ✅ JSON support (future flexibility)
- ✅ Free and open source
- ✅ Great hosting options (Railway, Supabase, Render)

**Alternative: MySQL**
- ✅ Also solid choice
- ⚠️ Slightly less features than PostgreSQL

**Not Recommended: Firebase Firestore**
- ❌ NoSQL doesn't fit relational structure
- ❌ Harder to query relationships
- ⚠️ Could work but SQL is better for this use case

### Backend API
**Recommended: Node.js + Express + Prisma**
- ✅ TypeScript support
- ✅ Prisma ORM (type-safe database access)
- ✅ Easy API routing
- ✅ Good ecosystem

**Tech Stack:**
```
Node.js v20+
Express v5
Prisma ORM v6
TypeScript v5
```

**Alternative: Next.js API Routes**
- ✅ All-in-one solution (frontend + backend)
- ✅ API routes built-in
- ⚠️ More complex deployment

### Hosting
**Recommended: Railway or Render**
- ✅ PostgreSQL + Node.js hosting
- ✅ Free tier available
- ✅ Easy deployment
- ✅ Automatic HTTPS

**Alternative: Vercel (frontend) + Supabase (backend)**
- ✅ Keep Vercel for frontend
- ✅ Supabase provides PostgreSQL + REST API
- ✅ Built-in authentication
- ⚠️ Learning curve for Supabase

---

## Implementation Phases

### Phase 1: Database Setup & Migration (Week 1-2)
- [ ] Set up PostgreSQL database
- [ ] Run schema creation scripts
- [ ] Write migration script for Google Sheets data
- [ ] Import existing data (students, lessons, schedules, attendance)
- [ ] Verify data integrity

### Phase 2: Backend API (Week 2-3)
- [ ] Set up Node.js + Express + Prisma project
- [ ] Implement authentication (Google OAuth)
- [ ] Create API endpoints (students, attendance, schedules)
- [ ] Test API with Postman/Insomnia
- [ ] Deploy to Railway/Render

### Phase 3: Frontend Updates (Week 3-4)
- [ ] Update TypeScript types/schemas
- [ ] Update API layer (src/api/)
- [ ] Add service time selector to date selection
- [ ] Update attendance marking to use schedule IDs
- [ ] Test all existing features

### Phase 4: New Features (Week 4-6)
- [ ] Teacher dashboard (upcoming classes)
- [ ] Carers widget (my students)
- [ ] Attendance history per student
- [ ] Admin schedule manager
- [ ] Visitor quick-add

### Phase 5: Testing & Deployment (Week 6-7)
- [ ] End-to-end testing
- [ ] User acceptance testing with teachers
- [ ] Performance optimization
- [ ] Production deployment
- [ ] Monitor and iterate

---

## Backup & Data Security

### Backup Strategy
1. **Automated daily backups** (Railway/Render provide this)
2. **Weekly export to Google Sheets** (keep as backup format)
3. **Monthly full database dump** (store in Google Drive)

### Data Security
1. **Google OAuth** - Only authorized teacher accounts
2. **Role-based access** - Admin vs Teacher permissions
3. **HTTPS encryption** - All API calls encrypted
4. **Input validation** - Prevent SQL injection
5. **Rate limiting** - Prevent abuse

---

## Performance Considerations

### Indexes
All critical query paths have indexes:
- `students(status)` - Filter active students
- `schedules(date)` - Fetch by date
- `attendance_records(student_id)` - Student history
- `attendance_records(schedule_id)` - Schedule attendance
- `schedule_assignments(teacher_id)` - Teacher's schedules

### Query Optimization
- Use JOIN queries to fetch related data in one query
- Paginate large lists (students, schedules)
- Cache frequently accessed data (lessons, teachers)
- Use database connection pooling

### Expected Load
- **Users:** 6-8 teachers (low concurrent users)
- **Students:** ~40-50 (small dataset)
- **Queries:** Low volume (once per Sunday for attendance)
- **Growth:** Slow (+3 students/year)

**Conclusion:** Performance will not be an issue. Any modern database can handle this easily.

---

## Questions & Decisions

### ✅ Decided
- Database: PostgreSQL
- ORM: Prisma
- Backend: Node.js + Express
- Authentication: Google OAuth (planned)
- Hosting: Railway or Render

### 🤔 To Decide
1. When to implement Google OAuth? (can deploy without it first)
2. Keep Google Sheets as dual-write during transition?
3. Migrate all at once or gradually?
4. Who will test the new system before full rollout?

---

## Support & Maintenance

**Admin Contact:** Israel (israelab23@gmail.com)

**Documentation Location:**
- This file: `DATABASE_SCHEMA.md`
- Migration scripts: `database/migrations/`
- API docs: `API_DOCUMENTATION.md` (to be created)

---

**Version History:**
- v1.0 (2025-10-31) - Initial schema design

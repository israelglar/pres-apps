# Prés App - Development Guide

Mobile-first PWA for Sunday class attendance tracking. Portuguese UI, deployed on Vercel.

---

## 📚 Documentation Map

This is the main technical reference for development. Additional context is available in separate files:

### Context Documentation (`.claude/project-documentation/`)

Read these **only when relevant** to your current task:

| File | When to Read | Purpose |
|------|--------------|---------|
| **[ministry-context.md](.claude/project-documentation/ministry-context.md)** | When you need to understand **who uses the app**, team structure, class schedules, or student population details | Ministry team composition, student demographics, class schedule, church context |
| **[problem-solution.md](.claude/project-documentation/problem-solution.md)** | When you need to understand **why features exist** or the design philosophy behind UX decisions | Original problem being solved, design philosophy, dual marking methods rationale, user experience priorities |
| **[features-detailed.md](.claude/project-documentation/features-detailed.md)** | When you need **in-depth details** about how a specific feature works, its components, or user interactions | Comprehensive feature descriptions, workflows, component details, gesture interactions |
| **[roadmap.md](.claude/project-documentation/roadmap.md)** | When planning **new features** or need to see what's already planned, recently implemented, or future priorities | Planned features, version history, recent changes, feature priorities |
| **[implementation-notes.md](.claude/project-documentation/implementation-notes.md)** | When you encounter **technical challenges**, need implementation patterns, or want to understand known limitations and technical debt | Implementation details, common tasks, technical debt, known limitations, testing considerations |

**⚠️ Important:** Don't read these files unless they're directly relevant to your current task. The rest of this document contains everything needed for day-to-day development.

---

## Tech Stack

- **Frontend:** React 19.1.1 + TypeScript 5.9.3 + Vite 7.1.7
- **Routing:** TanStack Router 1.133.3 (file-based)
- **State:** TanStack Query 5.90.5 (server), Zustand 5.0.8 (client - minimal)
- **UI:** Tailwind CSS 4.1.14, Lucide React 0.545.0
- **Data:** Supabase PostgreSQL + @supabase/supabase-js 2.78.0
- **Validation:** Zod 4.1.12
- **Search:** Fuse.js 7.1.0
- **PWA:** vite-plugin-pwa 1.1.0

---

## Project Architecture

```
src/
├── features/              # Feature-based modules
│   ├── home/
│   ├── date-selection/
│   ├── attendance-marking/
│   ├── search-marking/
│   ├── student-management/
│   └── attendance-history/
├── routes/                # TanStack Router routes
├── components/            # Shared UI
│   ├── ui/               # Generic components
│   └── features/         # Feature-specific shared
├── hooks/                # Custom hooks (8 total)
├── api/supabase/         # API layer
├── contexts/             # React contexts (AuthContext)
├── schemas/              # Zod schemas
├── store/                # Zustand stores
├── lib/                  # Third-party configs
├── types/                # TypeScript types
├── utils/                # Utility functions
└── config/               # Configuration (theme.ts)
```

**Key Principles:**
- Feature-sliced design: each feature in `/features/[name]/`
- Separate business logic into `.logic.ts` files
- Clean exports via `index.ts`
- Shared components in `/components/`
- Reusable logic in `/hooks/`

---

## Database Schema

**7 Core Tables:**
- `students` - Student roster (visitor support, status tracking)
- `teachers` - 8 teachers with email whitelist
- `service_times` - 09:00 and 11:00 services
- `lessons` - Curriculum lesson catalog
- `schedules` - Lesson schedule (dates, times, lessons)
- `schedule_assignments` - Teachers assigned to schedules
- `attendance_records` - Attendance tracking

**Key Data Models:**

```typescript
// Student
{ id, name, date_of_birth, status: 'active'|'inactive'|'aged_out'|'moved',
  is_visitor, visitor_date, notes }

// Attendance Record
{ id, student_id, schedule_id, status: 'present'|'absent'|'excused'|'late',
  service_time_id, notes, marked_by, marked_at }

// Schedule
{ id, date, service_time_id, lesson_id,
  event_type: 'regular'|'family_service'|'cancelled'|'retreat'|'party',
  notes, is_cancelled }
```

Full schema: `database/schema.sql`, `DATABASE_SCHEMA.md`
Types: `src/types/database.types.ts`

---

## Environment Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment variables** (`.env`):
   ```env
   VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Database setup:**
   ```bash
   npm run db:setup
   ```

4. **Development:**
   ```bash
   npm run dev
   ```

5. **Build:**
   ```bash
   npm run build
   ```

---

## Custom Hooks

1. **`useAttendanceData`** - Fetch attendance (TanStack Query wrapper)
2. **`useNavigationBlock`** - Prevent navigation with unsaved data
3. **`usePullToRefresh`** - Touch gesture pull-to-refresh
4. **`useSwipeGesture`** - Horizontal swipe detection
5. **`useStudentManagement`** - Student CRUD operations
6. **`useAttendanceHistory`** - Paginated history loading
7. **`useEditAttendance`** - Edit past records (optimistic updates)
8. **`usePWAInstall`** - PWA installation management

---

## Design Standards (Mobile-First)

**Typography:**
- h1: `text-3xl font-bold`
- h2: `text-2xl font-bold`
- h3: `text-base font-bold`
- Body: `text-sm`
- Labels: `text-xs`

**Spacing:**
- Card/Dialog padding: `p-5`
- Button gaps: `gap-3`
- Vertical margins: `mb-6` (major), `mb-5` (sections)

**Components:**
- Buttons: `px-5 py-3`, `text-sm`
- Icons: `w-4 h-4` (standard), `w-8 h-8` (large), `w-16 h-16` (XL)
- Cards: `rounded-2xl`, `shadow-2xl`, `p-5`

**Colors:**
- Primary gradient: Emerald → Teal → Cyan
- Present: Green (#10b981)
- Absent: Red
- Theme: `src/config/theme.ts`

**Reference:** `src/features/home/HomePage.tsx`

---

## Authentication

**Google OAuth:**
- Email whitelist via `teachers` table
- Auth hook: `check_teacher_whitelist()`
- Protected routes under `_authenticated/`
- Context: `src/contexts/AuthContext.tsx`

**Setup:** See `AUTH_SETUP.md`

---

## Key Features

1. **Home Page** - Main landing, navigation hub
2. **Date Selection** - Pick date, service time, marking method
3. **Search Marking** - Fuzzy search + tap to mark (default)
4. **Swipe Marking** - Alphabetical one-by-one with gestures
5. **Student Management** - Full CRUD + visitor tracking
6. **Attendance History** - View/edit past records (paginated)
7. **Haptic Feedback** - iOS/Android vibration patterns
8. **PWA** - Installable, offline-capable

---

## Navigation Structure

```
/login (Public)
  → Google OAuth → /

/_authenticated (Protected)
  └─ / (Home)
      ├─ /date-selection
      ├─ /search-marking
      ├─ /marking
      ├─ /manage-students
      └─ /attendance-history
```

---

## Development Guidelines

**Always:**
- Mobile-first design
- Portuguese UI text
- Follow design standards
- Use TanStack Query for server state
- Test on mobile devices

**Feature-Sliced Architecture:**
- New features → `/features/[name]/`
- Logic → `.logic.ts` files
- Components → presentational only
- Hooks → reusable logic

**State Management:**
- Server data: TanStack Query
- Client state: Zustand (minimal) or React state
- Forms: React state (no react-hook-form)

---

## API Layer

**Location:** `src/api/supabase/`

- `students.ts` - getAllStudents, createStudent, updateStudent, deleteStudent
- `lessons.ts` - Lesson operations
- `attendance.ts` - bulkSaveAttendance, updateAttendance, getAttendanceStats
- `schedules.ts` - getSchedulesByDate, getScheduleWithDetails
- `service-times.ts` - getServiceTimes

**Legacy:** `src/api/attendance.ts` (deprecated, Google Sheets)

---

## Useful Commands

```bash
npm run dev                      # Dev server
npm run build                    # Production build (use for validation)
npm run lint                     # Lint code
tsc -b                          # Type check

npm run db:setup                # Database setup
npm run db:fix-dates            # Fix date formatting
npm run db:diagnose-dates       # Diagnose date issues
npm run db:link-lessons         # Link lessons to schedules
```

**Testing/Validation:**
- **DO NOT** run `npm run dev` for validation
- **USE** `npm run build` - catches all TypeScript errors

---

## Technical Debt

1. **Legacy code:** `src/api/attendance.ts` (Google Sheets) - remove
2. **Unused deps:** `react-hook-form` - remove
3. **Dead code:** `utils/cache.ts` - remove
4. **Evaluate:** Zustand necessity (minimal usage)
5. **Missing:** Error boundaries, tests, i18n system

---

## Portuguese Glossary

- **Registar Presenças** - Record attendance
- **Presente (P)** - Present
- **Falta (F)** - Absent
- **Atrasado** - Late
- **Justificada** - Excused
- **Começar** - Start
- **Continuar** - Continue
- **Voltar** - Go back
- **Guardar** - Save
- **Gerir Prés** - Manage pre-teens
- **Histórico de Presenças** - Attendance history

---

## File Paths Quick Reference

**Features:**
- `src/features/home/HomePage.tsx`
- `src/features/date-selection/DateSelectionPage.tsx`
- `src/features/attendance-marking/AttendanceMarkingPage.tsx`
- `src/features/search-marking/SearchAttendanceMarkingPage.tsx`
- `src/features/student-management/StudentManagementPage.tsx`
- `src/features/attendance-history/AttendanceHistoryPage.tsx`

**Config:**
- `src/config/theme.ts` - Theme system
- `src/lib/queryClient.ts` - TanStack Query
- `src/lib/supabase.ts` - Supabase client
- `vite.config.ts` - Vite + PWA config

**Database:**
- `database/schema.sql` - Full schema
- `database/README.md` - Setup guide
- `DATABASE_SCHEMA.md` - Schema docs

---

_Keep it simple. Mobile-first. Fast. Portuguese._

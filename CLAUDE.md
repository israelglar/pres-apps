# Pre-Teens Ministry Attendance App (Prés App)

## Project Overview

A Progressive Web App (PWA) designed to help track attendance for pre-teen Sunday classes at a local church in Portugal. The app streamlines the manual process of recording attendance that was previously managed through Google Sheets, making it faster and easier for teachers to mark attendance during class time without taking precious lesson time.

**Current Status:** MVP in active development, deployed on Vercel
**Primary Language:** Portuguese (PT)
**Target Users:** Church volunteer teachers using personal mobile phones

---

## Ministry Context

### Team Structure

- **Total Teachers/Volunteers:** ~6 people
- **Administrators:** 2 (Israel and wife) - responsible for overall ministry coordination
- **Teachers:** 4 active volunteer teachers
- **Role Distinction:** Some features should be admin-only (future implementation)

### Student Population

- **Total Pre-Teens:** ~40 students in the system
- **Regular Attendees:** ~20 students attend consistently
- **Age Range:** Pre-teens (approximately 10-13 years old)
- **Annual Changes:**
  - ~10 students "age out" each year (move to next age group)
  - ~11 new students "age in" each year (turn 10)
  - Net change: +/- 3 students throughout the year
- **Mid-Year Fluctuations:** New church members, families moving, transfers between groups
- **Visitors:** Friends who visit occasionally; some become regular attendees over time

### Class Schedule

- **Current:** Two classes every Sunday
  - **09:00 AM service** - Morning class
  - **11:00 AM service** - Late morning class
- **Implementation:** ✅ Multiple service times fully supported
  - Separate attendance tracking per service
  - Service time selector on date selection page
  - Can expand to additional service times in future if needed

---

## Core Problem Being Solved

### Previous Workflow (Google Sheets)

- Manual entry into spreadsheets during or after class
- Time-consuming during lesson time (takes away from teaching)
- Difficult to quickly identify attendance trends
- Hard to spot students who have stopped coming
- Cumbersome to manage on mobile devices
- Multiple disconnected sheets for different types of data

### Current Solution (This App)

- Fast, mobile-first attendance marking (designed for phones)
- Two marking methods: **Search-based (default)** and Swipe-based
- Instant visual feedback with haptic vibrations
- Automatic tracking of lesson dates and curriculum links
- Quick access on teachers' personal phones during class
- Supabase PostgreSQL database for reliable data storage
- Student management with CRUD operations
- Attendance history with editing capabilities
- Multiple service times support (09:00 and 11:00)
- Future: Identify students missing multiple lessons with automatic alerts

---

## Complete Technical Stack

### Frontend Framework

- **React:** 19.1.1 with TypeScript 5.9.3
- **Build Tool:** Vite 7.1.7 (fast HMR, optimized builds)
- **Routing:** TanStack React Router 1.133.3 (file-based routing with type safety)

### State Management Architecture

- **Server State:** TanStack React Query 5.90.5
  - Primary data fetching and caching layer
  - 60-minute cache duration (gcTime)
  - 55-minute stale time (refetches 5 min before expiration)
  - Automatic background refetching
  - Retry logic with exponential backoff
- **Client State:** Zustand 5.0.8
  - Minimal usage: Only stores `selectedDate` and `selectedMethod`
  - **Note:** Architecture may be simplified in future (evaluate if Zustand is needed)
- **Legacy:** LocalStorage cache in `utils/cache.ts` is unused (React Query handles caching)

### UI & Styling

- **Styling:** Tailwind CSS 4.1.14 (utility-first)
- **Icons:** Lucide React 0.545.0
- **Animations:** CSS transitions and transforms (GPU-accelerated)
- **Design System:**
  - Primary gradient: Emerald → Teal → Cyan
  - Present: Green (#10b981)
  - Absent: Red
  - White cards with shadows, rounded corners
- **Centralized Theme:** All colors and styling tokens defined in `src/config/theme.ts`

### Design Standards (Mobile-First)

The app follows a consistent design system for optimal mobile experience:

#### Typography

- **Page Headings (h1):** `text-3xl font-bold` - Main page titles
- **Section Headings (h2):** `text-2xl font-bold` - Completion screens, dialog titles
- **Subheadings (h3):** `text-base font-bold` - Card titles, method options
- **Body Text:** `text-sm` - Standard readable text
- **Labels:** `text-xs` - Form labels, secondary information
- **Descriptive Text:** `text-base font-medium` - Page subtitles

#### Spacing

- **Card Padding:** `p-5` - All main content cards (consistent across pages)
- **Dialog Padding:** `p-5` - Modal dialogs, confirmation screens
- **Button Gaps:** `gap-3` - Space between side-by-side buttons
- **Vertical Margins:** `mb-6` - Standard spacing between major sections
- **Section Margins:** `mb-5` - Spacing within cards

#### Components

- **Buttons:**
  - Padding: `px-5 py-3` for primary/secondary buttons
  - Text: `text-sm` for button labels
  - Icons: `w-4 h-4` for button icons
- **Icons:**
  - Standard: `w-4 h-4` - Navigation, form controls
  - Large: `w-8 h-8` - Selected date display
  - Extra Large: `w-16 h-16` - Loading spinners, empty states
- **Input Fields:**
  - Padding: `py-3` vertical, `px-4` horizontal
  - Text: `text-sm`
  - Icons: `w-4 h-4`
- **Cards:**
  - Border radius: `rounded-2xl`
  - Shadow: `shadow-2xl`
  - Padding: `p-5` (consistent)

#### Why These Standards?

1. **Mobile-First:** Optimized for thumb accessibility on phones
2. **Readability:** Text sizes tested on various phone screens
3. **Consistency:** Users know what to expect across all pages
4. **Performance:** Standardized sizes reduce layout shifts
5. **Accessibility:** Large touch targets (minimum 44x44px for buttons)

All pages should follow these standards. Reference: `src/features/home/HomePage.tsx`

### Data & Validation

- **Schema Validation:** Zod 4.1.12 (runtime type safety for API responses)
- **Search:** Fuse.js 7.1.0 (fuzzy search for student names, 0.3 threshold)
- **Forms:** react-hook-form 7.65.0 (installed but unused - **can be removed**)

### Backend & Data Storage

- **Primary Storage:** Supabase (PostgreSQL)
- **Client:** @supabase/supabase-js 2.78.0
- **Database Schema:** 7 core tables
  - `students` - Student roster with visitor support and status tracking
  - `teachers` - 8 pre-populated teachers
  - `service_times` - 09:00 and 11:00 pre-populated
  - `lessons` - Curriculum lesson catalog
  - `schedules` - Lesson schedule (dates, times, lessons)
  - `schedule_assignments` - Teachers assigned to schedules
  - `attendance_records` - Core attendance tracking
- **API Layer:** Modular functions in `src/api/supabase/`
  - `students.ts` - Student CRUD operations
  - `lessons.ts` - Lesson operations
  - `attendance.ts` - Bulk save, update, statistics
  - `schedules.ts` - Schedule operations with lesson data
  - `service-times.ts` - Service time operations
- **Authentication:** ✅ **Google OAuth Implemented** (restricted to teacher emails)
  - Login required to access all features
  - Email whitelist validated via auth hook (`check_teacher_whitelist`)
  - Only 8 registered teachers in `teachers` table can log in
  - Session persistence via localStorage
  - Protected routes under `_authenticated/` layout
- **Environment Variables Required:**
  - `VITE_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `VITE_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (database scripts only)
- **Database Scripts:** TypeScript setup scripts in `database/` directory
- **Note:** Bulk save function is **fully implemented** and working

### PWA & Deployment

- **PWA Plugin:** vite-plugin-pwa 1.1.0
- **Service Worker:** Workbox with auto-update strategy
- **Manifest:** Portuguese, standalone mode, portrait-primary orientation
- **Hosting:** Vercel
- **Offline Support:** Not critical (good internet at church), but PWA caches assets

---

## Project Architecture

### Feature-Sliced Design Pattern

The project uses a **feature-based architecture** (feature-sliced design):

```
src/
├── features/                      # Feature modules
│   ├── home/                      # Landing page feature
│   │   ├── HomePage.tsx
│   │   ├── HomePage.logic.ts     # Separated business logic
│   │   └── index.ts               # Clean exports
│   ├── date-selection/            # Date picker feature
│   ├── attendance-marking/        # Swipe-based marking
│   ├── search-marking/            # Search-based marking
│   ├── student-management/        # Student CRUD (NEW)
│   │   ├── StudentManagementPage.tsx
│   │   ├── components/            # Feature components
│   │   │   ├── StudentCard.tsx
│   │   │   ├── StudentFormModal.tsx
│   │   │   └── DeleteConfirmDialog.tsx
│   │   └── hooks/
│   │       └── useStudentManagement.ts
│   └── attendance-history/        # History view (NEW)
│       ├── AttendanceHistoryPage.tsx
│       ├── components/
│       │   ├── DateGroupCard.tsx
│       │   ├── StudentAttendanceRow.tsx
│       │   └── EditAttendanceDialog.tsx
│       └── hooks/
│           ├── useAttendanceHistory.ts
│           └── useEditAttendance.ts
├── routes/                        # TanStack Router routes
├── components/                    # Shared UI components
│   ├── ui/                        # Generic reusable components
│   └── features/                  # Feature-specific shared components
├── hooks/                         # Custom React hooks (8 total)
├── api/                           # API communication layer
│   ├── supabase/                  # NEW: Supabase API modules
│   │   ├── students.ts
│   │   ├── lessons.ts
│   │   ├── attendance.ts
│   │   ├── schedules.ts
│   │   └── service-times.ts
│   └── attendance.ts              # DEPRECATED: Old Google Sheets API
├── schemas/                       # Zod validation schemas
├── store/                         # Zustand stores (minimal usage)
├── lib/                           # Third-party configs
│   ├── queryClient.ts             # TanStack Query
│   └── supabase.ts                # NEW: Supabase client
├── types/                         # TypeScript types
│   └── database.types.ts          # NEW: Database schema types
├── utils/                         # Utility functions
└── config/                        # Configuration
    └── theme.ts                   # Centralized theme system
```

**Key Principles:**

- Each feature has its own directory under `/features/`
- Business logic separated into `.logic.ts` files (presentational components)
- Each feature has an `index.ts` for clean exports
- Shared components in `/components/`
- Custom hooks in `/hooks/` for reusable logic

### Custom Hooks Architecture

Eight specialized hooks abstract complex behaviors:

1. **`useAttendanceData`** (`/hooks/useAttendanceData.ts`)
   - Wrapper around TanStack Query
   - Fetches attendance data from Supabase
   - Handles caching, refetching, error states
   - 60-minute cache, 10-second timeout

2. **`useNavigationBlock`** (`/hooks/useNavigationBlock.ts`)
   - Wraps TanStack Router's `useBlocker`
   - Prevents leaving pages with unsaved data
   - Custom confirmation dialog

3. **`usePullToRefresh`** (`/hooks/usePullToRefresh.ts`)
   - Touch gesture detection for pull-to-refresh
   - Visual loading indicator
   - Triggers data refetch

4. **`useSwipeGesture`** (`/hooks/useSwipeGesture.ts`)
   - Horizontal swipe detection (left/right)
   - Used for navigation and attendance marking
   - Configurable thresholds and callbacks

5. **`useStudentManagement`** (`/hooks/useStudentManagement.ts`)
   - CRUD operations for students
   - Wraps Supabase API calls with TanStack Query
   - Handles cache invalidation on mutations
   - Exposes loading/error states

6. **`useAttendanceHistory`** (`/hooks/useAttendanceHistory.ts`)
   - Paginated attendance history loading
   - Filters by service time
   - 5-minute stale time, 10-minute cache
   - Supports load more functionality

7. **`useEditAttendance`** (`/hooks/useEditAttendance.ts`)
   - Edit past attendance records
   - Optimistic updates for instant UI feedback
   - Cache invalidation on success
   - Rollback on error

8. **`usePWAInstall`** (`/hooks/usePWAInstall.ts`)
   - PWA installation detection and management
   - Returns: `canInstall`, `promptInstall`, `isInstalled`, `isRunningInPWA`, `openPWAApp`
   - Handles `beforeinstallprompt` event
   - Cross-platform support (iOS/Android)

---

## Complete Data Models

### Student

```typescript
{
  id: number;
  name: string;
  date_of_birth: string | null; // YYYY-MM-DD format
  status: 'active' | 'inactive' | 'aged_out' | 'moved';
  is_visitor: boolean;
  visitor_date: string | null; // Date first visited (ISO format)
  notes: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

### Service Time

```typescript
{
  id: number;
  time: string; // "09:00:00" or "11:00:00"
  name: string; // "09h" or "11h"
  is_active: boolean;
  display_order: number;
  created_at: string; // ISO timestamp
}
```

### Lesson

```typescript
{
  id: number;
  name: string;
  curriculum_link: string | null;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}
```

### Schedule

```typescript
{
  id: number;
  date: string; // YYYY-MM-DD format
  service_time_id: number;
  lesson_id: number;
  event_type: 'regular' | 'family_service' | 'cancelled' | 'retreat' | 'party';
  notes: string | null;
  is_cancelled: boolean;
  created_at: string;
  updated_at: string;
  // Computed fields (from joins):
  has_attendance?: boolean;
  attendance_count?: number;
  lesson_name?: string;
  lesson_link?: string;
  service_time_name?: string;
}
```

### Teacher

```typescript
{
  id: number;
  name: string;
  email: string | null;
  is_active: boolean;
  role: 'admin' | 'teacher';
  created_at: string;
}
```

### Attendance Record

```typescript
{
  id: number;
  student_id: number;
  schedule_id: number;
  status: 'present' | 'absent' | 'excused' | 'late'; // Expanded from P/F
  service_time_id: number;
  notes: string | null; // NEW: Teacher observations
  marked_by: number | null; // Teacher ID (future)
  marked_at: string; // ISO timestamp
  created_at: string;
  updated_at: string;
}
```

### Schedule Assignment

```typescript
{
  id: number;
  schedule_id: number;
  teacher_id: number;
  created_at: string;
}
```

### Database Schema Documentation

Complete schema documentation available in:
- `database/schema.sql` - Full SQL schema with comments
- `DATABASE_SCHEMA.md` - Detailed schema documentation
- `database/README.md` - Setup and migration guide

### TypeScript Types

All database types defined in `src/types/database.types.ts`:
- Insert/Update type variants for all tables
- Relationship types for joined queries
- Helper types for common query patterns

---

## Environment Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Git (for version control)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pres_app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create Supabase project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

4. **Set up environment variables:**

   Create a `.env` file in the project root:
   ```env
   VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   See `.env.example` for a template.

5. **Set up the database:**

   Option A - Using setup script (recommended):
   ```bash
   npm run db:setup
   ```

   Option B - Manual setup:
   - Open Supabase SQL Editor
   - Copy contents of `database/schema.sql`
   - Paste and execute in SQL Editor

   See `database/README.md` for detailed instructions.

6. **Start development server:**
   ```bash
   npm run dev
   ```

7. **Build for production:**
   ```bash
   npm run build
   ```

### Environment Variables

**Required for development:**
- `VITE_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `VITE_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key (safe for client-side)

**Required for database scripts only:**
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (never expose client-side)

**Security Notes:**
- Never commit `.env` file to version control
- `VITE_PUBLIC_*` variables are exposed to the client (safe for public keys)
- Service role key should only be used in server-side scripts
- RLS policies protect data even with public anonymous key

### Database Management Scripts

Available npm scripts for database operations:

```bash
npm run db:setup                 # Initial database setup
npm run db:fix-dates             # Fix date formatting issues
npm run db:diagnose-dates        # Diagnose date problems
npm run db:link-lessons          # Link lessons to schedules
```

---

## Current Features (Implemented)

### 1. Home Page (`/`)

**File:** `src/features/home/HomePage.tsx`

- Welcome screen with large "Registar Presenças" (Record Attendance) button
- **Pull-to-refresh gesture:** Swipe down from top to reload data from Google Sheets
- **Swipe-left gesture:** Navigate to date selection page
- Visual swipe hints and feedback
- Loading overlay with spinner while fetching data
- Error display with retry mechanism
- Auto-navigation when data is ready

### 2. Date Selection Page (`/date-selection`)

**File:** `src/features/date-selection/DateSelectionPage.tsx`

- **Custom dropdown** with all available Sundays
  - Auto-scroll to selected date when opened
  - Shows lesson names associated with each date
  - Displays curriculum links (clickable URLs)
  - **Attendance status badges** for both service times:
    - Green badge + checkmark = attendance marked for that service
    - Orange badge + warning = attendance missing for that service
    - Shows service time (09:00 or 11:00) on each badge
- **Filter future lessons:** Hides future dates by default
  - Toggle button: "Ver Lições Futuras" (Show Future Lessons)
- **Date labels:**
  - "Hoje" (Today) for current date
  - "Domingo Passado" (Last Sunday) for most recent past date
- **Service Time Selection:**
  - Radio buttons to select 09:00 or 11:00 service
  - Required before continuing
  - Selection persists in URL params
- **Method Selection Dialog:**
  - Choose between two marking methods before proceeding
  - **Search Method** (default): "Procurar por Nome" - mark by name/seating order
  - **Swipe Method:** "Método Tradicional" - alphabetical one-by-one

### 3. Attendance Marking - Search Method (`/search-marking`) **[DEFAULT]**

**File:** `src/features/search-marking/SearchAttendanceMarkingPage.tsx`

- **Fuzzy search bar** using Fuse.js
  - 30% similarity threshold
  - Searches only unmarked students
  - Handles typos and partial names
- **Click to mark:** Tap student name to mark as Present
  - Marked students move to bottom of list
  - Opacity reduced for marked students
  - Green checkmark indicator
- **Auto-scroll:** Scrolls to top after marking each student
- **Auto-focus:** Search input automatically focused
- **Auto-complete:** When all students have initial marks, automatically marks remaining as Absent
- **Progress tracking:** Shows "X de Y marcados" (X of Y marked)
- **Haptic feedback:** Light tap on each mark
- **Navigation blocking:** Confirms before leaving with unsaved data
- **Completion screen:** Shows Present/Absent counts, lesson name, auto-redirect message

### 4. Attendance Marking - Swipe Method (`/marking`)

**File:** `src/features/attendance-marking/AttendanceMarkingPage.tsx`

- **One-at-a-time cards:** Large card showing single student
- **Swipe gestures:**
  - **Swipe right:** Mark as Present (Green)
  - **Swipe left:** Mark as Absent/Falta (Red)
- **Visual feedback:** Animated swipe indicators on both sides
- **Side panel:** Shows all students with current marks
  - Unmarked: Gray
  - Present: Green
  - Absent: Red
  - Auto-scroll to current student
- **Progress bar:** Visual completion indicator
- **Haptic feedback:**
  - Light tap on each swipe
  - Success vibration (double tap) on completion
- **Success animation:** Celebration when all students marked
- **Navigation blocking:** Same as search method
- **Alphabetical order:** Students presented in alphabetical order

### 5. Completion Screen (Shared Component)

**File:** `src/components/features/CompletionScreen.tsx`

- Displays attendance summary:
  - Number of students present
  - Number of students absent
  - Lesson name for the date
- Success message: "Presenças guardadas com sucesso!"
- Auto-redirect countdown: "A voltar ao início em X segundos..."
- Used by both marking methods

### 6. Haptic Feedback System

**File:** `src/utils/haptics.ts`

Cross-platform haptic feedback for better UX:

**iOS Support:**

- Uses Web Audio API (silent audio tones trigger haptics)
- Requires user gesture to initialize

**Android Support:**

- Uses Vibration API with custom patterns
- Different patterns for different feedback types

**Feedback Types:**

- `lightTap()` - 10ms: General interactions
- `mediumTap()` - 25ms: Important actions
- `selectionTap()` - 15ms: Marking students
- `successVibration()` - Double tap pattern: Completion success
- `errorVibration()` - Heavy-light-heavy pattern: Errors

**Graceful Degradation:** Falls back silently if haptics unavailable

### 7. Student Management (`/manage-students`)

**File:** `src/features/student-management/StudentManagementPage.tsx`

#### Purpose
Complete CRUD interface for managing the student roster, handling visitors, status changes, and student information.

#### Features:
- **View All Students:** Card-based responsive layout
- **Search/Filter:** Fuzzy search by student name with clear button
- **Add New Students:** Modal form with all student details
- **Edit Students:** Update name, DOB, status, notes
- **Soft Delete:** Mark students as inactive (preserves history)
- **Status Management:**
  - `active` - Current regular students
  - `inactive` - No longer attending
  - `aged_out` - Moved to next age group (13+)
  - `moved` - Family relocated
- **Visitor Tracking:**
  - Mark students as visitors
  - Track visitor date (first visit)
  - Can convert visitors to regular students
- **Personal Information:**
  - Date of birth
  - Notes field for observations
- **Status Badges:** Color-coded visual indicators
- **Haptic Feedback:** On all actions

#### Components:
- `StudentManagementPage.tsx` - Main page
- `StudentFormModal.tsx` - Create/Edit dialog
- `StudentCard.tsx` - Individual student card
- `DeleteConfirmDialog.tsx` - Soft delete confirmation

#### Hook:
- **`useStudentManagement`** - Wraps all student operations with TanStack Query

### 8. Attendance History (`/attendance-history`)

**File:** `src/features/attendance-history/AttendanceHistoryPage.tsx`

#### Purpose
View and edit past attendance records, with filtering by service time and pagination for performance.

#### Features:
- **View Past Records:** Grouped by date with lesson info
- **Service Time Filtering:**
  - Animated tab slider to switch between 09:00 and 11:00 services
  - Smooth 300ms transition animation
- **Edit Past Attendance:**
  - Change status (present/absent/late/excused)
  - Add or edit notes
  - Optimistic updates for instant feedback
- **4 Attendance Statuses:**
  - **Present (Presente)** - Student attended
  - **Absent (Falta)** - Student did not attend
  - **Late (Atrasado)** - Student arrived late
  - **Excused (Justificada)** - Absence was justified/excused
- **Pagination:** Load 5 records at a time
  - "Carregar Mais" (Load More) button
  - Performance optimization for large datasets
  - Shows "Fim do histórico" when no more records
- **Statistics Per Date:**
  - Count of present/absent/late/excused students
  - Displayed on each date card
- **Refresh Button:** Manual data reload
- **Swipe Navigation:** Back gesture to return home
- **Haptic Feedback:** On all actions

#### Components:
- `AttendanceHistoryPage.tsx` - Main page with tabs
- `DateGroupCard.tsx` - Groups attendance by date
- `StudentAttendanceRow.tsx` - Individual student row
- `EditAttendanceDialog.tsx` - Status selection grid with notes

#### Hooks:
- **`useAttendanceHistory`** - Paginated history loading (5-min stale, 10-min cache)
- **`useEditAttendance`** - Edit with optimistic updates

### 9. PWA Capabilities

**File:** `vite.config.ts` + `public/manifest.json`

- **Installable:** Add to home screen on mobile devices
- **Install Prompt:** "Instalar Aplicação" button on home page (when not in PWA mode)
- **Service Worker:** Caches assets for faster loading
- **Offline Support:** Can load app with cached data (limited offline functionality)
- **Auto-update:** Prompts user when new version available
- **Manifest:**
  - Name: "Prés-adolescentes - Registo de Presenças"
  - Short name: "Prés App"
  - Theme color: Emerald green (#10b981)
  - Display: Standalone (full-screen app)
  - Orientation: Portrait-primary
  - Language: Portuguese (pt)
  - Icons: 192x192 and 512x512 PNG

#### Hook:
- **`usePWAInstall`** - Detects install capability and provides install function

### 10. Google OAuth Authentication

**Files:**
- `src/contexts/AuthContext.tsx` - Authentication context and hook
- `src/features/auth/LoginPage.tsx` - Login UI
- `src/routes/login.tsx` - Public login route
- `src/routes/_authenticated.tsx` - Protected route layout
- `database/auth-setup.sql` - Database setup script
- `AUTH_SETUP.md` - Complete setup guide

#### Purpose
Secure the app with Google OAuth login, restricting access to only the 8 registered teachers in the `teachers` table.

#### Features:
- **Google OAuth Integration:** One-click login with Google account
- **Email Whitelist:** Only emails in `teachers` table (with `is_active = true`) can log in
- **Auth Hook Validation:** Server-side validation before user creation (`check_teacher_whitelist()`)
- **Auto-Linking:** Automatically links `teachers.auth_user_id` to `auth.users.id` on first login
- **Protected Routes:** All routes under `_authenticated/` require valid authentication
- **Session Persistence:** Uses localStorage, survives page refreshes
- **Auto-Redirect:** Accessing protected routes when not logged in redirects to `/login`
- **Sign Out:** Logout button in top-right corner of home page
- **Teacher Greeting:** "Olá, [Nome]!" displays teacher's first name

#### Authentication Flow:
1. User opens app → redirected to `/login` if not authenticated
2. Click "Entrar com Google" → redirected to Google OAuth consent screen
3. Select Google account → redirected back to app
4. **Auth hook validates email** → checks if email exists in `teachers` table
5. If valid → creates user in `auth.users` → trigger links to `teachers.auth_user_id`
6. If invalid → rejects signup with error message
7. Application loads teacher profile → stores in AuthContext
8. All protected routes now accessible

#### Three Layers of Security:
1. **Auth Hook (Server):** `check_teacher_whitelist()` validates email before user creation
2. **RLS Policies (Database):** All tables require `auth.uid() IS NOT NULL`
3. **Application Check (React):** AuthContext validates teacher profile after login

#### Components:
- `AuthContext.tsx` - Provides auth state and methods (`signInWithGoogle`, `signOut`)
- `LoginPage.tsx` - Login UI with Google button
- `_authenticated.tsx` - Layout that protects all child routes

#### Hooks:
- **`useAuth`** - Access auth state: `{ session, user, teacher, loading, signInWithGoogle, signOut }`

#### Setup Requirements:
See `AUTH_SETUP.md` for complete configuration guide:
1. Configure Google Cloud Console OAuth client
2. Enable Google provider in Supabase Dashboard
3. Run `database/auth-setup.sql` script
4. Activate auth hook "Before User Created" in Supabase Dashboard

#### Database Changes:
- Added `teachers.auth_user_id` column (links to `auth.users.id`)
- Created `check_teacher_whitelist()` function (auth hook)
- Created `link_teacher_on_signup()` trigger (auto-linking)
- Updated all RLS policies to require authentication

#### User Experience:
- ✅ **Simple:** One-click Google login, no passwords
- ✅ **Secure:** Multiple layers of validation
- ✅ **Clear Errors:** Portuguese error messages for unauthorized access
- ✅ **Persistent:** Session survives refresh, auto-refreshes tokens
- ✅ **Seamless:** Protected routes redirect to login automatically

---

## Navigation Structure

```
/login (Login Page - Public)
  ├─ "Entrar com Google" button → Google OAuth consent
  └─ After successful login → / (Home)
  └─ If already authenticated → Auto-redirect to / (Home)

/_authenticated (Protected Routes - Requires Login)
  └─ All routes below require valid authentication
  └─ If not authenticated → Auto-redirect to /login

/ (Home - Protected)
  ├─ Logout button (top-right corner) → Sign out and redirect to /login
  ├─ "Começar" button → /date-selection
  ├─ "Histórico de Presenças" button → /attendance-history
  ├─ "Gerir Prés" button → /manage-students
  ├─ "Instalar Aplicação" button (if not in PWA mode)
  └─ Swipe Left gesture → /date-selection

/date-selection (Select Date, Service Time & Method)
  ├─ Select date from dropdown (shows attendance status badges for both services)
  ├─ Select service time (09:00 or 11:00) via radio buttons
  ├─ "Continuar" button → Method Selection Dialog
  │   ├─ "Procurar por Nome" [DEFAULT] → /search-marking?date=ISO&serviceTime=ID
  │   └─ "Método Tradicional" → /marking?date=ISO&serviceTime=ID
  └─ "Voltar" button → / (Home)

/search-marking (Search-Based Marking)
  ├─ Mark attendance by search
  └─ Complete/Cancel → / (Home)

/marking (Swipe-Based Marking)
  ├─ Mark attendance by swipe
  └─ Complete/Cancel → / (Home)

/manage-students (Student Management)
  ├─ View/search students
  ├─ Add new student → Modal dialog
  ├─ Edit student → Modal dialog
  ├─ Delete student → Confirmation dialog (soft delete)
  └─ "Voltar" button → / (Home)

/attendance-history (Attendance History)
  ├─ View past attendance (paginated, 5 per load)
  ├─ Filter by service time (09:00 / 11:00 tabs)
  ├─ Edit past record → Modal dialog
  ├─ Load more records
  └─ "Voltar" button → / (Home)
```

**Navigation Protection:**

- TanStack Router's `useBlocker` prevents accidental exits
- Custom confirmation dialog: "Continuar a Marcar" vs "Sair Sem Guardar"
- Only blocks if unsaved attendance records exist
- Applies to both marking methods (/search-marking and /marking)

---

## Planned Future Features

### ✅ Recently Implemented (Moved from Planned)

The following features were previously planned and are now **fully implemented**:

1. **✅ Multiple Service Times Support** - Radio button selector on date selection, separate tracking per service
2. **✅ Edit Attendance After Submission** - Full edit capability in attendance history with notes
3. **✅ Student Management** - Complete CRUD interface with visitor tracking and status management
4. **✅ Attendance History** - View past records with service time filtering and pagination

---

### High Priority (Short-Term)

#### 1. Student Notes/Comments During Marking

**Status:** **Partially Implemented** - Notes can be added when editing past attendance, but not during initial marking

**Remaining Work:** Add notes field during attendance marking

- Optional notes field when marking each student in real-time
- Examples: "Seemed tired", "Asked good questions", "Needs follow-up"
- Currently only available when editing past records
- Would allow capturing observations at time of marking

#### 2. Absence Alert System

**Design:** Show alerts during attendance marking

- When marking student who missed 2-3 recent lessons, show alert
- Alert shows: Absence count + suggested action
- Example: "⚠️ Faltou às últimas 3 aulas - Considera falar com ele/ela"
- Prompts teacher to check in with student
- Configurable threshold (2-3 lessons, adjustable)

#### 3. Quick Visitor Addition

**Status:** **Partially Implemented** - Visitors can be added via Student Management, but not during marking

**Remaining Work:** Add visitor during attendance marking flow

- "+ Adicionar Visitante" button in marking interface
- Simple name input field within marking page
- Marks visitor as Present immediately
- Currently must go to Student Management to add visitors first
- Would streamline workflow for unexpected visitors during class

### Medium Priority (Next 3-6 Months)

#### 4. Carers List Widget

**Design:** Show on home page (below "Começar" button)

- "Meus Pré-adolescentes" section on home page
- Shows 3-5 students assigned to logged-in teacher
- Quick reminders: "Lembra-te de falar com..."
- Click student to see attendance history
- Admin interface to assign carers to students
- Currently managed in separate Excel file (needs integration)

#### 5. Lesson History & Resources

**Design:** New section accessible from navigation menu

- List view of all past lessons (date, name, link)
- Each lesson has:
  - **Resources shared:** Links, files, notes
  - **Comments:** What worked, what didn't, observations
  - **Curriculum rating:** Vote/rate to evaluate if change needed
- **Permissions:** All teachers can edit any lesson (collaborative)
- Rich text editor for lesson notes
- File attachments support

#### 6. Reports & Analytics Section

**Design:** Separate reports page (not cluttering home page)

- **Attendance Reports:**
  - Weekly/monthly attendance trends
  - Individual student attendance history
  - Identify students absent X weeks in a row
  - Average attendance per lesson
- **Visual Charts:**
  - Line graph: Attendance over time
  - Bar chart: Individual student attendance percentages
  - Heatmap: Which Sundays have lowest attendance
- **Export Options:**
  - Export to PDF
  - Export to Excel/CSV
  - Share reports via email

#### 7. Role-Based Permissions (Future Enhancement)

**Status:** Authentication implemented, but all teachers have equal access

**Future:** Differentiate admin vs teacher permissions

- **Admin permissions** (Israel + wife):
  - Manage teachers (add/remove/deactivate)
  - Manage students (already implemented for all)
  - Access to all reports and data
  - System configuration
- **Teacher permissions:**
  - Mark attendance (already implemented)
  - View attendance history (already implemented)
  - Manage students (consider restricting to admins only)
- Implementation: Use `teachers.role` column (already exists: 'admin' or 'teacher')

### Low Priority (Future Ideas)

#### 8. Enhanced Database Features

**Status:** **Database migration complete** - Now using Supabase PostgreSQL

**Remaining Work:** Take advantage of relational database capabilities

- Implement complex queries and reports
- Add foreign key relationships where missing
- Optimize query performance with indexes
- Add database-level validation and constraints
- Implement audit trails for data changes

#### 9. Additional Ministry Features (Exploration Phase)

- Communication with parents (announcements, updates)
- Event planning (camps, trips, special events)
- Student progress/milestone tracking
- Volunteer/teacher scheduling
- Resource management (materials, supplies inventory)
- Curriculum planning and evaluation

---

## Important Implementation Details

### Date Handling

- All lesson dates are Sundays (class schedule)
- Dates stored in ISO format (YYYY-MM-DD)
- Automatically defaults to closest Sunday
- Supports past dates (historical attendance marking)
- Future dates filtered by default but can be toggled visible
- Lesson names and curriculum links tied to specific dates
- Date labels: "Hoje" (today), "Domingo Passado" (last Sunday)

### Dual Marking Methods Philosophy

**Why Two Methods?**

1. **Search Method (Default):**
   - **Use Case:** Students seated in random/seating chart order
   - **Teacher marks as they see them in the room**
   - Faster for non-alphabetical scenarios
   - Less structured, more flexible

2. **Swipe Method:**
   - **Use Case:** Traditional roll-call style
   - Alphabetical order, one-by-one
   - Ensures no one is missed
   - More familiar to teachers used to paper roll call

**Both methods:**

- Auto-mark remaining students as Absent on completion
- Same save logic and validation
- Same navigation blocking
- Same completion screen

### Search Method as Default

- Based on teacher feedback, Search method is more commonly used
- Method dialog defaults to Search option pre-selected
- Swipe method still easily accessible for teachers who prefer it

### API Integration Notes

**Current State (Supabase):**

- **GET Operations:** Fetches students, schedules, attendance, lessons
- **POST Operations:** Bulk create attendance records (fully implemented)
- **PATCH Operations:** Update individual attendance records (for editing history)
- **DELETE Operations:** Soft delete students (marks as inactive)
- 10-second timeout protection
- Network status checking (`navigator.onLine`)
- Retry logic handled by TanStack Query
- Optimistic updates for instant UI feedback

**API Layer Structure (`src/api/supabase/`):**

- **`students.ts`** - getAllStudents, createStudent, updateStudent, deleteStudent
- **`lessons.ts`** - Lesson operations
- **`attendance.ts`** - bulkSaveAttendance, updateAttendance, getAttendanceStats
- **`schedules.ts`** - getSchedulesByDate, getScheduleWithDetails
- **`service-times.ts`** - getServiceTimes

**Legacy Code:**

- Old `src/api/attendance.ts` still exists (Google Sheets integration)
- Marked as deprecated but not removed yet
- Should be cleaned up once Supabase migration fully validated

**Authentication (Future):**

- Currently uses Supabase anonymous key (public access via RLS)
- When adding Google OAuth:
  - Will use Supabase Auth with Google provider
  - RLS policies will check authenticated user IDs
  - Teacher table will restrict to whitelisted email addresses
  - No need to migrate backend - Supabase handles auth natively

---

## User Experience Details

### Gesture Interactions

- **Pull-to-refresh:** Swipe down on home page to reload data from Google Sheets
- **Swipe navigation:** Swipe left on home page to navigate to date selection
- **Swipe marking:** Swipe left (Absent) or right (Present) in swipe marking method
- **Haptic feedback:** Light taps, selection feedback, success vibrations (iOS & Android)

### Mobile-First Design

- **Target Device:** Personal phones (iOS and Android)
- **Usage Context:** During class, teacher quickly marks attendance
- **Large Touch Targets:** Buttons and cards designed for thumb accessibility
- **Readable Text:** Large font sizes for quick scanning
- **Minimal Friction:** Reduce number of taps/interactions required

### Performance Optimizations

- React 19 automatic batching
- Memoized context to prevent re-renders
- TanStack Router lazy route loading
- TanStack Query caching (60-min) reduces server requests
- CSS animations (GPU-accelerated transforms)
- Optimized bundle size with Vite code splitting

---

## Known Limitations & Technical Debt

### Current Limitations

1. **No Role-Based Permissions:** All authenticated teachers have equal access
   - Everyone can manage students, view all history, mark attendance
   - Admin vs teacher roles exist in database but not enforced
   - Future: Restrict student management to admins only

2. **No Backup Strategy Beyond Supabase:**
   - Relies entirely on Supabase infrastructure
   - No automated backups to external location
   - No export/import functionality yet
   - **Note:** Supabase provides daily backups on paid plans

3. **No Audit Trail:** Changes to attendance records not tracked
   - Can't see who edited what and when
   - No revision history
   - Would require audit logging table

4. **Notes Only Available on Edit:** Can't add notes during initial marking
   - Must edit attendance record after submission to add notes
   - Interrupts workflow for immediate observations

5. **No Visitor Quick-Add:** Visitors must be added before marking
   - Must go to Student Management first
   - Can't add visitors during attendance flow
   - Interrupts workflow when unexpected visitor arrives

### Technical Debt

1. **Legacy Google Sheets Code:** Old `src/api/attendance.ts` still exists
   - Should be removed once Supabase fully validated
   - Currently marked as deprecated
   - Adds confusion for developers

2. **Unused Dependency:** `react-hook-form` (can be removed)
   - Installed but not used anywhere
   - Adds 70KB to bundle size

3. **Dead Code:** `utils/cache.ts` appears unused
   - TanStack Query handles all caching
   - Can be removed

4. **State Management Evaluation:** Zustand usage is minimal
   - Only stores `selectedDate` and `selectedMethod`
   - Could use URL params or React Context instead
   - Evaluate if Zustand adds value vs complexity

5. **Supabase URL in Code:** Currently in environment variables ✅
   - Now properly using `.env` file
   - Good practice for security and deployment

6. **No Error Boundaries:** React error handling not implemented
   - App crashes bubble to browser console
   - Should have fallback UI for errors

7. **No Tests:** No testing setup (unit, integration, e2e)
   - Manual testing only
   - Risk of regressions
   - Would benefit from Vitest + React Testing Library

8. **No i18n System:** Portuguese hardcoded
   - Not needed for current use case (Portuguese church)
   - Worth noting if app is ever shared with other churches

---

## Development Guidelines for AI Assistants

### When Working on This Project

#### Always Consider:

1. **Mobile-first:** Teachers use personal phones during class time
2. **Speed matters:** Attendance marking must be FAST to not waste lesson time
3. **Portuguese UI:** All user-facing text in Portuguese (PT)
4. **Ministry context:** Volunteer team, not professional developers (simplicity over complexity)
5. **Simplicity over features:** Easy to use > powerful but complex
6. **Caching strategy:** Minimize API calls to Google Sheets (use TanStack Query cache)
7. **Future-proof for 2 services:** Keep in mind 9 AM + 11 AM expansion coming

#### Feature-Sliced Architecture Patterns:

- New features go in `/features/[feature-name]/`
- Separate business logic into `.logic.ts` files
- Keep components presentational (accept props, render UI)
- Export cleanly via `index.ts` in each feature
- Shared components go in `/components/ui/` or `/components/features/`
- Reusable logic goes in `/hooks/`

#### State Management Decisions:

- **Server data (API):** Use TanStack Query (already set up)
- **Session data (temporary UI state):** Evaluate if Zustand is needed or use React state
- **Form state:** Use React state (react-hook-form not used)
- **Avoid:** Multiple sources of truth, complex state trees

#### Testing Considerations:

- Test on mobile devices (primary use case)
- Test haptic feedback on both iOS and Android
- Verify gesture interactions work smoothly
- Check offline behavior (should show cached data)
- Test with realistic student list size (~20-40 students)
- Test both marking methods (Search and Swipe)

#### Common Tasks:

**Adding a New Feature:**

1. Create directory in `/features/[feature-name]/`
2. Create main component: `[FeatureName]Page.tsx`
3. Separate business logic: `[FeatureName]Page.logic.ts` (if complex)
4. Create route in `/routes/[route-name].tsx`
5. Update navigation in existing pages
6. Consider admin vs teacher role access
7. Add Portuguese translations
8. Test on mobile device

**Modifying Attendance Flow:**

1. Changes affect both marking methods (Search and Swipe)
2. Update data models in `schemas/attendance.schema.ts`
3. Update API calls in `api/attendance.ts`
4. Update Google Sheets structure (backend)
5. Update completion screen if needed
6. Test navigation blocking still works

**Changing Data Models:**

1. Update Zod schema in `schemas/attendance.schema.ts`
2. Update TypeScript types/interfaces
3. Update API layer in `api/attendance.ts`
4. Update Google Apps Script backend
5. Update Google Sheets structure
6. Test with both old and new data formats (migration)

**UI Changes:**

1. Follow existing design system (Emerald/Teal/Cyan gradient)
2. Maintain gesture interactions (swipe, pull-to-refresh)
3. Keep large touch targets for mobile
4. Test haptic feedback still works
5. Ensure animations are smooth (GPU-accelerated)
6. Test on various screen sizes (iOS and Android)

---

## Glossary (Portuguese → English)

### Ministry Terms

- **Prés / Pré-adolescentes:** Pre-teens
- **Pré / Prés:** Shortened form of "pré-adolescente(s)" used throughout the UI instead of "aluno/alunos" (student/students) to reflect ministry-specific terminology
- **Aula / Lição:** Lesson / Class
- **Cuidadores / Carers:** Teachers assigned to care for specific students (shepherding/mentoring role)
- **Currículo:** Curriculum

### App UI Terms

- **Registar Presenças:** Record/Register attendance
- **Presente (P):** Present
- **Falta (F):** Absent (literally "absence" or "lack")
- **Atrasado:** Late
- **Justificada:** Excused (excused absence)
- **Começar:** Start / Begin
- **Continuar:** Continue
- **Voltar:** Go back / Return
- **Guardar:** Save
- **Hoje:** Today
- **Domingo Passado:** Last Sunday
- **Ver Lições Futuras:** Show Future Lessons
- **Procurar por Nome:** Search by Name
- **Método Tradicional:** Traditional Method
- **Presenças guardadas com sucesso!:** Attendance saved successfully!
- **A voltar ao início em X segundos...:** Returning to home in X seconds...
- **X de Y marcados:** X of Y marked
- **Adicionar Visitante:** Add Visitor
- **Meus Pré-adolescentes:** My Pre-teens (Carers list)
- **Lembra-te de falar com...:** Remember to talk with...
- **Gerir Prés:** Manage Pre-teens (Student Management)
- **Histórico de Presenças:** Attendance History
- **Instalar Aplicação:** Install Application (PWA install)
- **Carregar Mais:** Load More (pagination)
- **Fim do histórico:** End of history (no more records)
- **Visitante:** Visitor
- **Ativo:** Active
- **Inativo:** Inactive
- **Saiu:** Aged out (moved to next age group)
- **Mudou:** Moved (family relocated)

---

## Technical Reference

### Key File Paths

**Features:**

- Home: `src/features/home/HomePage.tsx`
- Date Selection: `src/features/date-selection/DateSelectionPage.tsx`
- Swipe Marking: `src/features/attendance-marking/AttendanceMarkingPage.tsx`
- Search Marking: `src/features/search-marking/SearchAttendanceMarkingPage.tsx`
- Student Management: `src/features/student-management/StudentManagementPage.tsx`
- Attendance History: `src/features/attendance-history/AttendanceHistoryPage.tsx`

**Hooks:**

- Data Fetching: `src/hooks/useAttendanceData.ts`
- Navigation Block: `src/hooks/useNavigationBlock.ts`
- Pull to Refresh: `src/hooks/usePullToRefresh.ts`
- Swipe Gesture: `src/hooks/useSwipeGesture.ts`
- Student Management: `src/hooks/useStudentManagement.ts`
- Attendance History: `src/hooks/useAttendanceHistory.ts`
- Edit Attendance: `src/hooks/useEditAttendance.ts`
- PWA Install: `src/hooks/usePWAInstall.ts`

**API & Data:**

- Supabase Client: `src/lib/supabase.ts`
- Supabase API:
  - Students: `src/api/supabase/students.ts`
  - Lessons: `src/api/supabase/lessons.ts`
  - Attendance: `src/api/supabase/attendance.ts`
  - Schedules: `src/api/supabase/schedules.ts`
  - Service Times: `src/api/supabase/service-times.ts`
- Legacy API (deprecated): `src/api/attendance.ts`
- Database Types: `src/types/database.types.ts`
- Schemas: `src/schemas/attendance.schema.ts`
- Zustand Store: `src/store/attendanceStore.ts`

**Utilities:**

- Haptics: `src/utils/haptics.ts`
- Helper Functions: `src/utils/helperFunctions.tsx`
- Cache (unused): `src/utils/cache.ts`

**Config:**

- Theme System: `src/config/theme.ts`
- Query Client: `src/lib/queryClient.ts`
- Router: `src/router.tsx`
- Root Route: `src/routes/__root.tsx`
- Vite Config: `vite.config.ts`

**Database:**

- Schema: `database/schema.sql`
- Setup Script: `database/setup.ts`
- Documentation: `database/README.md`, `DATABASE_SCHEMA.md`

### Useful Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
tsc -b

# Database management
npm run db:setup                 # Initial database setup
npm run db:fix-dates             # Fix date formatting issues
npm run db:diagnose-dates        # Diagnose date problems
npm run db:link-lessons          # Link lessons to schedules
```

### Testing the Application

**Important Note:** When AI assistants are testing or validating changes:

- **DO NOT run `npm run dev`** - The development server is resource-intensive and not necessary for validation
- **Instead, run `npm run build`** - This performs a full TypeScript type check and build verification
- The build command will catch:
  - TypeScript compilation errors
  - Missing imports or exports
  - Type mismatches
  - Syntax errors
  - Build-time configuration issues

**Why this approach?**

- The dev server runs continuously in the background and can accumulate multiple instances
- Building is faster for validation purposes
- Build errors are more comprehensive than dev server hot-reload errors
- Matches the production deployment process

**Testing workflow for AI assistants:**

1. Make code changes
2. Run `npm run build` to verify compilation
3. If build succeeds → changes are valid
4. If build fails → fix the reported errors and rebuild

**Manual testing by users:**

- Users should run `npm run dev` when they want to interact with the app
- The app is deployed on Vercel, so manual testing can also be done there

---

## Contact & Context

**Project Owner:** Israel
**Ministry Role:** Pre-teens coordinator (with wife as co-admin)
**Team Size:** 6 teachers (4 teachers + 2 admins)
**Church Location:** Portugal (Portuguese-speaking)
**Student Age Range:** Pre-teens (approximately 10-13 years old)
**Primary Use Case:** Quick attendance marking during Sunday morning classes
**Secondary Goals:** Track attendance trends, identify absent students, support ministry team

---

## Version History

- **Current Version:** MVP (0.2.0)
- **Status:** Active development
- **Last Updated:** 2025-11-03
- **Deployment:** Vercel (production)
- **Repository:** Git repository with recent commits showing active development

### Recent Major Changes (0.2.0)

- ✅ **Database Migration:** Migrated from Google Sheets to Supabase PostgreSQL
- ✅ **Student Management:** Full CRUD interface for managing student roster
- ✅ **Attendance History:** View and edit past attendance with pagination
- ✅ **Multiple Service Times:** Support for 09:00 and 11:00 services
- ✅ **Enhanced Attendance:** 4 status types (present/absent/late/excused) with notes
- ✅ **PWA Install Prompt:** Install button on home page

---

## Final Notes for AI Assistants

This app is a **ministry tool** built by a volunteer coordinator to help his church team. The users are volunteer teachers, not professional software users. Prioritize:

1. **Simplicity:** Simple and intuitive over powerful and complex
2. **Speed:** Fast interactions (attendance marking takes seconds, not minutes)
3. **Reliability:** Must work during Sunday classes (no crashes, clear error messages)
4. **Mobile-first:** Designed for phones, not desktops
5. **Portuguese:** All UI in Portuguese (PT)

When suggesting changes:

- Explain trade-offs clearly
- Consider the volunteer/ministry context
- Test suggestions on mobile devices
- Keep the UX simple and forgiving
- Remember: Teachers are using this during class with pre-teens (distractions, time pressure)

**Most Important:** This tool should save time and reduce friction, not add complexity to the ministry team's workflow.

---

_This documentation will be updated as the project evolves. AI assistants should refer to this file for context before making significant changes._

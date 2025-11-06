# Current Features (Detailed)

## 1. Home Page (`/`)

**File:** `src/features/home/HomePage.tsx`

- Welcome screen with large "Registar Presenças" (Record Attendance) button
- **Pull-to-refresh gesture:** Swipe down from top to reload data
- **Swipe-left gesture:** Navigate to date selection page
- Visual swipe hints and feedback
- Loading overlay with spinner while fetching data
- Error display with retry mechanism
- Auto-navigation when data is ready

## 2. Date Selection Page (`/date-selection`)

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

## 3. Attendance Marking - Search Method (`/search-marking`) **[DEFAULT]**

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

## 4. Attendance Marking - Swipe Method (`/marking`)

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

## 5. Completion Screen (Shared Component)

**File:** `src/components/features/CompletionScreen.tsx`

- Displays attendance summary:
  - Number of students present
  - Number of students absent
  - Lesson name for the date
- Success message: "Presenças guardadas com sucesso!"
- Auto-redirect countdown: "A voltar ao início em X segundos..."
- Used by both marking methods

## 6. Haptic Feedback System

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

## 7. Student Management (`/manage-students`)

**File:** `src/features/student-management/StudentManagementPage.tsx`

### Purpose
Complete CRUD interface for managing the student roster, handling visitors, status changes, and student information.

### Features:
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

### Components:
- `StudentManagementPage.tsx` - Main page
- `StudentFormModal.tsx` - Create/Edit dialog
- `StudentCard.tsx` - Individual student card
- `DeleteConfirmDialog.tsx` - Soft delete confirmation

### Hook:
- **`useStudentManagement`** - Wraps all student operations with TanStack Query

## 8. Attendance History (`/attendance-history`)

**File:** `src/features/attendance-history/AttendanceHistoryPage.tsx`

### Purpose
View and edit past attendance records, with filtering by service time and pagination for performance.

### Features:
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

### Components:
- `AttendanceHistoryPage.tsx` - Main page with tabs
- `DateGroupCard.tsx` - Groups attendance by date
- `StudentAttendanceRow.tsx` - Individual student row
- `EditAttendanceDialog.tsx` - Status selection grid with notes

### Hooks:
- **`useAttendanceHistory`** - Paginated history loading (5-min stale, 10-min cache)
- **`useEditAttendance`** - Edit with optimistic updates

## 9. PWA Capabilities

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

### Hook:
- **`usePWAInstall`** - Detects install capability and provides install function

## 10. Google OAuth Authentication

**Files:**
- `src/contexts/AuthContext.tsx` - Authentication context and hook
- `src/features/auth/LoginPage.tsx` - Login UI
- `src/routes/login.tsx` - Public login route
- `src/routes/_authenticated.tsx` - Protected route layout
- `database/auth-setup.sql` - Database setup script
- `AUTH_SETUP.md` - Complete setup guide

### Purpose
Secure the app with Google OAuth login, restricting access to only the 8 registered teachers in the `teachers` table.

### Features:
- **Google OAuth Integration:** One-click login with Google account
- **Email Whitelist:** Only emails in `teachers` table (with `is_active = true`) can log in
- **Auth Hook Validation:** Server-side validation before user creation (`check_teacher_whitelist()`)
- **Auto-Linking:** Automatically links `teachers.auth_user_id` to `auth.users.id` on first login
- **Protected Routes:** All routes under `_authenticated/` require valid authentication
- **Session Persistence:** Uses localStorage, survives page refreshes
- **Auto-Redirect:** Accessing protected routes when not logged in redirects to `/login`
- **Sign Out:** Logout button in top-right corner of home page
- **Teacher Greeting:** "Olá, [Nome]!" displays teacher's first name

### Authentication Flow:
1. User opens app → redirected to `/login` if not authenticated
2. Click "Entrar com Google" → redirected to Google OAuth consent screen
3. Select Google account → redirected back to app
4. **Auth hook validates email** → checks if email exists in `teachers` table
5. If valid → creates user in `auth.users` → trigger links to `teachers.auth_user_id`
6. If invalid → rejects signup with error message
7. Application loads teacher profile → stores in AuthContext
8. All protected routes now accessible

### Three Layers of Security:
1. **Auth Hook (Server):** `check_teacher_whitelist()` validates email before user creation
2. **RLS Policies (Database):** All tables require `auth.uid() IS NOT NULL`
3. **Application Check (React):** AuthContext validates teacher profile after login

### Components:
- `AuthContext.tsx` - Provides auth state and methods (`signInWithGoogle`, `signOut`)
- `LoginPage.tsx` - Login UI with Google button
- `_authenticated.tsx` - Layout that protects all child routes

### Hooks:
- **`useAuth`** - Access auth state: `{ session, user, teacher, loading, signInWithGoogle, signOut }`

### Setup Requirements:
See `AUTH_SETUP.md` for complete configuration guide:
1. Configure Google Cloud Console OAuth client
2. Enable Google provider in Supabase Dashboard
3. Run `database/auth-setup.sql` script
4. Activate auth hook "Before User Created" in Supabase Dashboard

### Database Changes:
- Added `teachers.auth_user_id` column (links to `auth.users.id`)
- Created `check_teacher_whitelist()` function (auth hook)
- Created `link_teacher_on_signup()` trigger (auto-linking)
- Updated all RLS policies to require authentication

## Gesture Interactions

- **Pull-to-refresh:** Swipe down on home page to reload data
- **Swipe navigation:** Swipe left on home page to navigate to date selection
- **Swipe marking:** Swipe left (Absent) or right (Present) in swipe marking method
- **Haptic feedback:** Light taps, selection feedback, success vibrations (iOS & Android)

## Performance Optimizations

- React 19 automatic batching
- Memoized context to prevent re-renders
- TanStack Router lazy route loading
- TanStack Query caching (60-min) reduces server requests
- CSS animations (GPU-accelerated transforms)
- Optimized bundle size with Vite code splitting

## Navigation Protection

- TanStack Router's `useBlocker` prevents accidental exits
- Custom confirmation dialog: "Continuar a Marcar" vs "Sair Sem Guardar"
- Only blocks if unsaved attendance records exist
- Applies to both marking methods (/search-marking and /marking)

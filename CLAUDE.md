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
- **Current:** One class every Sunday at 11:00 AM (single service)
- **Future Expansion (Planned):** Add second class at 9:00 AM for growing 9 AM service
- **Important:** Will need to support multiple service times with separate attendance tracking

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
- Integration with existing Google Sheets backend
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
- **Primary Storage:** Google Sheets
- **API Layer:** Google Apps Script (deployed and working)
- **Endpoint:** `https://script.google.com/macros/s/AKfycbz-f51iHygWdwqBCJAentbbV-S50XZ8XvxE8JflZ9RiJpOCZPijit_u4-Iot6t59HYJpA/exec`
- **Authentication:** None currently (planned: Google OAuth restricted to teacher accounts)
- **Note:** Bulk save function is currently **commented out for testing** in frontend

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
│   └── search-marking/            # Search-based marking
├── routes/                        # TanStack Router routes
├── components/                    # Shared UI components
│   ├── ui/                        # Generic reusable components
│   └── features/                  # Feature-specific shared components
├── hooks/                         # Custom React hooks
├── api/                           # API communication layer
├── schemas/                       # Zod validation schemas
├── store/                         # Zustand stores
├── lib/                           # Third-party configs (queryClient)
└── utils/                         # Utility functions
```

**Key Principles:**
- Each feature has its own directory under `/features/`
- Business logic separated into `.logic.ts` files (presentational components)
- Each feature has an `index.ts` for clean exports
- Shared components in `/components/`
- Custom hooks in `/hooks/` for reusable logic

### Custom Hooks Architecture

Four specialized hooks abstract complex behaviors:

1. **`useAttendanceData`** (`/hooks/useAttendanceData.ts`)
   - Wrapper around TanStack Query
   - Fetches attendance data from Google Sheets
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

---

## Complete Data Models

### Student
```typescript
{
  id: string | number;
  name: string;  // Alphabetically sorted
}
```

### Attendance Record
```typescript
{
  studentId: string;
  studentName: string;
  status: "P" | "F";  // P = Presente (Present), F = Falta (Absent)
  timestamp: Date;
  // Future: notes?: string;  // Teacher observations
}
```

### Attendance Data (from API)
```typescript
{
  success: boolean;
  dates: string[];                           // All available Sundays (ISO format)
  lessonNames: Record<string, string>;       // Date -> Lesson name mapping
  lessonLinks: Record<string, string>;       // Date -> Curriculum URL mapping
  students: Array<{ name: string; id?: number }>;
}
```

### Google Sheets Structure
The backend uses separate sheets:
- **Students Sheet:** Student list with IDs and names
- **Attendance Sheet:** Date, StudentID, Status (P/F), Timestamp
- **Lessons Sheet:** Date, Lesson Name, Curriculum Link
- **Formulas:** Calculations for reports and analytics

### Zod Schemas
All API data validated at runtime (see `schemas/attendance.schema.ts`):
- `studentSchema`
- `attendanceDataSchema`
- `studentWithIdSchema`
- `attendanceRecordSchema`
- `bulkUpdateRequestSchema`

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
- **Filter future lessons:** Hides future dates by default
  - Toggle button: "Ver Lições Futuras" (Show Future Lessons)
- **Date labels:**
  - "Hoje" (Today) for current date
  - "Domingo Passado" (Last Sunday) for most recent past date
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

### 7. PWA Capabilities
**File:** `vite.config.ts` + `public/manifest.json`

- **Installable:** Add to home screen on mobile devices
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

---

## Navigation Structure

```
/ (Home)
  ├─ "Começar" button → /date-selection
  └─ Swipe Left gesture → /date-selection

/date-selection (Select Date & Method)
  ├─ Select date from dropdown
  ├─ "Continuar" button → Method Selection Dialog
  │   ├─ "Procurar por Nome" [DEFAULT] → /search-marking?date=ISO
  │   └─ "Método Tradicional" → /marking?date=ISO
  └─ "Voltar" button → / (Home)

/search-marking (Search-Based Marking)
  ├─ Mark attendance
  └─ Complete/Cancel → / (Home)

/marking (Swipe-Based Marking)
  ├─ Mark attendance
  └─ Complete/Cancel → / (Home)
```

**Navigation Protection:**
- TanStack Router's `useBlocker` prevents accidental exits
- Custom confirmation dialog: "Continuar a Marcar" vs "Sair Sem Guardar"
- Only blocks if unsaved attendance records exist

---

## Planned Future Features

### High Priority (Short-Term)

#### 1. Multiple Service Times Support
**Design:** Add service time selector on date selection page

- Dropdown or tabs for 9:00 AM and 11:00 AM services
- Separate attendance records for each service
- Future-proof for potential additional service times
- Update API to support service time parameter

#### 2. Student Notes/Comments During Marking
**Design:** Add notes field during attendance marking

- Optional notes field when marking each student
- Examples: "Seemed tired", "Asked good questions", "Needs follow-up"
- Store notes with attendance record
- Show notes in attendance history
- Useful for admins to review observations

#### 3. Absence Alert System
**Design:** Show alerts during attendance marking

- When marking student who missed 2-3 recent lessons, show alert
- Alert shows: Absence count + suggested action
- Example: "⚠️ Faltou às últimas 3 aulas - Considera falar com ele/ela"
- Prompts teacher to check in with student
- Configurable threshold (2-3 lessons, adjustable)

#### 4. Quick Visitor Addition
**Design:** Add visitor during attendance marking

- "+ Adicionar Visitante" button in marking interface
- Simple name input field
- Marks visitor as Present immediately
- Visitors stored separately in database (flag: `isVisitor: true`)
- Can later convert visitor to regular student

#### 5. Edit Attendance After Submission
**Design:** Edit button in attendance history

- Handle rare late arrivals
- Correction of mistakes
- Admin and teacher access
- Show edit history/audit trail
- Requires backend update to support PATCH requests

### Medium Priority (Next 3-6 Months)

#### 6. Carers List Widget
**Design:** Show on home page (below "Começar" button)

- "Meus Pré-adolescentes" section on home page
- Shows 3-5 students assigned to logged-in teacher
- Quick reminders: "Lembra-te de falar com..."
- Click student to see attendance history
- Admin interface to assign carers to students
- Currently managed in separate Excel file (needs integration)

#### 7. Lesson History & Resources
**Design:** New section accessible from navigation menu

- List view of all past lessons (date, name, link)
- Each lesson has:
  - **Resources shared:** Links, files, notes
  - **Comments:** What worked, what didn't, observations
  - **Curriculum rating:** Vote/rate to evaluate if change needed
- **Permissions:** All teachers can edit any lesson (collaborative)
- Rich text editor for lesson notes
- File attachments support

#### 8. Reports & Analytics Section
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

#### 9. Google Authentication
**Design:** Google OAuth login with teacher-only access

- Login required to access app
- Restrict to specific Google accounts (teacher email whitelist)
- Role-based access control:
  - **Admin:** Israel + wife (full access to all features)
  - **Teacher:** Regular teachers (attendance, lesson notes, reports)
- **Important:** Will likely require migrating from Apps Script to proper backend (Node.js/Firebase/etc.)

### Low Priority (Future Ideas)

#### 10. Migrate to Real Database
- Move from Google Sheets to PostgreSQL, MongoDB, or Firebase
- Better performance and scalability
- Enable more complex features (relationships, queries)
- Maintain Google Sheets as export/backup option

#### 11. Additional Ministry Features (Exploration Phase)
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

**Current State:**
- GET endpoint: Fetches all attendance data (students, dates, lessons)
- POST endpoint: Bulk update attendance records (**currently commented out in frontend for testing**)
- 10-second timeout protection
- Network status checking (`navigator.onLine`)
- Retry logic handled by TanStack Query

**Backend (Google Apps Script):**
- Deployed and working for GET requests
- Ready to accept POST requests when frontend uncommented
- Apps Script URL: `https://script.google.com/macros/s/AKfycbz-f51iHygWdwqBCJAentbbV-S50XZ8XvxE8JflZ9RiJpOCZPijit_u4-Iot6t59HYJpA/exec`

**Future Migration:**
- When adding Google OAuth, will need more robust backend
- Options: Node.js + Express, Firebase Functions, Next.js API routes
- Google Sheets can remain as database or migrate to PostgreSQL/Firebase

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
1. **No Authentication:** App is currently public (anyone with URL can use)
   - Intentional for development speed
   - Google OAuth planned for future

2. **Bulk Save Commented Out:** Frontend save function disabled for testing
   - Backend ready to receive data
   - Uncomment when ready for production

3. **Single Service Time:** Only supports one class time (11 AM)
   - Expansion to 9 AM + 11 AM needed soon
   - Will require service time selector and API updates

4. **No Edit After Save:** Can't edit attendance once submitted
   - Planned feature for handling late arrivals and corrections

5. **Google Sheets as Database:** Works for MVP but has limitations
   - May need real database for future features
   - Sheets API has rate limits
   - Complex queries difficult

6. **No Backup Strategy:** Google Sheets is single source of truth
   - No automated backups
   - Relies on Google's infrastructure

### Technical Debt
1. **Unused Dependency:** `react-hook-form` (can be removed)
2. **Dead Code:** `utils/cache.ts` appears unused (TanStack Query handles caching)
3. **State Management:** Evaluate if Zustand is necessary (React Query + React state may be sufficient)
4. **Hardcoded API URL:** Should be environment variable
5. **No Error Boundaries:** React error handling not implemented
6. **No Tests:** No testing setup (unit, integration, e2e)
7. **No i18n System:** Portuguese hardcoded (not needed, but worth noting)

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

---

## Technical Reference

### Key File Paths

**Features:**
- Home: `src/features/home/HomePage.tsx`
- Date Selection: `src/features/date-selection/DateSelectionPage.tsx`
- Swipe Marking: `src/features/attendance-marking/AttendanceMarkingPage.tsx`
- Search Marking: `src/features/search-marking/SearchAttendanceMarkingPage.tsx`

**Hooks:**
- Data Fetching: `src/hooks/useAttendanceData.ts`
- Navigation Block: `src/hooks/useNavigationBlock.ts`
- Pull to Refresh: `src/hooks/usePullToRefresh.ts`
- Swipe Gesture: `src/hooks/useSwipeGesture.ts`

**API & Data:**
- API Layer: `src/api/attendance.ts`
- Schemas: `src/schemas/attendance.schema.ts`
- Zustand Store: `src/store/attendanceStore.ts`

**Utilities:**
- Haptics: `src/utils/haptics.ts`
- Helper Functions: `src/utils/helperFunctions.tsx`
- Cache (unused): `src/utils/cache.ts`

**Config:**
- Query Client: `src/lib/queryClient.ts`
- Router: `src/router.tsx`
- Root Route: `src/routes/__root.tsx`
- Vite Config: `vite.config.ts`

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

### Environment Variables (Future)
When adding authentication and migrating backend:
```
VITE_API_URL=https://your-backend.com/api
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_GOOGLE_CLIENT_SECRET=your-client-secret
```

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

- **Current Version:** MVP (0.1.0)
- **Status:** Active development
- **Last Updated:** 2025-10-30
- **Deployment:** Vercel (production)
- **Repository:** Git repository with recent commits showing active development

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

*This documentation will be updated as the project evolves. AI assistants should refer to this file for context before making significant changes.*

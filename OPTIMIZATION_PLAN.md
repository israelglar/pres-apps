# React Performance & Code Quality Optimization Plan

> **Status:** Planning Phase
> **Created:** 2025-11-19
> **Scope:** Performance optimization, error resilience, and technical debt removal

---

## 🎯 Overview

This plan focuses on transforming the codebase into a high-performance application through systematic improvements. Based on comprehensive analysis, we've identified critical optimization opportunities that will significantly improve load time, runtime performance, and code maintainability.

**Exclusions:** Testing, accessibility, TypeScript strict mode, and notification systems are out of scope.

---

## 📊 Current State Analysis

### Bundle Size (CRITICAL)
- **Current:** 778.97 KB (213.75 KB gzipped)
- **Target:** <300 KB
- **Issue:** Build warns "Some chunks are larger than 500 KB after minification"
- **Root Cause:** No code splitting, all routes loaded eagerly

### Performance Issues
- Missing React.memo on list components (StudentList, StudentCard)
- No virtual scrolling (LessonsPage renders 100+ cards)
- Search not debounced (Fuse.js runs on every keystroke)
- Expensive array operations not memoized
- Event handlers recreated on every render

### Error Handling
- **Zero error boundaries** - any unhandled error crashes entire app
- Promise rejections not properly handled
- No global error handling in TanStack Query

### Technical Debt
- Dead code: `/src/api/attendance.ts` (legacy Google Sheets)
- Dead code: `/src/utils/cache.ts` (unused)
- Unused dependency: `react-hook-form` (0 usages, ~15 KB)
- Zustand barely used (only 2 simple values)
- 54+ console statements in production code
- Magic numbers hardcoded throughout

---

## 🚀 Phase 1: Bundle Optimization

**Goal:** Reduce bundle from 779 KB → ~300 KB (61% reduction)

### 1.1 Implement Code Splitting

**Files to modify:**
- `/src/App.tsx`
- `/src/main.tsx`

**Changes:**
```tsx
// Before: Eager loading
import HomePage from './features/home/HomePage';
import LessonsPage from './features/lessons/LessonsPage';

// After: Lazy loading
import { lazy, Suspense } from 'react';

const HomePage = lazy(() => import('./features/home/HomePage'));
const LessonsPage = lazy(() => import('./features/lessons/LessonsPage'));
const SearchMarkingPage = lazy(() => import('./features/search-marking/SearchAttendanceMarkingPage'));
const MarkingPage = lazy(() => import('./features/attendance-marking/AttendanceMarkingPage'));
const StudentManagementPage = lazy(() => import('./features/student-management/StudentManagementPage'));
const LessonDetailPage = lazy(() => import('./features/lessons/LessonDetailPage'));

// Wrap router with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <RouterProvider router={router} />
</Suspense>
```

**Create Loading Component:**
```tsx
// /src/components/ui/LoadingSpinner.tsx
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
  </div>
);
```

### 1.2 Configure Manual Chunks

**File:** `/vite.config.ts`

**Add to build configuration:**
```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-tanstack': ['@tanstack/react-router', '@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['lucide-react', 'fuse.js'],
        },
      },
    },
  },
});
```

**Benefits:**
- Better caching (vendor code changes less frequently)
- Parallel downloads
- Smaller chunks = faster parsing

### 1.3 Bundle Analysis

**Install analyzer:**
```bash
npm install -D rollup-plugin-visualizer
```

**Add to vite.config.ts:**
```ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  TanStackRouterVite(),
  VitePWA(/* ... */),
  visualizer({
    open: true,
    gzipSize: true,
    filename: 'bundle-stats.html'
  }),
]
```

**Actions after running build:**
1. Identify largest dependencies
2. Check if Lucide icons are tree-shaking properly
3. Look for duplicate code across chunks

### 1.4 Verify Tree-Shaking

**Check all files for incorrect imports:**

```tsx
// ❌ BAD - Imports entire library
import * as Icons from 'lucide-react';

// ✅ GOOD - Tree-shakeable
import { Calendar, Clock, Users } from 'lucide-react';
```

**Files to audit:** All files importing from `lucide-react`

### 1.5 Optimize PWA Precaching

**File:** `/vite.config.ts`

**Update workbox configuration:**
```ts
VitePWA({
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'supabase-api',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          },
        },
      },
    ],
  },
})
```

**Expected Outcome:**
- Initial bundle: 779 KB → ~300 KB
- Subsequent page loads: <50 KB (cached chunks)
- Time to Interactive: ~3s → ~1s

---

## ⚡ Phase 2: Performance Optimizations

**Goal:** Eliminate unnecessary re-renders and improve runtime performance

### 2.1 Add React.memo to List Components

**Files to optimize (11 total):**

#### High Priority (large lists):
1. `/src/components/features/StudentList.tsx` (lines 20-202)
2. `/src/features/student-management/StudentCard.tsx` (lines 22-100)
3. `/src/features/lessons/components/UnifiedLessonCard.tsx`

#### Medium Priority (smaller lists):
4. `/src/components/ui/SearchBar.tsx`
5. `/src/components/ui/FilterPanel.tsx`
6. `/src/components/ui/PageHeader.tsx`
7. `/src/features/date-selection/components/ServiceTimeCard.tsx`
8. `/src/features/date-selection/components/MethodCard.tsx`
9. `/src/features/date-selection/components/DateNavigator.tsx`
10. `/src/features/date-selection/components/ServiceTimePicker.tsx`
11. `/src/features/date-selection/components/QuickDateSelector.tsx`

**Pattern to apply:**

```tsx
// Before
export const StudentList: React.FC<StudentListProps> = ({
  students,
  onStudentClick
}) => {
  // Component logic
};

// After
export const StudentList = React.memo<StudentListProps>(({
  students,
  onStudentClick
}) => {
  // Component logic
});
```

**Important:** Components only benefit from React.memo if their props are stable (see next section).

### 2.2 Stabilize Callbacks with useCallback

**Files requiring callback optimization:**

#### `/src/features/search-marking/SearchAttendanceMarkingPage.tsx` (CRITICAL)

**Current issue (lines 153-161):**
```tsx
// ❌ BAD - Creates new function on every render, breaks memo
onStudentClick={(student, isMarked) => {
  if (isMarked) {
    handleUnmark(student.id);
  } else {
    handleMarkPresent(student);
  }
}}
```

**Solution - Move to logic file:**

**File:** `/src/features/search-marking/SearchAttendanceMarkingPage.logic.ts`

Add:
```tsx
const handleStudentClick = useCallback(
  (student: Student, isMarked: boolean) => {
    if (isMarked) {
      handleUnmark(student.id);
    } else {
      handleMarkPresent(student);
    }
  },
  [handleUnmark, handleMarkPresent]
);

// Return in hook
return {
  // ... existing returns
  handleStudentClick,
};
```

**Then in component:**
```tsx
<StudentList
  onStudentClick={handleStudentClick} // Stable reference
/>
```

#### Other files needing useCallback:
- `/src/features/student-management/StudentManagementPage.tsx` - Event handlers
- `/src/features/lessons/LessonsPage.tsx` - Filter handlers
- `/src/components/features/StudentList.tsx` - Card click handlers

### 2.3 Memoize Expensive Computations

**File:** `/src/components/features/StudentList.tsx` (lines 33-54)

**Current issue:**
```tsx
// ❌ Runs on EVERY render
const regularStudents: Student[] = [];
const presentVisitors: Student[] = [];

students.forEach((student) => {
  const record = attendanceRecords[student.id];
  if (student.isVisitor) {
    if (record && record.status === "P") {
      presentVisitors.push(student);
    }
  } else {
    regularStudents.push(student);
  }
});
```

**Solution:**
```tsx
const { regularStudents, presentVisitors } = useMemo(() => {
  const regular: Student[] = [];
  const visitors: Student[] = [];

  students.forEach((student) => {
    const record = attendanceRecords[student.id];
    if (student.isVisitor) {
      if (record && record.status === "P") {
        visitors.push(student);
      }
    } else {
      regular.push(student);
    }
  });

  return {
    regularStudents: regular,
    presentVisitors: visitors
  };
}, [students, attendanceRecords]);
```

#### Other files with expensive operations:
- `/src/features/search-marking/SearchAttendanceMarkingPage.tsx` (lines 66-82) - Filtering/mapping/sorting
- `/src/features/lessons/LessonsPage.logic.ts` (lines 142-200) - Multiple filter/map chains
- `/src/hooks/useAttendanceData.ts` - Check if all computations are memoized

### 2.4 Implement Virtual Scrolling

**Install dependency:**
```bash
npm install @tanstack/react-virtual
```

#### Implementation 1: LessonsPage (100+ cards)

**File:** `/src/features/lessons/LessonsPage.tsx`

**Before (lines 212-325):**
```tsx
{scheduledLessons.map((lesson) => (
  <UnifiedLessonCard key={lesson.id} lesson={lesson} />
))}
```

**After:**
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

function LessonsPage() {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: scheduledLessons.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated card height in pixels
    overscan: 5, // Render 5 extra items above/below viewport
  });

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height: 'calc(100vh - 200px)' }} // Adjust for header
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const lesson = scheduledLessons[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <UnifiedLessonCard lesson={lesson} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### Implementation 2: StudentList (50+ students)

**File:** `/src/components/features/StudentList.tsx`

Apply same pattern as above, adjusting:
- `estimateSize: () => 80` (smaller cards)
- Map over `regularStudents` array

**Expected Impact:**
- Render time: 200ms+ → <50ms
- Smooth 60fps scrolling
- Memory usage: -60%
- Only renders ~10-15 visible items instead of all 100+

### 2.5 Debounce Search Input

**File:** `/src/features/search-marking/SearchAttendanceMarkingPage.tsx`

**Current issue:** Fuse.js search runs on every keystroke.

**Solution using useDeferredValue:**

```tsx
import { useDeferredValue } from 'react';

function SearchAttendanceMarkingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const { results } = useFuseSearch({
    items: unmarkedStudents,
    searchQuery: deferredSearchQuery, // Use deferred value
    keys: ["name"],
  });

  // Input uses immediate value for responsive typing
  return (
    <SearchBar
      value={searchQuery}
      onChange={setSearchQuery}
    />
  );
}
```

**Alternative using useTransition:**

```tsx
import { useTransition } from 'react';

const [isPending, startTransition] = useTransition();

const handleSearchChange = (query: string) => {
  setSearchQuery(query); // Update input immediately
  startTransition(() => {
    setDeferredQuery(query); // Update search results in transition
  });
};

// Show loading indicator
{isPending && <span>A procurar...</span>}
```

**Impact:**
- Reduces Fuse.js executions by ~80%
- Keeps input responsive
- Search updates feel smooth, not janky

---

## 🛡️ Phase 3: Error Boundaries

**Goal:** Prevent app crashes from unhandled errors

### 3.1 Create Error Boundary Component

**New file:** `/src/components/ErrorBoundary.tsx`

```tsx
import { Component, ReactNode } from 'react';
import { theme } from '@/config/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
    // TODO: Send to error tracking service when implemented
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-5">
          <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-8 max-w-md w-full text-center`}>
            <div className={`${theme.backgrounds.errorLight} ${theme.text.error} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5`}>
              <span className="text-3xl">⚠️</span>
            </div>

            <h1 className={`text-2xl font-bold ${theme.text.primary} mb-3`}>
              Algo correu mal
            </h1>

            <p className={`${theme.text.neutral} mb-6`}>
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <div className={`${theme.backgrounds.neutralLight} p-3 rounded-lg mb-6 text-left overflow-auto max-h-32`}>
                <code className="text-xs text-red-600">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className={`flex-1 px-5 py-3 ${theme.backgrounds.neutral} ${theme.text.onLight} rounded-xl font-medium`}
              >
                Tentar Novamente
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className={`flex-1 px-5 py-3 ${theme.solids.background} ${theme.text.onPrimary} rounded-xl font-medium`}
              >
                Ir para Início
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 3.2 Global Error Boundary

**File:** `/src/App.tsx`

Wrap entire app:

```tsx
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

### 3.3 Route-Level Error Boundaries

**For critical features, add specific boundaries:**

```tsx
// In route definitions
{
  path: '/lessons',
  component: () => (
    <ErrorBoundary fallback={<LessonsErrorFallback />}>
      <LessonsPage />
    </ErrorBoundary>
  ),
}
```

**Create fallback components:**

```tsx
// /src/components/fallbacks/LessonsErrorFallback.tsx
export const LessonsErrorFallback = () => (
  <div className="p-5">
    <h2>Erro ao carregar lições</h2>
    <button onClick={() => window.location.reload()}>
      Recarregar
    </button>
  </div>
);
```

### 3.4 Configure TanStack Query Error Handling

**File:** `/src/lib/queryClient.ts`

Add global error handlers:

```tsx
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Query error:', error);
        // Errors still bubble up to error boundaries
      },
    },
    mutations: {
      retry: 2,
      onError: (error) => {
        console.error('Mutation error:', error);
        // Log for debugging, but let UI handle display
      },
    },
  },
});
```

### 3.5 Handle Promise Rejections

**File:** `/src/main.tsx`

Add global handler:

```tsx
// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent default browser behavior
});
```

**Expected Outcome:**
- App never crashes completely
- Users see helpful error messages in Portuguese
- Can recover without losing state
- Errors logged for debugging

---

## 🧹 Phase 4: Technical Debt Cleanup

**Goal:** Remove dead code, unused dependencies, improve code quality

### 4.1 Remove Dead Code

#### File 1: Delete `/src/api/attendance.ts`

**Reason:** Legacy Google Sheets API, replaced by Supabase

**Steps:**
1. Verify no imports: `grep -r "from '@/api/attendance'" src/`
2. Delete file
3. Delete any related types in `/src/types/`

#### File 2: Delete `/src/utils/cache.ts`

**Reason:** TanStack Query handles all caching

**Steps:**
1. Verify no imports: `grep -r "from '@/utils/cache'" src/`
2. Delete file

#### File 3: Remove unused imports

**After deleting above files, check for broken imports:**
```bash
npm run build
```

Fix any import errors.

### 4.2 Remove Unused Dependencies

#### Remove react-hook-form

**Verification:**
```bash
grep -r "react-hook-form" src/
# Should return 0 results
```

**Remove:**
```bash
npm uninstall react-hook-form
```

**Expected savings:** ~15 KB from bundle

#### Evaluate Zustand

**Current usage:** `/src/store/attendanceStore.ts` - Only 2 values:
- `selectedDate`
- `selectedMethod`

**Options:**

**Option A: Replace with URL state (recommended)**
```tsx
// In TanStack Router route
const { date, method } = Route.useSearch();

// Update via navigation
navigate({
  search: {
    date: newDate.toISOString(),
    method: 'search'
  }
});
```

**Benefits:**
- State persists in URL (shareable links)
- Back button works
- No extra dependency

**Option B: Replace with React Context**

If URL state doesn't fit, create simple context:

```tsx
// /src/contexts/AttendanceSelectionContext.tsx
const AttendanceSelectionContext = createContext<{
  selectedDate: Date | null;
  selectedMethod: 'swipe' | 'search' | null;
  setDate: (date: Date) => void;
  setMethod: (method: 'swipe' | 'search') => void;
}>(null!);
```

**If replaced:**
```bash
npm uninstall zustand
```

**Expected savings:** ~3 KB from bundle

### 4.3 Create Constants File

**New file:** `/src/config/constants.ts`

**Move magic numbers here:**

```ts
export const ATTENDANCE = {
  // Alert thresholds
  ABSENCE_ALERT_THRESHOLD: 3,

  // Gesture thresholds
  MIN_SWIPE_DISTANCE: 50,
  PULL_TO_REFRESH_DISTANCE: 120,

  // Status codes
  STATUS: {
    PRESENT: 'P',
    ABSENT: 'F',
    LATE: 'L',
    EXCUSED: 'E',
  } as const,
} as const;

export const UI = {
  // Animation durations (ms)
  TRANSITION_FAST: 150,
  TRANSITION_NORMAL: 300,
  TRANSITION_SLOW: 500,

  // Debounce delays (ms)
  SEARCH_DEBOUNCE: 300,

  // Pagination
  ITEMS_PER_PAGE: 20,
} as const;

export const QUERY = {
  // Stale times (ms)
  STALE_TIME_SHORT: 1 * 60 * 1000,  // 1 minute
  STALE_TIME_MEDIUM: 5 * 60 * 1000, // 5 minutes
  STALE_TIME_LONG: 15 * 60 * 1000,  // 15 minutes
} as const;
```

**Then replace hardcoded values across codebase:**

```tsx
// Before
if (absenceCount >= 3) { ... }

// After
import { ATTENDANCE } from '@/config/constants';
if (absenceCount >= ATTENDANCE.ABSENCE_ALERT_THRESHOLD) { ... }
```

### 4.4 Create Logger Utility

**New file:** `/src/utils/logger.ts`

```ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDev = import.meta.env.DEV;

  private log(level: LogLevel, ...args: any[]) {
    if (!this.isDev && level === 'debug') {
      return; // Skip debug logs in production
    }

    const prefix = `[${level.toUpperCase()}]`;

    switch (level) {
      case 'error':
        console.error(prefix, ...args);
        // TODO: Send to error tracking service
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'debug':
        console.log(prefix, ...args);
        break;
    }
  }

  debug(...args: any[]) {
    this.log('debug', ...args);
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }
}

export const logger = new Logger();
```

**Replace all console statements:**

```tsx
// Before
console.error('Failed to save attendance:', error);

// After
import { logger } from '@/utils/logger';
logger.error('Failed to save attendance:', error);
```

**Files with console statements (54 total across 15 files):**
- `/src/contexts/AuthContext.tsx` (14 statements)
- `/src/api/attendance.ts` (if not deleted yet)
- Search for all: `grep -r "console\." src/`

### 4.5 Fix TODO Comment

**File:** `/src/api/supabase/attendance.ts` (line 161)

**Current:**
```ts
marked_by: null, // TODO: Add teacher ID when auth is implemented
```

**Issue:** Auth IS implemented (`AuthContext` exists)

**Fix:**
```ts
import { useAuthContext } from '@/contexts/AuthContext';

// In function that saves attendance
const { user } = useAuthContext();

// When creating record
{
  marked_by: user?.id || null,
  // ...
}
```

### 4.6 Create Reusable Dialog Components

**Problem:** Dialog duplication in:
- `/src/features/lessons/components/NotesDialog.tsx`
- `/src/features/lessons/components/DeleteAttendanceDialog.tsx`
- `/src/features/student-management/DeleteConfirmDialog.tsx`
- `/src/components/features/QuickNoteModal.tsx`

**Solution:** Create generic dialog components

**New file:** `/src/components/ui/Dialog.tsx`

```tsx
import { ReactNode } from 'react';
import { theme } from '@/config/theme';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}: DialogProps) => {
  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Dialog */}
      <div
        className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-5 w-full ${widthClasses[maxWidth]} relative z-10`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className={`text-xl font-bold ${theme.text.primary}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 ${theme.backgrounds.neutralHover} rounded-lg`}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};
```

**New file:** `/src/components/ui/ConfirmDialog.tsx`

```tsx
import { Dialog } from './Dialog';
import { buttonClasses } from '@/config/theme';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <p className="mb-6">{message}</p>

      <div className="flex gap-3">
        <button
          onClick={onClose}
          className={`flex-1 ${buttonClasses.secondary}`}
        >
          {cancelText}
        </button>

        <button
          onClick={handleConfirm}
          className={`flex-1 ${variant === 'danger' ? buttonClasses.danger : buttonClasses.primary}`}
        >
          {confirmText}
        </button>
      </div>
    </Dialog>
  );
};
```

**Then refactor existing dialogs to use these components.**

---

## 📦 Dependencies Summary

### Add

```bash
npm install @tanstack/react-virtual
npm install -D rollup-plugin-visualizer
```

### Remove

```bash
npm uninstall react-hook-form
npm uninstall zustand  # If replaced with URL state or Context
```

### Net Change
- **Remove:** ~18 KB (react-hook-form + zustand)
- **Add:** ~2 KB (@tanstack/react-virtual)
- **Net savings:** ~16 KB
- **Plus bundle optimization:** 779 KB → ~300 KB total

---

## 📈 Expected Outcomes

### Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Bundle Size | 779 KB | ~300 KB | 61% reduction |
| Initial Load | ~3s | ~1s | 67% faster |
| Time to Interactive | ~3.5s | ~1.5s | 57% faster |
| LessonsPage Render | 200ms+ | <50ms | 75% faster |
| Search Responsiveness | Janky | Smooth | Qualitative |
| Scroll Performance | 30-45 FPS | 60 FPS | Consistent |

### Code Quality

| Metric | Before | After |
|--------|--------|-------|
| Dead Code (LOC) | ~500 | 0 |
| Unused Dependencies | 2 | 0 |
| Error Boundaries | 0 | 3+ |
| Magic Numbers | Many | Centralized |
| Console Statements | 54 | 0 (via logger) |

### User Experience

- ✅ No full-app crashes (error boundaries)
- ✅ Faster page loads (code splitting)
- ✅ Smoother scrolling (virtual lists)
- ✅ Responsive search (debouncing)
- ✅ Better error messages (Portuguese fallbacks)

---

## 🎯 Implementation Checklist

### Phase 1: Bundle Optimization
- [ ] Implement lazy loading for routes
- [ ] Create LoadingSpinner component
- [ ] Add Suspense boundaries
- [ ] Configure manual chunks in vite.config.ts
- [ ] Install and configure bundle visualizer
- [ ] Run build and analyze bundle
- [ ] Audit Lucide icon imports
- [ ] Optimize PWA precaching config
- [ ] Verify bundle is <300 KB

### Phase 2: Performance
- [ ] Add React.memo to 11 components (list in 2.1)
- [ ] Stabilize callbacks in SearchAttendanceMarkingPage
- [ ] Add useCallback to other event handlers
- [ ] Memoize StudentList computations
- [ ] Memoize other expensive operations
- [ ] Install @tanstack/react-virtual
- [ ] Implement virtual scrolling in LessonsPage
- [ ] Implement virtual scrolling in StudentList
- [ ] Add useDeferredValue to search
- [ ] Test performance improvements

### Phase 3: Error Boundaries
- [ ] Create ErrorBoundary component
- [ ] Add global boundary in App.tsx
- [ ] Create route-level boundaries
- [ ] Create error fallback components
- [ ] Configure TanStack Query error handling
- [ ] Add unhandledrejection listener
- [ ] Test error scenarios

### Phase 4: Technical Debt
- [ ] Delete /src/api/attendance.ts
- [ ] Delete /src/utils/cache.ts
- [ ] Uninstall react-hook-form
- [ ] Replace Zustand with URL state or Context
- [ ] Uninstall zustand (if replaced)
- [ ] Create constants.ts file
- [ ] Replace magic numbers across codebase
- [ ] Create logger.ts utility
- [ ] Replace all console statements
- [ ] Fix TODO in attendance.ts (teacher ID)
- [ ] Create Dialog component
- [ ] Create ConfirmDialog component
- [ ] Refactor existing dialogs

### Final Verification
- [ ] Run `npm run build` - no errors
- [ ] Check bundle size: <300 KB
- [ ] Test all routes load correctly
- [ ] Test error boundaries trigger properly
- [ ] Test virtual scrolling is smooth
- [ ] Test search is responsive
- [ ] Verify no console errors in production build
- [ ] Check lighthouse performance score

---

## 🚀 Getting Started

When ready to implement:

1. **Create a new branch:**
   ```bash
   git checkout -b optimization/performance-improvements
   ```

2. **Start with Phase 1** (biggest impact)

3. **Test after each phase** before moving to next

4. **Use this checklist** to track progress

5. **Commit frequently** with clear messages:
   ```bash
   git commit -m "perf: implement code splitting for routes"
   git commit -m "perf: add React.memo to list components"
   git commit -m "feat: add error boundaries"
   git commit -m "refactor: remove unused dependencies"
   ```

---

## 📝 Notes

- **Estimated time:** 2-3 weeks for full implementation
- **Can be done incrementally** - each phase is independent
- **Phase 1 has biggest impact** - prioritize if time limited
- **Test on mobile devices** throughout (primary target)
- **Monitor bundle size** after each change

---

**Last Updated:** 2025-11-19
**Status:** Ready for implementation

# Implementation Details & Technical Notes

## Date Handling

- All lesson dates are Sundays (class schedule)
- Dates stored in ISO format (YYYY-MM-DD)
- Automatically defaults to closest Sunday
- Supports past dates (historical attendance marking)
- Future dates filtered by default but can be toggled visible
- Lesson names and curriculum links tied to specific dates
- Date labels: "Hoje" (today), "Domingo Passado" (last Sunday)

## API Integration Notes

### Current State (Supabase)

- **GET Operations:** Fetches students, schedules, attendance, lessons
- **POST Operations:** Bulk create attendance records (fully implemented)
- **PATCH Operations:** Update individual attendance records (for editing history)
- **DELETE Operations:** Soft delete students (marks as inactive)
- 10-second timeout protection
- Network status checking (`navigator.onLine`)
- Retry logic handled by TanStack Query
- Optimistic updates for instant UI feedback

### API Layer Structure (`src/api/supabase/`)

- **`students.ts`** - getAllStudents, createStudent, updateStudent, deleteStudent
- **`lessons.ts`** - Lesson operations
- **`attendance.ts`** - bulkSaveAttendance, updateAttendance, getAttendanceStats
- **`schedules.ts`** - getSchedulesByDate, getScheduleWithDetails
- **`service-times.ts`** - getServiceTimes

### Legacy Code

- Old `src/api/attendance.ts` still exists (Google Sheets integration)
- Marked as deprecated but not removed yet
- Should be cleaned up once Supabase migration fully validated

## Known Limitations

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

## Common Development Tasks

### Adding a New Feature

1. Create directory in `/features/[feature-name]/`
2. Create main component: `[FeatureName]Page.tsx`
3. **Import theme:** `import { theme } from '@/config/theme'` - use theme constants for all colors
4. Separate business logic: `[FeatureName]Page.logic.ts` (if complex)
5. Create route in `/routes/[route-name].tsx`
6. Update navigation in existing pages
7. Consider admin vs teacher role access
8. Add Portuguese translations
9. Test on mobile device

### Modifying Attendance Flow

1. Changes affect both marking methods (Search and Swipe)
2. Update data models in `schemas/attendance.schema.ts`
3. Update API calls in `api/supabase/attendance.ts`
4. Update completion screen if needed
5. Test navigation blocking still works

### Changing Data Models

1. Update Zod schema in `schemas/attendance.schema.ts`
2. Update TypeScript types/interfaces in `types/database.types.ts`
3. Update API layer in `api/supabase/`
4. Update database schema in `database/schema.sql`
5. Create migration script if needed
6. Test with both old and new data formats (migration)

### UI Changes

1. **ALWAYS** import and use theme constants from `src/config/theme.ts`
   - Use `theme.text.primary`, `theme.backgrounds.primaryLight` for colors
   - **NEVER** hardcode colors - maintain consistency across all pages
2. Maintain gesture interactions (swipe, pull-to-refresh)
3. Keep large touch targets for mobile
4. Test haptic feedback still works
5. Ensure animations are smooth (GPU-accelerated)
6. Test on various screen sizes (iOS and Android)

## Testing Considerations

- Test on mobile devices (primary use case)
- Test haptic feedback on both iOS and Android
- Verify gesture interactions work smoothly
- Check offline behavior (should show cached data)
- Test with realistic student list size (~20-40 students)
- Test both marking methods (Search and Swipe)

## Context for AI Assistants

When suggesting changes:

- Explain trade-offs clearly
- Consider the volunteer/ministry context
- Test suggestions on mobile devices
- Keep the UX simple and forgiving
- Remember: Teachers are using this during class with pre-teens (distractions, time pressure)

# Authentication Debug Logging Guide

Comprehensive logging has been added to help debug authentication issues in production.

## Where Logs Are Added

### 1. AuthContext (`src/contexts/AuthContext.tsx`)

All authentication functions now have detailed logging:

- **Initialization**: `[AuthContext] Initializing auth...`
- **Session checks**: `[AuthContext] Initial session check`
- **Auth state changes**: `[AuthContext] Auth state changed`
- **Teacher profile loading**: `[AuthContext] loadTeacherProfile called for`
- **Google OAuth**: `[AuthContext] signInWithGoogle called`
- **Password sign-in**: `[AuthContext] signInWithPassword called for`
- **Sign out**: `[AuthContext] signOut called`

### 2. Schedules API (`src/api/supabase/schedules.ts`)

All schedule query functions now have detailed logging:

- **getAllSchedules**: `[Schedules API] getAllSchedules called`
- **getScheduleByDateAndService**: `[Schedules API] getScheduleByDateAndService called`
- **getScheduleByDate**: `[Schedules API] getScheduleByDate called`

Each log includes:
- Function parameters (date, serviceTimeId, etc.)
- Result count or data presence
- Error codes and messages

### 3. Route Guards

#### `_authenticated` Route (`src/routes/_authenticated.tsx`)
- Logs when checking authentication before loading protected routes
- Shows auth state: loading, session, teacher
- Logs redirect decisions

#### `/login` Route (`src/routes/login.tsx`)
- Logs when checking if user is already authenticated
- Shows redirect to home if already logged in

#### `/dev-login` Route (`src/routes/dev-login.tsx`)
- Logs login attempts
- Tracks navigation effect when teacher profile loads
- Shows when shouldNavigate flag is set

## How to Debug Production Issues

### Step 1: Open Browser Console
In production, open the browser's Developer Tools console (F12)

### Step 2: Monitor Authentication Flow

Look for this sequence when logging in:

```
[AuthContext] signInWithGoogle called
[AuthContext] OAuth redirect URL: https://your-domain.com/
[AuthContext] OAuth initiated successfully
// ... User completes Google OAuth ...
[AuthContext] Auth state changed: { event: 'SIGNED_IN', hasSession: true, userEmail: 'user@example.com' }
[AuthContext] Loading teacher profile for: user@example.com
[AuthContext] loadTeacherProfile called for: user@example.com
[AuthContext] Querying teachers table...
[AuthContext] Teacher query result: { hasData: true, teacherName: 'John Doe', error: undefined }
[AuthContext] Teacher profile loaded successfully: John Doe
[AuthContext] Setting loading to false
```

### Step 3: Identify Issues

#### Issue: Empty Schedules Response

If you see:
```
Request URL: https://...supabase.co/rest/v1/schedules?...
Status: 200 OK
Response: []
```

**This is likely a data issue, not an auth issue.** Check:
1. Does the `schedules` table have data?
2. Are the Row Level Security (RLS) policies correct?
3. Is the authenticated user's role correct in the `teachers` table?

#### Issue: No Teacher Profile Found

If you see:
```
[AuthContext] Teacher query result: { hasData: false, teacherName: undefined, error: 'PGRST116' }
[AuthContext] No teacher found for email: user@example.com
[AuthContext] Signing out unauthorized user...
```

**Problem**: The user's email is not in the `teachers` table or `is_active` is false.

**Solution**:
1. Check the `teachers` table for the user's email
2. Ensure `is_active = true`
3. Verify email whitelist in Supabase Auth hook

#### Issue: RLS Policy Error

If you see:
```
[AuthContext] Teacher query result: { hasData: false, error: 'PGRST301', errorCode: 'PGRST301' }
```

**Problem**: Row Level Security policies are blocking the query.

**Solution**: Check RLS policies on the `teachers` table in Supabase dashboard

#### Issue: Session Not Persisting

If you see repeated:
```
[AuthContext] Initial session check: { hasSession: false, userEmail: undefined }
```

**Problem**: Session cookies are not being stored/retrieved.

**Solution**:
1. Check browser cookie settings
2. Verify Supabase URL/keys are correct
3. Check for CORS issues

### Step 4: Check Network Tab

1. Go to Network tab in DevTools
2. Filter by "supabase"
3. Look for failed requests (red)
4. Check response bodies for error messages

## Common Production Issues

### 1. Empty Data Response (Status 200, empty array)

**Symptoms**:
- Auth logs show successful login
- Teacher profile loads successfully
- API requests return 200 but with empty arrays

**Example Logs**:
```
[AuthContext] Teacher profile loaded successfully: John Doe
[Schedules API] getAllSchedules called
[Schedules API] getAllSchedules result: { count: 0, hasError: false }
```

**Likely Causes**:
- **RLS policies too restrictive** - Most common issue!
- No data in the database
- Date/time filtering issues
- Wrong service_time_id or other filters

**Debug Steps**:
1. **Check RLS Policies First**:
   - Go to Supabase Dashboard → Authentication → Policies
   - Look at the `schedules` table policies
   - Common issue: Policy requires specific role that user doesn't have
   - Check if authenticated user has the correct role in `teachers` table

2. **Verify Data Exists**:
   - Go to Supabase Dashboard → Table Editor
   - Check `schedules` table has records
   - Note the dates and service_time_ids

3. **Test Without RLS** (temporarily):
   ```sql
   ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
   -- Test your app
   ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
   ```

4. **Check Query Parameters**:
   - Look at Network tab for the exact query
   - Verify date format (YYYY-MM-DD)
   - Check service_time_id is correct

5. **Review RLS Policy Examples**:
   ```sql
   -- Allow all authenticated users to read schedules
   CREATE POLICY "Allow authenticated users to read schedules"
   ON schedules FOR SELECT
   TO authenticated
   USING (true);

   -- Or restrict to teachers only
   CREATE POLICY "Allow teachers to read schedules"
   ON schedules FOR SELECT
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM teachers
       WHERE teachers.auth_user_id = auth.uid()
       AND teachers.is_active = true
     )
   );
   ```

### 2. "Access Denied" After Login

**Symptoms**:
- Login appears successful
- Immediately redirected to login page
- No teacher profile loaded

**Likely Causes**:
- Email not in `teachers` table
- `is_active = false` in teachers table
- Auth hook blocking the login

**Debug Steps**:
1. Check console for: `[AuthContext] No teacher found for email`
2. Verify email in `teachers` table via Supabase dashboard
3. Check auth hook logs in Supabase

### 3. Infinite Redirect Loop

**Symptoms**:
- Constantly redirecting between pages
- Console shows rapid fire route logs

**Likely Causes**:
- Teacher profile loading is failing silently
- Route guards conflicting

**Debug Steps**:
1. Look for errors in teacher profile loading
2. Check for missing `setLoading(false)` calls
3. Verify `context.auth.loading` state

## Removing Logs for Production

If logs become too verbose for production, you can wrap them with environment checks:

```typescript
if (import.meta.env.DEV) {
  console.log('[AuthContext] Debug message');
}
```

Or create a debug utility:

```typescript
const debug = (message: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(message, data);
  }
};
```

## Contact Points

When reporting issues, include:
1. Full console log output
2. Network tab screenshot of failed requests
3. User email being tested
4. Steps to reproduce

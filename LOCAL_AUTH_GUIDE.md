# Local Authentication Guide

This guide explains how to use the local authentication system with test users for testing role-based permissions.

## Overview

The app now supports **real Supabase authentication** in local development with pre-configured test users. This allows you to:

- ✅ Test RLS (Row Level Security) policies with authenticated sessions
- ✅ Easily switch between different user roles (admin, teacher, viewer)
- ✅ Test role-based page access and permissions
- ✅ Get realistic authentication behavior in local development

## Quick Start

### 1. Start Local Supabase

```bash
npx supabase start
```

### 2. Reset Database (First Time Setup)

```bash
npx supabase db reset
```

This will create 3 test users:
- `admin@test.local` / `admin123` (Admin role)
- `teacher@test.local` / `teacher123` (Teacher role)
- `viewer@test.local` / `viewer123` (Viewer role)

### 3. Disable Auth Bypass

Make sure your `.env.local` has:

```env
VITE_DEV_BYPASS_AUTH=false
```

### 4. Start Dev Server

```bash
npm run dev
```

### 5. Access Dev Login Page

Navigate to: **http://localhost:5173/dev-login**

Click on any test user to instantly sign in with that role.

## Test Users

| User | Email | Password | Role | Access Level |
|------|-------|----------|------|--------------|
| 👑 Admin Teacher | `admin@test.local` | `admin123` | admin | Full access to everything |
| 👨‍🏫 Regular Teacher | `teacher@test.local` | `teacher123` | teacher | Standard access for marking attendance |
| 👀 Viewer Only | `viewer@test.local` | `viewer123` | viewer | Read-only access (for future use) |

## How It Works

### Authentication Flow

1. Navigate to `/dev-login` (only available in development)
2. Click on a test user button
3. System calls `supabase.auth.signInWithPassword()`
4. Real Supabase session is created with JWT token
5. RLS policies check `auth.uid()` and grant access
6. User is redirected to home page

### Database Setup

The test users are created in two places:

1. **`supabase/seed.sql`** - Creates users in `auth.users` table with encrypted passwords
2. **`supabase/seed.sql`** - Adds users to `teachers` whitelist with appropriate roles

### Role Column

The `teachers` table has a `role` column (VARCHAR) with possible values:
- `'admin'` - Full access (for future role-based restrictions)
- `'teacher'` - Standard access
- `'viewer'` - Read-only access (for future use)

## Testing Different Scenarios

### Test RLS Policies

1. Sign in as `admin@test.local`
2. Navigate to any page
3. Check browser DevTools → Network tab
4. Verify requests return data (not empty arrays)

### Test Role Switching

1. Sign in as `teacher@test.local`
2. Navigate through the app
3. Sign out (if sign-out implemented)
4. Go back to `/dev-login`
5. Sign in as `admin@test.local`
6. Verify different role is loaded

### Test Authentication State

1. Sign in as any user
2. Open browser DevTools → Application → Storage
3. Check `supabase.auth.token` exists
4. Refresh page - should stay authenticated

## API Requests

After authentication, all Supabase requests will:

- ✅ Include a valid JWT token with `auth.uid()`
- ✅ Pass RLS policy checks (`auth.uid() IS NOT NULL`)
- ✅ Return actual data instead of empty arrays

### Example Request

```
GET http://localhost:54321/rest/v1/students?select=*&status=eq.active
Headers:
  Authorization: Bearer <JWT_TOKEN>
  apikey: <ANON_KEY>

Response: [... student data ...]  ✅ Not empty!
```

## Production vs Development

| Feature | Production | Local Development |
|---------|-----------|-------------------|
| Authentication | Google OAuth only | Password auth for test users |
| Test Users | ❌ Not available | ✅ Available via `/dev-login` |
| Auth Bypass | ❌ Never enabled | ⚠️ Can be enabled (not recommended) |
| RLS Policies | ✅ Enforced | ✅ Enforced (when using real auth) |

## Troubleshooting

### Empty Arrays Still Returned

**Problem:** Requests still return `[]` even after signing in.

**Solutions:**
1. Check `.env.local` has `VITE_DEV_BYPASS_AUTH=false`
2. Restart dev server after changing env variables
3. Clear browser localStorage and sign in again
4. Check browser DevTools → Application → Storage for `supabase.auth.token`

### Can't Access /dev-login

**Problem:** `/dev-login` page not found.

**Solutions:**
1. Ensure you're running in development mode (`npm run dev`)
2. File exists at `src/routes/dev-login.tsx`
3. Check TanStack Router generated routes

### Database Reset Fails

**Problem:** `npx supabase db reset` shows errors.

**Solutions:**
1. Ensure local Supabase is running: `npx supabase start`
2. Check if you have schema conflicts
3. Try: `npx supabase db reset --debug` for more info

### Sign In Fails

**Problem:** "Erro ao fazer login" message appears.

**Solutions:**
1. Ensure database was reset: `npx supabase db reset`
2. Check test users exist in Studio: http://localhost:54323
3. Verify passwords match (seed.sql uses `crypt()` function)
4. Check browser console for detailed error messages

## Code References

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx:143-159` | Password authentication implementation |
| `src/routes/dev-login.tsx` | Dev login page with test user buttons |
| `supabase/seed.sql:14-143` | Test user creation |
| `.env.local` | Local development configuration |

## Future Enhancements

When implementing role-based access control:

1. Check `teacher.role` in protected routes
2. Create role guards: `<RequireRole role="admin">...</RequireRole>`
3. Update RLS policies to use role column
4. Test with different roles using `/dev-login`

## Notes

- ⚠️ Test users are **ONLY** created in local development
- ⚠️ Production uses Google OAuth exclusively
- ⚠️ Never commit real passwords or tokens to version control
- ✅ Safe to commit test user credentials (they only work locally)

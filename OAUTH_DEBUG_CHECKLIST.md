# OAuth Debug Checklist - Session Not Found After Redirect

Based on the logs, the OAuth flow completes successfully, but the session is not being established. Here's what to check:

## Issue Identified

```
[AuthContext] Initial session check: {hasSession: false, userEmail: undefined, error: undefined}
[AuthContext] No session found, setting loading to false
```

After Google OAuth redirect, Supabase is not detecting/creating the session.

## Things to Check in Supabase Dashboard

### 1. Redirect URLs Configuration

Go to: **Supabase Dashboard → Authentication → URL Configuration**

**Required Redirect URLs:**
- `https://pres-apps.vercel.app/`
- `https://pres-apps.vercel.app/*` (wildcard)

**Current OAuth redirect from logs:**
```
[AuthContext] OAuth redirect URL: https://pres-apps.vercel.app/
```

✅ Make sure this EXACT URL is in the allowed redirect URLs list.

### 2. Google OAuth Provider Configuration

Go to: **Supabase Dashboard → Authentication → Providers → Google**

Check:
- ✅ Google OAuth is enabled
- ✅ Client ID matches your Google Cloud Console
- ✅ Client Secret is correct
- ✅ "Skip nonce check" is appropriate for your setup
- ✅ No additional scopes causing issues

### 3. Site URL Configuration

Go to: **Supabase Dashboard → Authentication → URL Configuration**

**Site URL should be:** `https://pres-apps.vercel.app`

### 4. Google Cloud Console Configuration

Go to: **Google Cloud Console → APIs & Services → Credentials**

**Authorized redirect URIs must include:**
```
https://vidjivsvfdcokonkjwvh.supabase.co/auth/v1/callback
```

✅ This is the Supabase callback URL that processes the OAuth response.

### 5. Email Domain Restrictions

If you have any email domain restrictions in Supabase, make sure the user's email domain is allowed.

## Common Causes of This Issue

### Cause 1: Redirect URL Mismatch (Most Common)

**Problem:** The redirect URL used in the OAuth request doesn't match what's configured in Supabase.

**From your logs:**
```
redirect_to=https://pres-apps.vercel.app/
```

**Solution:**
1. Add `https://pres-apps.vercel.app/*` to allowed redirect URLs in Supabase
2. Add `https://pres-apps.vercel.app/` (without wildcard) as well
3. Verify the "Site URL" is set to `https://pres-apps.vercel.app`

### Cause 2: Auth Hook Blocking Session Creation

**Problem:** If you have an auth hook checking the `teachers` table, it might be blocking the session creation.

**Check:** Go to **Supabase Dashboard → Database → Functions**

Look for functions like:
- `check_teacher_whitelist()`
- Any trigger on `auth.users`

**Verify:**
- The user's email exists in the `teachers` table
- `is_active = true` for that teacher
- The auth hook is not throwing errors

### Cause 3: CORS Issues

**Problem:** Cross-origin restrictions preventing session cookies from being set.

**Check browser console for:**
- CORS errors
- Cookie blocked warnings
- Third-party cookie warnings

**Solution:**
- Ensure your site URL is correctly configured
- Check if browser is blocking third-party cookies
- Try in incognito/private mode

### Cause 4: Session Storage Disabled

**Problem:** Browser blocking localStorage or cookies.

**Check:**
- Browser allows cookies for your domain
- No ad blockers/privacy extensions blocking localStorage
- Browser console for storage errors

## Debugging Steps

### Step 1: Check Supabase Dashboard Logs

1. Go to **Supabase Dashboard → Logs → Auth Logs**
2. Look for recent authentication attempts
3. Check for error messages

### Step 2: Inspect Network Tab

After OAuth redirect, check Network tab for:
1. POST request to `/auth/v1/token`
2. Response should contain `access_token` and `refresh_token`
3. Any 400/401/403 errors

### Step 3: Check localStorage

After redirect, open browser console and run:
```javascript
// Check all Supabase keys
Object.keys(localStorage).filter(k => k.includes('supabase'))

// Check specific session key (replace with your project ID)
localStorage.getItem('sb-vidjivsvfdcokonkjwvh-auth-token')
```

Expected: Should see a session object with tokens.
If empty: Session is not being stored → Check CORS/cookies.

### Step 4: Test OAuth Flow Manually

```javascript
// In browser console on your app
const { data, error } = await window.supabaseClient.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin + '/',
  }
})
console.log('OAuth result:', { data, error })
```

### Step 5: Verify Auth Hook

If you have an auth hook, temporarily disable it:

1. Go to **Supabase Dashboard → Database → Functions**
2. Find your auth hook function
3. Temporarily comment out or disable it
4. Test login again
5. Re-enable after testing

## Quick Fix Attempts

### Fix 1: Update Supabase Configuration

```typescript
// In src/lib/supabase.ts - Add flowType
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage,
    flowType: 'pkce', // Explicitly set flow type
  },
});
```

### Fix 2: Add Explicit Session Recovery

```typescript
// In AuthContext, after auth initialization
// Attempt to recover session from URL if none found
if (!session && (window.location.hash || window.location.search)) {
  console.log('[AuthContext] No session but URL has params, attempting recovery...');
  const { data, error } = await supabase.auth.getSession();
  if (data.session) {
    console.log('[AuthContext] Session recovered from URL!');
    setSession(data.session);
    setUser(data.session.user);
    loadTeacherProfile(data.session.user.email!);
  }
}
```

### Fix 3: Check for Race Condition

The issue might be timing-related. Try adding a small delay:

```typescript
// In AuthContext initialization
supabase.auth.getSession().then(async ({ data: { session }, error }) => {
  // If no session, wait a bit and try again (OAuth callback might still be processing)
  if (!session && window.location.pathname === '/') {
    console.log('[AuthContext] No immediate session, waiting 500ms and retrying...');
    await new Promise(resolve => setTimeout(resolve, 500));
    const { data: retryData } = await supabase.auth.getSession();
    if (retryData.session) {
      console.log('[AuthContext] Session found on retry!');
      session = retryData.session;
    }
  }

  // ... rest of the code
});
```

## Expected Logs After Fix

After successful OAuth login, you should see:

```
[AuthContext] Initializing auth...
[AuthContext] Current URL: https://pres-apps.vercel.app/#access_token=...
[AuthContext] Has hash fragment: true
[AuthContext] Initial session check: {hasSession: true, userEmail: 'user@example.com', accessToken: 'present'}
[AuthContext] Session found, loading teacher profile for: user@example.com
[AuthContext] loadTeacherProfile called for: user@example.com
[AuthContext] Teacher profile loaded successfully: [Name]
```

## Contact Supabase Support

If none of these work, contact Supabase support with:
1. Your project ID: `vidjivsvfdcokonkjwvh`
2. The OAuth redirect URL: `https://pres-apps.vercel.app/`
3. Screenshots of your Auth configuration
4. Browser console logs from this document
5. Network tab HAR file of the OAuth flow

# Database Setup Guide

This directory contains scripts and SQL for setting up and migrating your Supabase database.

## Quick Start

### 1. Set Up Database Tables

Run the setup instructions script:

```bash
npm run db:setup
```

Then follow the instructions to:
1. Open your Supabase SQL Editor
2. Copy the contents of `database/schema.sql`
3. Paste and run the SQL in Supabase

This creates all 7 core tables with proper indexes and Row Level Security policies.

### 2. Migrate Data from Google Sheets

After the tables are created, run the migration script to import existing data:

```bash
npm run db:migrate
```

This will:
- Fetch all student data from Google Sheets
- Import all lessons with curriculum links
- Create schedules for all lesson dates

### 3. Populate Teacher Assignments (NEW!)

Import teacher assignments to schedules:

```bash
npm run db:populate-assignments
```

This will:
- Map teachers to schedules from "Transformada" sheet
- Assign lead and supporting teachers
- Handle multi-teacher assignments

### 4. Populate Attendance Records (NEW!)

Import historical attendance data:

```bash
npm run db:populate-attendance
```

This will:
- Import attendance records from "Presenças" sheet
- Link students to schedules with present/absent status
- Handle 9h vs 11h service time distinctions

**📖 For detailed documentation on population scripts, see [POPULATION_GUIDE.md](POPULATION_GUIDE.md)**

## Files

- **`schema.sql`** - Complete database schema (run in Supabase SQL Editor)
- **`setup.ts`** - Helper script that displays setup instructions
- **`migrate-from-sheets.ts`** - Data migration script from Google Sheets
- **`populate-schedule-assignments.ts`** - Populates teacher assignments to schedules
- **`populate-attendance-records.ts`** - Populates historical attendance data
- **`POPULATION_GUIDE.md`** - Detailed guide for population scripts
- **`README.md`** - This file

## Database Tables

### Phase 1 Tables (Essential Features)

1. **students** - All pre-teen students and visitors
2. **teachers** - Ministry volunteers (8 teachers pre-populated)
3. **service_times** - Service times (9h and 11h pre-populated)
4. **lessons** - Curriculum lesson catalog
5. **schedules** - Lesson schedule (dates, times, lessons)
6. **schedule_assignments** - Teachers assigned to each schedule
7. **attendance_records** - Core attendance tracking

## Environment Variables Required

Make sure your `.env` file contains:

```env
VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Troubleshooting

### Migration Fails

**Problem:** Migration script can't connect to Google Sheets

**Solution:** Check that the Google Sheets API URL is still valid in `migrate-from-sheets.ts`

### Tables Already Exist

**Problem:** SQL script fails because tables already exist

**Solution:** The SQL uses `CREATE TABLE IF NOT EXISTS`, so it's safe to re-run. If you want to start fresh:
1. Go to Supabase Dashboard → Database → Tables
2. Delete the existing tables
3. Re-run the schema.sql

### RLS Policies Conflict

**Problem:** Policies already exist with the same name

**Solution:** The SQL includes `DROP POLICY IF EXISTS` before creating policies, so it's safe to re-run.

## Security Notes

### Current Setup (Development)

- **Row Level Security (RLS)** is ENABLED on all tables
- **Public access policies** allow anyone to read/write (no authentication required)
- This is intentional for the MVP phase

### Future (Production)

When implementing Google OAuth authentication:
1. Update RLS policies to check `auth.uid()`
2. Restrict teacher table to specific email addresses
3. Add role-based access control (admin vs teacher)

## Data Migration Strategy

### What Gets Migrated

✅ Students (names, visitor status)
✅ Lessons (names, curriculum links, series)
✅ Schedules (dates, lesson assignments)

### What Doesn't Get Migrated

❌ Attendance records (start fresh)
❌ Historical teacher assignments
❌ Student notes/comments

**Reason:** Clean slate for the new system. Teachers will mark attendance going forward.

## Next Steps After Setup

1. ✅ Run `npm run db:setup` (get instructions)
2. ✅ Execute SQL in Supabase SQL Editor
3. ✅ Run `npm run db:migrate` (import data)
4. ✅ Run `npm run dev` (test the app)
5. ✅ Verify data appears correctly in the app
6. ✅ Mark test attendance to confirm save works
7. ✅ Check Supabase Table Editor to see saved data

## Support

If you encounter issues:
1. Check the Supabase logs in the Dashboard
2. Verify environment variables are correct
3. Ensure the Google Sheets API is still accessible
4. Check the browser console for errors

---

**Last Updated:** 2025-10-31
**Version:** 1.0 (MVP)

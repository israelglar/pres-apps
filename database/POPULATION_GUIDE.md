# Database Population Guide

This guide explains how to populate your Supabase database with data from Google Sheets.

## Scripts Overview

### 1. **populate-schedule-assignments.ts**
Imports teacher assignments from the "Transformada" sheet and creates `schedule_assignments` records.

**What it does:**
- Maps teachers to schedules based on dates and service times
- Parses teacher names from "Equipa" column (handles formats like "Israel e Jeisi", multi-line assignments)
- Assigns first teacher as "lead", others as "teacher" role
- Handles special case "TODOS" (assigns all teachers to retreat)

### 2. **populate-attendance-records.ts**
Imports student attendance from the "Presenças" sheet and creates `attendance_records`.

**What it does:**
- Maps student names to database IDs
- Parses attendance status: "P" (present), "F" (absent), "P (9h)" (present at 9h service)
- Links attendance to correct schedule and service time
- Skips empty cells (not marked yet)

---

## Prerequisites

Before running these scripts, you must:

1. ✅ **Run database setup** (`npm run db:setup`)
   - Creates all tables with SQL in Supabase

2. ✅ **Run data migration** (`npm run db:migrate`)
   - Imports students, lessons, and schedules
   - These scripts depend on existing data!

3. ✅ **Verify your .env file** contains:
   ```env
   VITE_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   VITE_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## Usage

### Step 1: Populate Schedule Assignments

```bash
npm run db:populate-assignments
```

**What you'll see:**
```
╔══════════════════════════════════════════════════════════════════════════╗
║              POPULATE SCHEDULE ASSIGNMENTS FROM GOOGLE SHEETS            ║
╚══════════════════════════════════════════════════════════════════════════╝

📥 Fetching schedule assignments from Google Sheets...
✅ Parsed 37 schedule assignments

👥 Importing schedule assignments to Supabase...
   Found 8 teachers in database
   Found 37 schedules in database
   ✅ 2025-10-12 (09:00:00): 2 teacher(s)
   ✅ 2025-10-12 (11:00:00): 2 teacher(s)
   ✅ 2025-10-19 (11:00:00): 2 teacher(s)
   ...

✨ Import complete! 74 assignments created, 0 skipped, 0 errors

🎉 All done! Schedule assignments populated successfully.
```

**Result:**
- Each schedule now has assigned teachers
- Teachers marked with roles ("lead" or "teacher")

---

### Step 2: Populate Attendance Records

```bash
npm run db:populate-attendance
```

**What you'll see:**
```
╔══════════════════════════════════════════════════════════════════════════╗
║               POPULATE ATTENDANCE RECORDS FROM GOOGLE SHEETS             ║
╚══════════════════════════════════════════════════════════════════════════╝

📥 Fetching attendance records from Google Sheets...
✅ Parsed 138 attendance records

📝 Importing attendance records to Supabase...
   Found 48 students in database
   Found 37 schedules in database

✨ Import complete! 138 records created, 0 skipped, 0 errors

🎉 All done! Attendance records populated successfully.

📊 Next steps: Check Supabase Table Editor to verify the data.
```

**Result:**
- Historical attendance records now in database
- Each record linked to student, schedule, and service time

---

## Data Mapping Details

### Schedule Assignments Mapping

**From "Transformada" sheet:**
```
Data                    | Equipa
2025/10/12 09:00:00    | Israel e Jeisi
2025/10/26 11:00:00    | Ivandro e Ana\nIsrael e Jeisi
2025/03/29 11:00:00    | TODOS
```

**To database:**
```sql
-- 2025-10-12 09:00:00 -> Israel e Jeisi
INSERT INTO schedule_assignments (schedule_id, teacher_id, role) VALUES
  (1, 1, 'lead'),    -- Israel as lead
  (1, 2, 'teacher'); -- Jeisi as teacher

-- Multi-line assignments create multiple records
INSERT INTO schedule_assignments (schedule_id, teacher_id, role) VALUES
  (3, 5, 'lead'),    -- Ivandro
  (3, 6, 'teacher'), -- Ana
  (3, 1, 'teacher'), -- Israel
  (3, 2, 'teacher'); -- Jeisi

-- TODOS assigns all 8 teachers
INSERT INTO schedule_assignments (schedule_id, teacher_id, role) VALUES
  (10, 1, 'lead'),    -- Israel (first)
  (10, 2, 'teacher'), -- Jeisi
  (10, 3, 'teacher'), -- Ailton
  ... -- (all 8 teachers)
```

### Attendance Records Mapping

**From "Presenças" sheet:**
```
Nome                          | 12/10/25 | 19/10/25 | 26/10/25
Benjamin Miguel dos Santos    | P (9h)   |          | P
Alice Lopes de Matos          | F        |          | P
Isadora Barbosa de Andrade    |          |          | F
```

**To database:**
```sql
-- Benjamin: Present at 9h service on 12/10/25
INSERT INTO attendance_records (student_id, schedule_id, status, service_time_id) VALUES
  (7, 1, 'present', 1); -- schedule_id=1 is 2025-10-12 09:00:00

-- Benjamin: Present at 11h service on 26/10/25
INSERT INTO attendance_records (student_id, schedule_id, status, service_time_id) VALUES
  (7, 3, 'present', 2); -- schedule_id=3 is 2025-10-26 11:00:00

-- Alice: Absent on 12/10/25
INSERT INTO attendance_records (student_id, schedule_id, status, service_time_id) VALUES
  (1, 2, 'absent', 2); -- schedule_id=2 is 2025-10-12 11:00:00

-- Isadora: Empty cell on 12/10/25 = SKIPPED (not marked yet)
-- Isadora: Absent on 26/10/25
INSERT INTO attendance_records (student_id, schedule_id, status, service_time_id) VALUES
  (19, 3, 'absent', 2);
```

**Status Mapping:**
- `"P"` → `status='present'`, default service time (11h)
- `"P (9h)"` → `status='present'`, service_time_id=1 (9h)
- `"F"` → `status='absent'`
- Empty/blank → **SKIPPED** (not marked)

---

## Troubleshooting

### Problem: "Student not found"

**Error message:**
```
⚠️  Student not found: "Gabriel David Rodrigues "
```

**Cause:** Student name in "Presenças" sheet doesn't match database exactly (trailing space).

**Solution:**
1. Check student names in database: `SELECT name FROM students;`
2. Update the name in Google Sheets to match exactly
3. Or add name normalization to the script (trim spaces)

---

### Problem: "No schedule found"

**Error message:**
```
⚠️  Skipping: No schedule found for 2025-10-12 at 09:00:00
```

**Cause:** Schedule doesn't exist in database for that date/time.

**Solution:**
1. Run migration script first: `npm run db:migrate`
2. Or manually create the schedule in Supabase

---

### Problem: "No teachers found"

**Error message:**
```
⚠️  Skipping: No teachers found for 2025-10-12 (Israel, Jeisi)
```

**Cause:** Teacher name mapping failed.

**Solution:**
Check `teacherNameMap` in `populate-schedule-assignments.ts`:
```typescript
const teacherNameMap: Record<string, string> = {
  Israel: "Israel",
  Jeisi: "Jeisi",
  // Add missing names here
};
```

---

## Data Verification

After running the scripts, verify the data in Supabase:

### Check Schedule Assignments

```sql
SELECT
  s.date,
  st.name as service_time,
  l.name as lesson,
  t.name as teacher,
  sa.role
FROM schedule_assignments sa
JOIN schedules s ON sa.schedule_id = s.id
JOIN teachers t ON sa.teacher_id = t.id
JOIN service_times st ON s.service_time_id = st.id
LEFT JOIN lessons l ON s.lesson_id = l.id
ORDER BY s.date, st.name, sa.role;
```

**Expected result:**
```
date       | service_time | lesson                              | teacher  | role
-----------|--------------|-------------------------------------|----------|--------
2025-10-12 | 9h           | Q4 1. How Could a Loving God...    | Israel   | lead
2025-10-12 | 9h           | Q4 1. How Could a Loving God...    | Jeisi    | teacher
2025-10-12 | 11h          | Q4 1. How Could a Loving God...    | Israel   | lead
2025-10-12 | 11h          | Q4 1. How Could a Loving God...    | Jeisi    | teacher
```

---

### Check Attendance Records

```sql
SELECT
  s.date,
  st.name as service_time,
  stud.name as student,
  ar.status
FROM attendance_records ar
JOIN schedules s ON ar.schedule_id = s.id
JOIN students stud ON ar.student_id = stud.id
JOIN service_times st ON ar.service_time_id = st.id
WHERE s.date = '2025-10-12'
ORDER BY stud.name;
```

**Expected result:**
```
date       | service_time | student                            | status
-----------|--------------|------------------------------------|---------
2025-10-12 | 9h           | Benjamin Miguel dos Santos Costa   | present
2025-10-12 | 11h          | Alice Lopes de Matos              | absent
2025-10-12 | 11h          | Alice Vieira Carvalho             | present
2025-10-12 | 11h          | Andrés James Jouk Ayeek           | present
```

---

## Advanced: Updating the Scripts

If you need to fetch live data from Google Sheets instead of hardcoded data:

### Option 1: Use Google Sheets API

```typescript
// Install: npm install googleapis
import { google } from 'googleapis';

const sheets = google.sheets({ version: 'v4', auth: apiKey });

const response = await sheets.spreadsheets.values.get({
  spreadsheetId: '1zdWGbezg86eSzLglcueVWX9-oRPVxbWaD5cTMdyZiSg',
  range: 'Transformada!A2:B50',
});

const rawData = response.data.values;
```

### Option 2: Use Existing MCP Integration

The project already has `mcp__google-sheets__get_sheet_data` integration. You could refactor the scripts to use that.

---

## Full Workflow Example

Complete setup from scratch:

```bash
# 1. Set up database tables
npm run db:setup
# (Follow instructions to run SQL in Supabase)

# 2. Migrate base data (students, lessons, schedules)
npm run db:migrate

# 3. Populate teacher assignments
npm run db:populate-assignments

# 4. Populate attendance records
npm run db:populate-attendance

# 5. Start the app
npm run dev
```

**Total time:** ~5-10 minutes

---

## Summary

| Script | Purpose | Dependencies | Output |
|--------|---------|--------------|--------|
| `db:setup` | Create tables | Supabase access | 7 tables created |
| `db:migrate` | Import base data | Tables exist | Students, lessons, schedules |
| `db:populate-assignments` | Teacher assignments | Schedules, teachers | schedule_assignments |
| `db:populate-attendance` | Attendance history | Students, schedules | attendance_records |

**Recommended order:** Always run in sequence (1 → 2 → 3 → 4).

---

## Need Help?

Check:
1. Supabase logs in Dashboard
2. Browser console for errors
3. Database README: `database/README.md`
4. Migration guide: `SUPABASE_MIGRATION.md`

---

**Last Updated:** 2025-10-31
**Version:** 1.0

# Population Scripts - Quick Summary

## ✅ What Was Created

Two new database population scripts to import historical data from Google Sheets:

### 1. **populate-schedule-assignments.ts**
📁 `database/populate-schedule-assignments.ts`

**Purpose:** Import teacher assignments to schedules

**Data Source:** Google Sheets "Transformada" sheet (columns: Data, Equipa)

**What it imports:**
- Teacher assignments for each schedule (date + service time)
- Handles multi-teacher assignments (e.g., "Israel e Jeisi")
- Handles multi-line assignments (e.g., "Ivandro e Ana\nIsrael e Jeisi")
- Special case: "TODOS" assigns all teachers (e.g., "Retiro Bíblico")
- Assigns roles: first teacher = "lead", others = "teacher"

**Example data processed:**
```
2025/10/12 09:00:00  →  Israel e Jeisi
2025/10/26 11:00:00  →  Ivandro e Ana\nIsrael e Jeisi
2025/03/29 11:00:00  →  TODOS (all 8 teachers)
```

---

### 2. **populate-attendance-records.ts**
📁 `database/populate-attendance-records.ts`

**Purpose:** Import historical attendance records

**Data Source:** Google Sheets "Presenças" sheet (student names + date columns)

**What it imports:**
- Attendance records for each student on each date
- Status mapping:
  - `"P"` → present (default 11h service)
  - `"P (9h)"` → present at 9h service
  - `"F"` → absent (falta)
  - Empty/blank → skipped (not marked)
- Links records to correct student, schedule, and service time

**Example data processed:**
```
Student Name                    | 12/10/25 | 19/10/25 | 26/10/25
Benjamin Miguel dos Santos      | P (9h)   |          | P
Alice Lopes de Matos           | F        |          | P
Isadora Barbosa de Andrade     |          |          | F
```

---

## 🚀 How to Use

### Complete Setup Workflow

```bash
# 1. Set up database tables
npm run db:setup
# Follow instructions to run SQL in Supabase SQL Editor

# 2. Migrate base data (students, lessons, schedules)
npm run db:migrate

# 3. NEW: Populate teacher assignments
npm run db:populate-assignments

# 4. NEW: Populate attendance records
npm run db:populate-attendance

# 5. Start the app and test
npm run dev
```

---

## 📊 What Gets Populated

### Before Running Scripts

```
✅ students (48+ students)
✅ teachers (8 teachers)
✅ service_times (9h, 11h)
✅ lessons (~50 lessons)
✅ schedules (~37 schedules)
❌ schedule_assignments (EMPTY)
❌ attendance_records (EMPTY)
```

### After Running Scripts

```
✅ students (48+ students)
✅ teachers (8 teachers)
✅ service_times (9h, 11h)
✅ lessons (~50 lessons)
✅ schedules (~37 schedules)
✅ schedule_assignments (~74 assignments) ← POPULATED
✅ attendance_records (~138 records) ← POPULATED
```

---

## 📝 Package.json Scripts Added

```json
{
  "scripts": {
    "db:populate-assignments": "tsx database/populate-schedule-assignments.ts",
    "db:populate-attendance": "tsx database/populate-attendance-records.ts"
  }
}
```

---

## 📚 Documentation Created

1. **`database/populate-schedule-assignments.ts`**
   - Full TypeScript implementation
   - Date/time parsing logic
   - Teacher name mapping
   - Multi-line assignment handling

2. **`database/populate-attendance-records.ts`**
   - Full TypeScript implementation
   - Attendance status parsing
   - Service time detection (9h vs 11h)
   - Student name matching

3. **`database/POPULATION_GUIDE.md`**
   - Comprehensive documentation
   - Usage instructions
   - Data mapping details
   - Troubleshooting guide
   - Verification queries

4. **Updated `database/README.md`**
   - Added population steps
   - Linked to detailed guide

---

## 🎯 Key Features

### Smart Data Parsing

**Schedule Assignments:**
- ✅ Handles various date formats: `2025/10/12`, `2026/4/12`
- ✅ Parses teacher lists: `"Israel e Jeisi"` → [Israel, Jeisi]
- ✅ Handles multi-line: `"Ivandro e Ana\nIsrael e Jeisi"` → [Ivandro, Ana, Israel, Jeisi]
- ✅ Special case: `"TODOS"` → assigns all 8 teachers

**Attendance Records:**
- ✅ Status mapping: `"P"` → present, `"F"` → absent
- ✅ Service time detection: `"P (9h)"` → present at 9h service
- ✅ Empty cells → skipped (not imported as absence)
- ✅ Student name matching with database

### Safe Operations

- ✅ Uses `upsert` with `onConflict` - won't create duplicates
- ✅ Validates data before insertion
- ✅ Skips missing students/schedules gracefully
- ✅ Provides detailed logging and error messages
- ✅ Reports statistics (success, skipped, errors)

---

## 🔍 Verification

After running scripts, verify in Supabase:

### Check Schedule Assignments
```sql
SELECT
  s.date,
  st.name as service_time,
  t.name as teacher,
  sa.role
FROM schedule_assignments sa
JOIN schedules s ON sa.schedule_id = s.id
JOIN teachers t ON sa.teacher_id = t.id
JOIN service_times st ON s.service_time_id = st.id
ORDER BY s.date;
```

### Check Attendance Records
```sql
SELECT
  s.date,
  st.name as service,
  stud.name as student,
  ar.status
FROM attendance_records ar
JOIN schedules s ON ar.schedule_id = s.id
JOIN students stud ON ar.student_id = stud.id
JOIN service_times st ON ar.service_time_id = st.id
WHERE s.date = '2025-10-12'
ORDER BY stud.name;
```

---

## ⚠️ Important Notes

### Prerequisites
1. **Must run `npm run db:setup` first** (create tables)
2. **Must run `npm run db:migrate` first** (import students, lessons, schedules)
3. **These scripts depend on existing data!**

### Data Source
- Currently uses **hardcoded data** from the Google Sheets
- Data snapshot taken from: `https://docs.google.com/spreadsheets/d/1zdWGbezg86eSzLglcueVWX9-oRPVxbWaD5cTMdyZiSg`
- Sheets: "Transformada" and "Presenças"

### Future Enhancement
- Could be updated to fetch live data from Google Sheets API
- Or use the existing MCP Google Sheets integration

---

## 📖 Full Documentation

For detailed information, troubleshooting, and advanced usage:

👉 **[database/POPULATION_GUIDE.md](database/POPULATION_GUIDE.md)**

Includes:
- Detailed data mapping examples
- Troubleshooting common issues
- Verification SQL queries
- Advanced customization options

---

## ✨ Benefits

### Why These Scripts?

1. **Complete Historical Data**
   - App now has full attendance history from Google Sheets
   - Teachers can see who taught which lessons
   - Attendance patterns visible from day one

2. **Smooth Transition**
   - Users see familiar data immediately
   - No "starting from scratch" feeling
   - Historical context preserved

3. **Easy to Run**
   - One command per script
   - Clear, informative output
   - Safe to re-run (upsert logic)

4. **Well Documented**
   - Comprehensive guides
   - Example queries
   - Troubleshooting tips

---

## 🎉 Summary

You now have **complete database population** from Google Sheets:

```
✅ Students imported          (db:migrate)
✅ Teachers pre-populated     (db:setup)
✅ Service times set up       (db:setup)
✅ Lessons imported          (db:migrate)
✅ Schedules created         (db:migrate)
✅ Teacher assignments       (db:populate-assignments) ← NEW
✅ Attendance records        (db:populate-attendance)  ← NEW
```

**Total commands to go from zero to fully populated database:**

```bash
npm run db:setup              # 1. Create tables
npm run db:migrate            # 2. Import base data
npm run db:populate-assignments  # 3. Import assignments
npm run db:populate-attendance   # 4. Import attendance
```

**Time estimate:** 5-10 minutes ⏱️

---

**Ready to use!** 🚀

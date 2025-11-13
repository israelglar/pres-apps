# Project Roadmap

## ✅ Recently Implemented

The following features were previously planned and are now **fully implemented**:

1. **✅ Multiple Service Times Support** - Radio button selector on date selection, separate tracking per service
2. **✅ Edit Attendance After Submission** - Full edit capability in attendance history with notes
3. **✅ Student Management** - Complete CRUD interface with visitor tracking and status management
4. **✅ Attendance History** - View past records with service time filtering and pagination
5. **✅ Google OAuth Authentication** - Secure login with email whitelist
6. **✅ Absence Alert System** - Shows alerts during attendance marking when students miss 3+ consecutive Sundays, with dismissible warnings
7. **✅ Quick Visitor Addition** - Add visitors directly during attendance marking flow with smart search and auto-present marking

---

## High Priority (Short-Term)

### 1. Student Notes/Comments During Marking

**Status:** **Partially Implemented** - Notes can be added when editing past attendance, but not during initial marking

**Remaining Work:** Add notes field during attendance marking

- Optional notes field when marking each student in real-time
- Examples: "Seemed tired", "Asked good questions", "Needs follow-up"
- Currently only available when editing past records
- Would allow capturing observations at time of marking

---

## Medium Priority (Next 3-6 Months)

### 2. Carers List Widget

**Design:** Show on home page

- "Meus Pré-adolescentes" section on home page
- Shows 3-5 students assigned to logged-in teacher
- Quick reminders: "Lembra-te de falar com..."
- Click student to see attendance history
- Admin interface to assign carers to students
- Currently managed in separate Excel file (needs integration)

### 3. Lesson History & Resources

**Design:** New section accessible from navigation menu

- List view of all past lessons (date, name, link)
- Each lesson has:
  - **Resources shared:** Links, files, notes
  - **Comments:** What worked, what didn't, observations
  - **Curriculum rating:** Vote/rate to evaluate if change needed
- **Permissions:** All teachers can edit any lesson (collaborative)
- Rich text editor for lesson notes
- File attachments support

### 4. Reports & Analytics Section

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

### 5. Role-Based Permissions (Future Enhancement)

**Status:** Authentication implemented, but all teachers have equal access

**Future:** Differentiate admin vs teacher permissions

- **Admin permissions** (Israel + wife):
  - Manage teachers (add/remove/deactivate)
  - Manage students (already implemented for all)
  - Access to all reports and data
  - System configuration
- **Teacher permissions:**
  - Mark attendance (already implemented)
  - View attendance history (already implemented)
  - Manage students (consider restricting to admins only)
- Implementation: Use `teachers.role` column (already exists: 'admin' or 'teacher')

---

## Low Priority (Future Ideas)

### 6. Enhanced Database Features

**Status:** **Database migration complete** - Now using Supabase PostgreSQL

**Remaining Work:** Take advantage of relational database capabilities

- Implement complex queries and reports
- Add foreign key relationships where missing
- Optimize query performance with indexes
- Add database-level validation and constraints
- Implement audit trails for data changes

### 7. Additional Ministry Features (Exploration Phase)

- Communication with parents (announcements, updates)
- Event planning (camps, trips, special events)
- Student progress/milestone tracking
- Volunteer/teacher scheduling
- Resource management (materials, supplies inventory)
- Curriculum planning and evaluation

---

## Version History

- **Current Version:** MVP (0.2.0)
- **Status:** Active development
- **Last Updated:** 2025-11-13
- **Deployment:** Vercel (production)
- **Repository:** Git repository with recent commits showing active development

### Recent Major Changes (0.2.0)

- ✅ **Database Migration:** Migrated from Google Sheets to Supabase PostgreSQL
- ✅ **Student Management:** Full CRUD interface for managing student roster
- ✅ **Attendance History:** View and edit past attendance with pagination
- ✅ **Multiple Service Times:** Support for 09:00 and 11:00 services
- ✅ **Enhanced Attendance:** 4 status types (present/absent/late/excused) with notes
- ✅ **PWA Install Prompt:** Install button on home page
- ✅ **Google OAuth Authentication:** Secure login with teacher email whitelist
- ✅ **Absence Alert System:** Shows alerts when students miss 3+ consecutive Sundays
- ✅ **Quick Visitor Addition:** Add visitors directly during attendance marking flow

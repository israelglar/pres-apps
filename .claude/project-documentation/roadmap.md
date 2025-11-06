# Project Roadmap

## ✅ Recently Implemented

The following features were previously planned and are now **fully implemented**:

1. **✅ Multiple Service Times Support** - Radio button selector on date selection, separate tracking per service
2. **✅ Edit Attendance After Submission** - Full edit capability in attendance history with notes
3. **✅ Student Management** - Complete CRUD interface with visitor tracking and status management
4. **✅ Attendance History** - View past records with service time filtering and pagination
5. **✅ Google OAuth Authentication** - Secure login with email whitelist

---

## High Priority (Short-Term)

### 1. Student Notes/Comments During Marking

**Status:** **Partially Implemented** - Notes can be added when editing past attendance, but not during initial marking

**Remaining Work:** Add notes field during attendance marking

- Optional notes field when marking each student in real-time
- Examples: "Seemed tired", "Asked good questions", "Needs follow-up"
- Currently only available when editing past records
- Would allow capturing observations at time of marking

### 2. Absence Alert System

**Design:** Show alerts during attendance marking

- When marking student who missed 2-3 recent lessons, show alert
- Alert shows: Absence count + suggested action
- Example: "⚠️ Faltou às últimas 3 aulas - Considera falar com ele/ela"
- Prompts teacher to check in with student
- Configurable threshold (2-3 lessons, adjustable)

### 3. Quick Visitor Addition

**Status:** **Partially Implemented** - Visitors can be added via Student Management, but not during marking

**Remaining Work:** Add visitor during attendance marking flow

- "+ Adicionar Visitante" button in marking interface
- Simple name input field within marking page
- Marks visitor as Present immediately
- Currently must go to Student Management to add visitors first
- Would streamline workflow for unexpected visitors during class

---

## Medium Priority (Next 3-6 Months)

### 4. Carers List Widget

**Design:** Show on home page (below "Começar" button)

- "Meus Pré-adolescentes" section on home page
- Shows 3-5 students assigned to logged-in teacher
- Quick reminders: "Lembra-te de falar com..."
- Click student to see attendance history
- Admin interface to assign carers to students
- Currently managed in separate Excel file (needs integration)

### 5. Lesson History & Resources

**Design:** New section accessible from navigation menu

- List view of all past lessons (date, name, link)
- Each lesson has:
  - **Resources shared:** Links, files, notes
  - **Comments:** What worked, what didn't, observations
  - **Curriculum rating:** Vote/rate to evaluate if change needed
- **Permissions:** All teachers can edit any lesson (collaborative)
- Rich text editor for lesson notes
- File attachments support

### 6. Reports & Analytics Section

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

### 7. Role-Based Permissions (Future Enhancement)

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

### 8. Enhanced Database Features

**Status:** **Database migration complete** - Now using Supabase PostgreSQL

**Remaining Work:** Take advantage of relational database capabilities

- Implement complex queries and reports
- Add foreign key relationships where missing
- Optimize query performance with indexes
- Add database-level validation and constraints
- Implement audit trails for data changes

### 9. Additional Ministry Features (Exploration Phase)

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
- **Last Updated:** 2025-11-03
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

# Core Problem Being Solved

## Previous Workflow (Google Sheets)

- Manual entry into spreadsheets during or after class
- Time-consuming during lesson time (takes away from teaching)
- Difficult to quickly identify attendance trends
- Hard to spot students who have stopped coming
- Cumbersome to manage on mobile devices
- Multiple disconnected sheets for different types of data

## Current Solution (This App)

- Fast, mobile-first attendance marking (designed for phones)
- Two marking methods: **Search-based (default)** and Swipe-based
- Instant visual feedback with haptic vibrations
- Automatic tracking of lesson dates and curriculum links
- Quick access on teachers' personal phones during class
- Supabase PostgreSQL database for reliable data storage
- Student management with CRUD operations
- Attendance history with editing capabilities
- Multiple service times support (09:00 and 11:00)
- Future: Identify students missing multiple lessons with automatic alerts

## Design Philosophy

### Dual Marking Methods Philosophy

**Why Two Methods?**

1. **Search Method (Default):**
   - **Use Case:** Students seated in random/seating chart order
   - **Teacher marks as they see them in the room**
   - Faster for non-alphabetical scenarios
   - Less structured, more flexible

2. **Swipe Method:**
   - **Use Case:** Traditional roll-call style
   - Alphabetical order, one-by-one
   - Ensures no one is missed
   - More familiar to teachers used to paper roll call

**Both methods:**
- Auto-mark remaining students as Absent on completion
- Same save logic and validation
- Same navigation blocking
- Same completion screen

### Search Method as Default

- Based on teacher feedback, Search method is more commonly used
- Method dialog defaults to Search option pre-selected
- Swipe method still easily accessible for teachers who prefer it

## User Experience Philosophy

This app is a **ministry tool** built by a volunteer coordinator to help his church team. The users are volunteer teachers, not professional software users. Prioritize:

1. **Simplicity:** Simple and intuitive over powerful and complex
2. **Speed:** Fast interactions (attendance marking takes seconds, not minutes)
3. **Reliability:** Must work during Sunday classes (no crashes, clear error messages)
4. **Mobile-first:** Designed for phones, not desktops
5. **Portuguese:** All UI in Portuguese (PT)

**Most Important:** This tool should save time and reduce friction, not add complexity to the ministry team's workflow.

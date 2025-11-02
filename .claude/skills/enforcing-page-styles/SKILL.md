---
name: enforcing-page-styles
description: Use this skill when creating new pages or refactoring existing pages in the Prés App to ensure they follow the app's style guidelines. Automatically fixes violations including header structure (back button with "Voltar"), typography (white text on gradient blue background), spacing (compact layout), and component positioning (search/filters at top of body).
---

# Prés App Page Style Guidelines

This skill enforces the Prés App's consistent page design pattern based on the canonical "Histórico de Presenças" page. Use this when creating new pages or refactoring existing UI components.

## When to Use This Skill

Invoke this skill when:
- Creating a new page component in `/src/features/`
- Refactoring existing page layouts
- User asks to "follow the app's style" or "match the design guidelines"
- User mentions style consistency or design patterns
- Reviewing UI before commits

## Core Style Principles

### 1. Page Header Structure

Every page MUST have this header pattern:

```tsx
<div className="min-h-screen bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-white">
  {/* Header Section */}
  <header className="sticky top-0 z-10 bg-gradient-to-r from-cyan-600 to-teal-600 shadow-lg">
    <div className="flex items-center justify-between p-5">
      {/* Left: Back Button with "Voltar" text */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="w-6 h-6" />
        <span className="text-lg font-medium">Voltar</span>
      </button>

      {/* Right: Optional Action Button (if needed) */}
      {rightButton && (
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          {rightButton}
        </button>
      )}
    </div>

    {/* Title Section - NO ICON on left */}
    <div className="px-5 pb-6">
      <h1 className="text-3xl font-bold text-white mb-2">
        {pageTitle}
      </h1>
      <p className="text-base font-medium text-white/90">
        {pageSubtitle}
      </p>
    </div>
  </header>

  {/* Body Section */}
  <main className="p-5">
    {/* Search/Filter UI at top (if applicable) */}
    {/* Main content */}
  </main>
</div>
```

**Key Requirements:**
- ✅ Back button with "Voltar" text (not just icon)
- ✅ Title is `text-3xl font-bold` with NO icon on the left
- ✅ Subtitle is `text-base font-medium text-white/90`
- ✅ Optional action button on the right (refresh, settings, etc.)
- ✅ Header is sticky with `sticky top-0 z-10`
- ❌ NO icon beside the page title

### 2. Background & Colors

**Background Gradient:**
```tsx
className="min-h-screen bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500"
```

**Text Colors:**
- Primary text: `text-white`
- Secondary/descriptive text: `text-white/90`
- Muted text: `text-white/80`

**Header Background:**
```tsx
className="bg-gradient-to-r from-cyan-600 to-teal-600"
```

**Cards/Panels:**
```tsx
className="bg-white rounded-2xl shadow-2xl p-5"
```

### 3. Typography Scale

Follow these exact text sizes from the design system:

- **Page Title (h1):** `text-3xl font-bold`
- **Page Subtitle:** `text-base font-medium`
- **Section Headings (h2):** `text-2xl font-bold`
- **Card Titles (h3):** `text-base font-bold`
- **Body Text:** `text-sm`
- **Labels/Secondary:** `text-xs`

### 4. Spacing & Layout Density

**Compact Information Display:**
- Card padding: `p-5` (consistent across all cards)
- Section margins: `mb-6` between major sections
- Element gaps: `gap-3` between related items
- Header padding: `p-5` for top bar, `px-5 pb-6` for title area

**Search/Filter Positioning:**
- Always at the TOP of the body section
- Minimal vertical space (`py-3` or `py-4`)
- Should not dominate the page visually

Example:
```tsx
<main className="p-5">
  {/* Search/filter at top */}
  <div className="mb-5">
    <input
      type="text"
      placeholder="Procurar..."
      className="w-full px-4 py-3 rounded-xl text-sm bg-white/10 text-white placeholder-white/60"
    />
  </div>

  {/* Main content below */}
  <div className="space-y-4">
    {/* Cards or content */}
  </div>
</main>
```

### 5. Tabs/Service Time Toggles

When showing multiple service times (11:00 / 09:00):

```tsx
<div className="flex gap-3 mb-5">
  <button
    className={`flex-1 py-3 px-5 rounded-xl text-sm font-medium transition-all ${
      selected
        ? 'bg-white text-cyan-600 shadow-lg'
        : 'bg-white/10 text-white hover:bg-white/20'
    }`}
  >
    11:00
  </button>
  <button
    className={`flex-1 py-3 px-5 rounded-xl text-sm font-medium transition-all ${
      selected
        ? 'bg-white text-cyan-600 shadow-lg'
        : 'bg-white/10 text-white hover:bg-white/20'
    }`}
  >
    09:00
  </button>
</div>
```

### 6. Content Cards (Attendance Records)

```tsx
<div className="bg-white rounded-2xl shadow-xl p-5 space-y-3">
  {/* Calendar icon + date */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Calendar className="w-5 h-5 text-cyan-600" />
      <h3 className="text-base font-bold text-gray-900">
        {date}
      </h3>
    </div>
    <ChevronDown className="w-5 h-5 text-gray-400" />
  </div>

  {/* Lesson name */}
  <p className="text-sm text-gray-700">
    {lessonName}
  </p>

  {/* Present/Absent counts */}
  <div className="flex items-center gap-4 text-sm">
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      {presentCount}
    </span>
    <span className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-red-500"></span>
      {absentCount}
    </span>
  </div>
</div>
```

## Automatic Fixing Process

When this skill is invoked:

1. **Read the target page file** (user will specify or you'll infer from context)

2. **Analyze violations** against these guidelines:
   - Header structure (back button, title placement, optional right button)
   - Background gradient and text colors
   - Typography scale (h1, subtitle, body text sizes)
   - Spacing and padding consistency
   - Search/filter bar positioning
   - Card styling and shadows

3. **Auto-fix violations** by editing the file:
   - Use the Edit tool to replace incorrect patterns
   - Maintain existing functionality (don't break logic)
   - Preserve Portuguese text and user-facing strings
   - Keep component structure intact

4. **Report changes made**:
   - List specific violations fixed
   - Show before/after snippets for major changes
   - Confirm the page now follows guidelines

## Example Fixes

### ❌ Incorrect Header (Icon beside title)

```tsx
<div className="flex items-center gap-3 mb-4">
  <Calendar className="w-8 h-8" />
  <h1 className="text-2xl font-semibold">Histórico</h1>
</div>
```

### ✅ Correct Header (No icon, proper sizing)

```tsx
<div className="px-5 pb-6">
  <h1 className="text-3xl font-bold text-white mb-2">
    Histórico de Presenças
  </h1>
  <p className="text-base font-medium text-white/90">
    Ver e editar registos anteriores
  </p>
</div>
```

### ❌ Incorrect Background

```tsx
<div className="min-h-screen bg-blue-500 text-gray-800">
```

### ✅ Correct Background

```tsx
<div className="min-h-screen bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-white">
```

### ❌ Incorrect Card Padding

```tsx
<div className="bg-white rounded-lg shadow p-4">
```

### ✅ Correct Card Padding

```tsx
<div className="bg-white rounded-2xl shadow-2xl p-5">
```

## Files to Check

When invoked without specific file, check these common page locations:

```bash
src/features/*/[Feature]Page.tsx
src/features/home/HomePage.tsx
src/features/date-selection/DateSelectionPage.tsx
src/features/attendance-marking/AttendanceMarkingPage.tsx
src/features/search-marking/SearchAttendanceMarkingPage.tsx
```

## Validation Checklist

After fixing, verify:

- [ ] Header has back button with "Voltar" text
- [ ] Page title is `text-3xl font-bold` with NO icon beside it
- [ ] Subtitle is `text-base font-medium text-white/90`
- [ ] Background uses full gradient: `from-cyan-500 via-teal-500 to-emerald-500`
- [ ] All text is white (`text-white` or variations)
- [ ] Cards use `rounded-2xl shadow-2xl p-5`
- [ ] Search/filter UI is at top of body section
- [ ] Spacing is compact (p-5 for cards, mb-6 between sections)
- [ ] Optional right button in header (if applicable)

## Portuguese UI Text

Maintain these Portuguese strings:
- "Voltar" (Go back)
- "Procurar..." (Search)
- "Ver e editar registos anteriores" (View and edit previous records)
- Keep all existing lesson names, student names, and dates in Portuguese

## Edge Cases

**Pages with special layouts:**
- Completion screens: Allow centered content, but keep header consistent
- Form pages: Keep header structure, forms in white cards
- Loading states: Maintain gradient background during loading

**Don't break:**
- Existing event handlers (onClick, onSubmit, etc.)
- State management logic
- Navigation flows
- Data fetching hooks

## Success Criteria

Page is compliant when:
1. Visual appearance matches the reference screenshot structure
2. All typography follows the defined scale
3. Colors match the gradient and white text standard
4. Spacing is compact and consistent
5. Header structure follows the exact pattern
6. No TypeScript/build errors after edits

Run `npm run build` after fixing to verify no errors introduced.

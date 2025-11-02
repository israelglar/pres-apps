---
name: implementing-form-dialogs
description: Use this skill when creating or editing forms in the Prés App to ensure they follow the app's modal dialog pattern with blurred background, proper styling, and exit confirmation logic. Handles form structure, save/cancel buttons, close button, and unsaved changes protection.
---

# Prés App Form Dialog Guidelines

This skill enforces the Prés App's modal form pattern based on the canonical "Editar Presença" dialog. Use this when creating forms, edit dialogs, or any popup interfaces that collect user input.

## When to Use This Skill

Invoke this skill when:
- Creating new forms or edit dialogs
- Adding input fields to existing modals
- Implementing save/cancel/close functionality
- User asks to "add a form" or "create an edit dialog"
- Building features that modify data (edit attendance, add students, etc.)
- Reviewing form UX before commits

## Core Form Dialog Pattern

### 1. Modal Structure with Blurred Background

Every form dialog MUST use this structure:

```tsx
import { X } from 'lucide-react';
import { useState } from 'react';

function EditDialog({ isOpen, onClose, initialData }) {
  const [formData, setFormData] = useState(initialData);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    // Save logic here
    setHasUnsavedChanges(false);
    onClose();
  };

  return (
    <>
      {/* Blurred Backdrop */}
      <div className="fixed inset-0 bg-gradient-to-br from-cyan-900/80 via-teal-900/80 to-emerald-900/80 backdrop-blur-md z-40" />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {dialogTitle}
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Form content here */}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <ConfirmExitDialog
          onConfirm={() => {
            setShowExitConfirm(false);
            onClose();
          }}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}
    </>
  );
}
```

### 2. Key Style Requirements

**Modal Container:**
```tsx
className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
```

**Blurred Backdrop:**
```tsx
className="fixed inset-0 bg-gradient-to-br from-cyan-900/80 via-teal-900/80 to-emerald-900/80 backdrop-blur-md z-40"
```
- Must use `backdrop-blur-md` for the blur effect
- Gradient overlay matches app theme
- `z-40` for backdrop, `z-50` for modal content

**Header Section:**
```tsx
className="bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-5 flex items-center justify-between"
```
- Title: `text-2xl font-bold text-white`
- Close button (X): `text-white hover:bg-white/20 rounded-full p-2`
- X icon: `w-6 h-6`

**Body Section:**
```tsx
className="p-6 space-y-6 max-h-[60vh] overflow-y-auto"
```
- `p-6` padding all around
- `space-y-6` between form sections
- `max-h-[60vh]` with scroll for long forms

**Footer Section:**
```tsx
className="px-6 py-4 bg-gray-50 flex gap-3"
```
- Light gray background: `bg-gray-50`
- `gap-3` between buttons
- Buttons are `flex-1` (equal width)

### 3. Button Styling

**Cancel Button (White):**
```tsx
<button
  onClick={handleClose}
  className="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors"
>
  Cancelar
</button>
```

**Save Button (Blue Gradient):**
```tsx
<button
  onClick={handleSave}
  className="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
>
  Guardar
</button>
```

**Close Button (X):**
```tsx
<button
  onClick={handleClose}
  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
>
  <X className="w-6 h-6" />
</button>
```

### 4. Form Input Components

**Student/Record Info Card (Read-only display):**
```tsx
<div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-5 border-2 border-cyan-200">
  <div className="text-xs text-gray-600 mb-1">Aluno</div>
  <h3 className="text-lg font-bold text-gray-900 mb-3">
    {studentName}
  </h3>
  <div className="space-y-1 text-sm text-gray-700">
    <div>{date}</div>
    <div>{lessonName}</div>
    <div className="text-cyan-600 font-semibold">{serviceTime}</div>
  </div>
</div>
```

**Form Field Section:**
```tsx
<div className="space-y-3">
  <label className="block">
    <span className="text-sm font-semibold text-gray-900">
      {labelText}
      {required && <span className="text-red-500 ml-1">*</span>}
    </span>
    {/* Input component here */}
  </label>
</div>
```

**Button Group (Radio-style selection):**
```tsx
<div className="grid grid-cols-2 gap-3">
  <button
    onClick={() => handleSelect('presente')}
    className={`px-5 py-4 rounded-xl text-sm font-medium transition-all border-2 ${
      selected === 'presente'
        ? 'bg-green-50 text-green-700 border-green-500 shadow-md'
        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
    }`}
  >
    <span className="block mb-1">✓</span>
    Presente
  </button>

  <button
    onClick={() => handleSelect('falta')}
    className={`px-5 py-4 rounded-xl text-sm font-medium transition-all border-2 ${
      selected === 'falta'
        ? 'bg-red-50 text-red-700 border-red-500 shadow-md'
        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
    }`}
  >
    <span className="block mb-1">✕</span>
    Falta
  </button>
</div>
```

**Text Input Field:**
```tsx
<input
  type="text"
  value={value}
  onChange={(e) => {
    setValue(e.target.value);
    setHasUnsavedChanges(true);
  }}
  placeholder="Ex: Nome do aluno"
  className="w-full px-4 py-3 rounded-xl text-sm border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors"
/>
```

**Textarea Field:**
```tsx
<textarea
  value={value}
  onChange={(e) => {
    setValue(e.target.value);
    setHasUnsavedChanges(true);
  }}
  placeholder="Observações (ex: Chegou atrasado por causa do trânsito)"
  rows={4}
  className="w-full px-4 py-3 rounded-xl text-sm border-2 border-cyan-200 bg-cyan-50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors resize-none"
/>
<p className="text-xs text-gray-500 mt-2">
  {helperText}
</p>
```

### 5. Unsaved Changes Detection

**Track form changes:**
```tsx
const [formData, setFormData] = useState(initialData);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// On any input change
const handleInputChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  setHasUnsavedChanges(true);
};

// On save success
const handleSave = async () => {
  try {
    await saveData(formData);
    setHasUnsavedChanges(false); // Reset flag
    onClose();
  } catch (error) {
    // Handle error
  }
};
```

### 6. Exit Confirmation Dialog

**Required when user tries to close with unsaved changes:**

```tsx
function ConfirmExitDialog({ onConfirm, onCancel }) {
  return (
    <>
      {/* Darker backdrop over existing modal */}
      <div className="fixed inset-0 bg-black/50 z-60" />

      {/* Confirmation dialog */}
      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Descartar alterações?
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Tens alterações não guardadas. Tens a certeza que queres sair sem guardar?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Continuar a Editar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
```

**Confirmation dialog must appear when:**
- User clicks X button (top right)
- User clicks "Cancelar" button (bottom left)
- User clicks backdrop/outside modal (optional, but recommended)

**Close immediately (no confirmation) when:**
- User clicks "Guardar" and save succeeds
- Form has no changes (`hasUnsavedChanges === false`)

### 7. Backdrop Click Behavior (Optional Enhancement)

```tsx
<div
  className="fixed inset-0 bg-gradient-to-br from-cyan-900/80 via-teal-900/80 to-emerald-900/80 backdrop-blur-md z-40"
  onClick={handleClose} // Trigger close confirmation
/>

<div
  className="fixed inset-0 z-50 flex items-center justify-center p-4"
  onClick={handleClose} // Only on container
>
  <div
    className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
    onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
  >
    {/* Modal content */}
  </div>
</div>
```

## Complete Example: Edit Attendance Dialog

```tsx
import { X } from 'lucide-react';
import { useState } from 'react';

interface EditAttendanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  date: string;
  lessonName: string;
  serviceTime: string;
  initialStatus: 'P' | 'F';
  initialNotes?: string;
  onSave: (status: 'P' | 'F', notes: string) => Promise<void>;
}

function EditAttendanceDialog({
  isOpen,
  onClose,
  studentName,
  date,
  lessonName,
  serviceTime,
  initialStatus,
  initialNotes = '',
  onSave
}: EditAttendanceDialogProps) {
  const [status, setStatus] = useState<'P' | 'F'>(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleStatusChange = (newStatus: 'P' | 'F') => {
    setStatus(newStatus);
    if (newStatus !== initialStatus) {
      setHasUnsavedChanges(true);
    }
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    if (newNotes !== initialNotes) {
      setHasUnsavedChanges(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(status, notes);
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
      // Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-cyan-900/80 via-teal-900/80 to-emerald-900/80 backdrop-blur-md z-40"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >

          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Editar Presença
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              disabled={isSaving}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Student Info Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-5 border-2 border-cyan-200">
              <div className="text-xs text-gray-600 mb-1">Aluno</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {studentName}
              </h3>
              <div className="space-y-1 text-sm text-gray-700">
                <div>{date}</div>
                <div>{lessonName}</div>
                <div className="text-cyan-600 font-semibold">{serviceTime}</div>
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block mb-3">
                <span className="text-sm font-semibold text-gray-900">
                  Estado <span className="text-red-500">*</span>
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStatusChange('P')}
                  disabled={isSaving}
                  className={`px-5 py-4 rounded-xl text-sm font-medium transition-all border-2 ${
                    status === 'P'
                      ? 'bg-green-50 text-green-700 border-green-500 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block mb-1 text-lg">✓</span>
                  Presente
                </button>

                <button
                  onClick={() => handleStatusChange('F')}
                  disabled={isSaving}
                  className={`px-5 py-4 rounded-xl text-sm font-medium transition-all border-2 ${
                    status === 'F'
                      ? 'bg-red-50 text-red-700 border-red-500 shadow-md'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="block mb-1 text-lg">✕</span>
                  Falta
                </button>
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="block mb-2">
                <span className="text-sm font-semibold text-gray-900">
                  Notas (opcional)
                </span>
              </label>

              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="Observações (ex: Chegou atrasado por causa do trânsito)"
                rows={4}
                disabled={isSaving}
                className="w-full px-4 py-3 rounded-xl text-sm border-2 border-cyan-200 bg-cyan-50 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-colors resize-none disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-2">
                Adiciona contexto sobre a presença do aluno
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 flex gap-3">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-5 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50"
            >
              {isSaving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <ConfirmExitDialog
          onConfirm={() => {
            setShowExitConfirm(false);
            onClose();
          }}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}
    </>
  );
}

function ConfirmExitDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-60" />

      <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Descartar alterações?
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Tens alterações não guardadas. Tens a certeza que queres sair sem guardar?
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Continuar a Editar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditAttendanceDialog;
```

## Automatic Fixing Process

When this skill is invoked:

1. **Identify form/dialog components** in the codebase
2. **Analyze against guidelines:**
   - Modal structure and backdrop blur
   - Button styling (blue save, white cancel, X close)
   - Exit confirmation logic
   - Unsaved changes tracking
   - Input field styling
   - z-index layering

3. **Auto-fix violations:**
   - Update modal structure to match pattern
   - Fix button colors and positioning
   - Add exit confirmation if missing
   - Implement unsaved changes detection
   - Fix backdrop blur styling
   - Correct z-index stacking

4. **Report changes:**
   - List violations fixed
   - Show before/after for major changes
   - Verify functionality preserved

## Validation Checklist

After implementing/fixing a form dialog:

- [ ] Blurred gradient backdrop (`backdrop-blur-md`)
- [ ] Modal container: `rounded-3xl shadow-2xl`
- [ ] Header: Gradient background with title and X button
- [ ] Body: `p-6 space-y-6 max-h-[60vh] overflow-y-auto`
- [ ] Footer: `bg-gray-50` with Cancel (white) and Save (blue gradient)
- [ ] X button triggers same logic as Cancel
- [ ] Exit confirmation appears when unsaved changes exist
- [ ] Exit confirmation has "Continuar a Editar" and "Descartar" options
- [ ] `hasUnsavedChanges` flag tracks form modifications
- [ ] Save button shows loading state during save
- [ ] Buttons disabled during save operation
- [ ] z-index: backdrop=40, modal=50, confirmation=60/70

## Portuguese UI Text

Standard form strings:
- "Editar Presença" / "Adicionar [Item]" / "Nova [Entidade]" (Dialog titles)
- "Cancelar" (Cancel button)
- "Guardar" (Save button)
- "A guardar..." (Saving state)
- "Notas (opcional)" (Optional notes field)
- "Descartar alterações?" (Confirmation heading)
- "Tens alterações não guardadas. Tens a certeza que queres sair sem guardar?" (Confirmation message)
- "Continuar a Editar" (Keep editing)
- "Descartar" (Discard changes)

## Common Form Patterns

**Edit existing record:**
- Title: "Editar [Entity]"
- Pre-fill form with current values
- Track changes from initial values

**Create new record:**
- Title: "Adicionar [Entity]" or "Nova [Entity]"
- Empty form fields
- Always has unsaved changes once user types

**Multi-step forms:**
- Use same modal pattern
- Add "Anterior" / "Próximo" buttons in footer alongside Cancel/Save
- Only show Save on final step

## Edge Cases

**Form validation errors:**
- Show error messages below invalid fields
- Prevent save, but don't close modal
- Red border on invalid fields: `border-red-500`

**Save failure:**
- Show error toast/message
- Keep modal open with data intact
- Re-enable save button for retry

**Network issues:**
- Show loading state during save
- Timeout handling
- Retry option on failure

## Success Criteria

Form dialog is compliant when:
1. Visual appearance matches reference screenshot
2. Blurred backdrop effect works
3. X button and Cancel button both trigger exit confirmation
4. Exit confirmation only appears with unsaved changes
5. Save button is blue gradient, Cancel is white
6. All buttons use correct sizing and styling
7. Form inputs follow style guidelines
8. No TypeScript errors after implementation

Run `npm run build` after implementation to verify no errors.

---
name: implementing-confirmation-dialogs
description: Use this skill when implementing confirmation dialogs in the Prés App for destructive actions or data loss prevention. Ensures consistent warning dialogs with blurred background, icon, message, and two-button layout (continue vs exit/discard).
---

# Prés App Confirmation Dialog Guidelines

This skill enforces the Prés App's confirmation dialog pattern for warning users about unsaved changes or destructive actions. Based on the canonical navigation blocker confirmation.

## When to Use This Skill

Invoke this skill when:
- Implementing navigation blocking (leaving page with unsaved data)
- Creating destructive action confirmations (delete, discard, etc.)
- Adding exit confirmations to forms/workflows
- User asks to "add confirmation" or "prevent data loss"
- Building features that need user confirmation before proceeding
- Reviewing UX patterns before commits

## Core Confirmation Dialog Pattern

### 1. Dialog Structure with Blurred Background

Every confirmation dialog MUST use this structure:

```tsx
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  continueLabel: string;
  exitLabel: string;
  onContinue: () => void;
  onExit: () => void;
  variant?: 'warning' | 'danger';
}

function ConfirmationDialog({
  isOpen,
  title,
  message,
  continueLabel,
  exitLabel,
  onContinue,
  onExit,
  variant = 'warning'
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Blurred Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />

      {/* Dialog Container - Centered */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6">

          {/* Icon */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              variant === 'danger'
                ? 'bg-red-100'
                : 'bg-amber-100'
            }`}>
              <AlertTriangle className={`w-10 h-10 ${
                variant === 'danger'
                  ? 'text-red-600'
                  : 'text-amber-600'
              }`} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {title}
          </h2>

          {/* Message */}
          <p className="text-base text-gray-600 text-center leading-relaxed">
            {message}
          </p>

          {/* Button Group */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Continue Button (Gray/Cancel action) */}
            <button
              onClick={onContinue}
              className="w-full px-6 py-4 rounded-2xl text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {continueLabel}
            </button>

            {/* Exit/Danger Button (Red) */}
            <button
              onClick={onExit}
              className={`w-full px-6 py-4 rounded-2xl text-base font-semibold text-white transition-colors ${
                variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {exitLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
```

### 2. Key Style Requirements

**Dialog Container:**
```tsx
className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6"
```
- Extra rounded corners: `rounded-3xl`
- Generous padding: `p-8`
- Max width: `max-w-md` (448px)
- Vertical spacing: `space-y-6`

**Blurred Backdrop:**
```tsx
className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
```
- Darker overlay: `bg-black/60` (60% black)
- Subtle blur: `backdrop-blur-sm`
- z-index: backdrop `z-50`, dialog `z-[60]`

**Icon Circle:**
```tsx
className="w-20 h-20 rounded-full flex items-center justify-center bg-amber-100"
```
- Size: `w-20 h-20` (80x80px)
- Icon inside: `w-10 h-10` (40x40px)
- Warning variant: `bg-amber-100` with `text-amber-600` icon
- Danger variant: `bg-red-100` with `text-red-600` icon

**Title:**
```tsx
className="text-2xl font-bold text-gray-900 text-center"
```

**Message:**
```tsx
className="text-base text-gray-600 text-center leading-relaxed"
```

**Button Container:**
```tsx
className="flex flex-col gap-3 pt-2"
```
- Vertical stack: `flex-col`
- Gap between buttons: `gap-3`
- Extra top padding: `pt-2`

### 3. Button Styling

**Continue/Cancel Button (Top - Gray):**
```tsx
<button
  onClick={onContinue}
  className="w-full px-6 py-4 rounded-2xl text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
>
  Continuar a Marcar
</button>
```
- Full width: `w-full`
- Padding: `px-6 py-4`
- Rounded: `rounded-2xl`
- Light gray: `bg-gray-100`
- Dark gray text: `text-gray-700`
- Font: `text-base font-semibold`

**Exit/Danger Button (Bottom - Red):**
```tsx
<button
  onClick={onExit}
  className="w-full px-6 py-4 rounded-2xl text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
>
  Sair Sem Guardar
</button>
```
- Full width: `w-full`
- Padding: `px-6 py-4`
- Rounded: `rounded-2xl`
- Red background: `bg-red-600` (standard) or `bg-red-500` (lighter)
- White text: `text-white`
- Font: `text-base font-semibold`

### 4. Dialog Variants

**Warning Variant (Default):**
- Amber/yellow icon background: `bg-amber-100`
- Amber icon: `text-amber-600`
- Use for: Unsaved changes, navigation blocking, potential data loss

**Danger Variant:**
- Red icon background: `bg-red-100`
- Red icon: `text-red-600`
- Slightly darker red button: `bg-red-600`
- Use for: Delete actions, irreversible operations, destructive changes

### 5. Common Use Cases

#### Navigation Blocking (Unsaved Changes)

```tsx
import { useNavigationBlock } from '@/hooks/useNavigationBlock';
import { useState } from 'react';

function AttendanceMarkingPage() {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<() => void>();

  // Block navigation when unsaved changes exist
  useNavigationBlock({
    shouldBlock: hasUnsavedChanges,
    onBlock: (proceed) => {
      setPendingNavigation(() => proceed);
      setShowConfirm(true);
    }
  });

  const handleContinue = () => {
    setShowConfirm(false);
    setPendingNavigation(undefined);
  };

  const handleExit = () => {
    setHasUnsavedChanges(false);
    setShowConfirm(false);
    if (pendingNavigation) {
      pendingNavigation();
    }
  };

  return (
    <>
      {/* Page content */}

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Tem a certeza?"
        message="Tem registos de presença por guardar. Se sair agora, perderá todo o progresso."
        continueLabel="Continuar a Marcar"
        exitLabel="Sair Sem Guardar"
        onContinue={handleContinue}
        onExit={handleExit}
        variant="warning"
      />
    </>
  );
}
```

#### Delete Confirmation

```tsx
function DeleteStudentDialog() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);
    // Perform delete operation
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Eliminar Aluno
      </button>

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Eliminar aluno?"
        message="Esta ação não pode ser desfeita. O aluno e todo o histórico de presenças será removido permanentemente."
        continueLabel="Cancelar"
        exitLabel="Eliminar"
        onContinue={() => setShowConfirm(false)}
        onExit={handleDelete}
        variant="danger"
      />
    </>
  );
}
```

#### Discard Form Changes

```tsx
function EditForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState(initialData);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Form content */}
      <button onClick={handleClose}>Cancelar</button>

      <ConfirmationDialog
        isOpen={showConfirm}
        title="Descartar alterações?"
        message="Tens alterações não guardadas. Tens a certeza que queres sair sem guardar?"
        continueLabel="Continuar a Editar"
        exitLabel="Descartar"
        onContinue={() => setShowConfirm(false)}
        onExit={onClose}
        variant="warning"
      />
    </>
  );
}
```

### 6. Integration with TanStack Router

For navigation blocking with TanStack Router:

```tsx
import { useBlocker } from '@tanstack/react-router';
import { useState } from 'react';

function useNavigationBlock({ shouldBlock, onBlock }: {
  shouldBlock: boolean;
  onBlock: (proceed: () => void) => void;
}) {
  useBlocker({
    condition: shouldBlock,
    blockerFn: async () => {
      return new Promise((resolve) => {
        onBlock(() => {
          resolve(); // Allow navigation
        });
      });
    }
  });
}
```

## Complete Reusable Component

```tsx
import { AlertTriangle, AlertCircle, Trash2, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  continueLabel: string;
  exitLabel: string;
  onContinue: () => void;
  onExit: () => void;
  variant?: 'warning' | 'danger';
  icon?: 'warning' | 'alert' | 'delete' | 'exit';
}

function ConfirmationDialog({
  isOpen,
  title,
  message,
  continueLabel,
  exitLabel,
  onContinue,
  onExit,
  variant = 'warning',
  icon = 'warning'
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  // Icon selection
  const IconComponent = {
    warning: AlertTriangle,
    alert: AlertCircle,
    delete: Trash2,
    exit: X
  }[icon];

  // Color scheme based on variant
  const colors = variant === 'danger'
    ? {
        bg: 'bg-red-100',
        text: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700'
      }
    : {
        bg: 'bg-amber-100',
        text: 'text-amber-600',
        button: 'bg-red-500 hover:bg-red-600'
      };

  return (
    <>
      {/* Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onContinue} // Optional: clicking backdrop = continue/cancel
      />

      {/* Dialog Container */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${colors.bg}`}>
              <IconComponent className={`w-10 h-10 ${colors.text}`} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center">
            {title}
          </h2>

          {/* Message */}
          <p className="text-base text-gray-600 text-center leading-relaxed">
            {message}
          </p>

          {/* Button Group */}
          <div className="flex flex-col gap-3 pt-2">
            {/* Continue/Cancel Button (Gray) */}
            <button
              onClick={onContinue}
              className="w-full px-6 py-4 rounded-2xl text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors active:scale-95"
            >
              {continueLabel}
            </button>

            {/* Exit/Danger Button (Red) */}
            <button
              onClick={onExit}
              className={`w-full px-6 py-4 rounded-2xl text-base font-semibold text-white transition-all active:scale-95 ${colors.button}`}
            >
              {exitLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmationDialog;
```

## Animation Enhancement (Optional)

Add subtle scale animation for dialog appearance:

```css
/* Add to your global CSS or Tailwind config */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scale-in 0.15s ease-out;
}
```

Or use Tailwind's built-in animations:
```tsx
className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 space-y-6
           transform transition-all duration-150 ease-out
           opacity-100 scale-100"
```

## Automatic Fixing Process

When this skill is invoked:

1. **Identify confirmation dialogs** in the codebase
2. **Analyze against guidelines:**
   - Backdrop blur and darkness
   - Dialog sizing and padding
   - Icon presence and styling
   - Title and message formatting
   - Button layout (vertical stack)
   - Button styling (gray top, red bottom)
   - z-index layering

3. **Auto-fix violations:**
   - Update dialog structure to match pattern
   - Fix backdrop blur effect
   - Correct icon styling
   - Fix button colors and order
   - Update text alignment and sizing
   - Correct z-index values

4. **Report changes:**
   - List violations fixed
   - Show before/after snippets
   - Verify functionality preserved

## Validation Checklist

After implementing/fixing a confirmation dialog:

- [ ] Blurred backdrop: `backdrop-blur-sm bg-black/60`
- [ ] Dialog container: `rounded-3xl shadow-2xl max-w-md p-8`
- [ ] Icon circle: `w-20 h-20` with `w-10 h-10` icon inside
- [ ] Icon background: Amber for warning, red for danger
- [ ] Title: `text-2xl font-bold text-center`
- [ ] Message: `text-base text-gray-600 text-center`
- [ ] Buttons in vertical stack: `flex flex-col gap-3`
- [ ] Continue button (top): Gray `bg-gray-100`
- [ ] Exit button (bottom): Red `bg-red-600` or `bg-red-500`
- [ ] Both buttons: `w-full px-6 py-4 rounded-2xl`
- [ ] z-index: backdrop=50, dialog=60

## Portuguese UI Text Standards

### Navigation Blocking (Unsaved Changes)
- **Title:** "Tem a certeza?"
- **Message:** "Tem registos de presença por guardar. Se sair agora, perderá todo o progresso."
- **Continue:** "Continuar a Marcar" / "Continuar a Editar"
- **Exit:** "Sair Sem Guardar"

### Form Discard
- **Title:** "Descartar alterações?"
- **Message:** "Tens alterações não guardadas. Tens a certeza que queres sair sem guardar?"
- **Continue:** "Continuar a Editar"
- **Exit:** "Descartar"

### Delete Actions
- **Title:** "Eliminar [entidade]?"
- **Message:** "Esta ação não pode ser desfeita. O(a) [entidade] será removido(a) permanentemente."
- **Continue:** "Cancelar"
- **Exit:** "Eliminar"

### Session Timeout
- **Title:** "Sessão expirada"
- **Message:** "A tua sessão expirou. Por favor, inicia sessão novamente."
- **Continue:** "OK"
- **Exit:** N/A (single button)

### Clear/Reset Actions
- **Title:** "Limpar tudo?"
- **Message:** "Tens a certeza que queres limpar todos os dados? Esta ação não pode ser desfeita."
- **Continue:** "Cancelar"
- **Exit:** "Limpar Tudo"

## Icon Selection Guide

Choose appropriate icon for the context:

- **AlertTriangle (`warning`)**: General warnings, unsaved changes, data loss
- **AlertCircle (`alert`)**: Information alerts, important notices
- **Trash2 (`delete`)**: Delete operations, removal actions
- **X (`exit`)**: Exit/close confirmations, cancel operations

## Common Patterns

### Single Button Confirmation (Info only)

For non-destructive confirmations:

```tsx
<div className="flex flex-col gap-3 pt-2">
  <button
    onClick={onConfirm}
    className="w-full px-6 py-4 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all"
  >
    OK
  </button>
</div>
```

### Three Button Confirmation (Advanced)

Rarely used, but when needed:

```tsx
<div className="flex flex-col gap-3 pt-2">
  <button className="...gray...">Guardar e Sair</button>
  <button className="...gray...">Continuar</button>
  <button className="...red...">Sair Sem Guardar</button>
</div>
```

## Keyboard Accessibility (Enhancement)

Add keyboard shortcuts:

```tsx
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onContinue(); // ESC = cancel/continue
    } else if (e.key === 'Enter') {
      onExit(); // ENTER = confirm/exit
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onContinue, onExit]);
```

## Edge Cases

**Prevent backdrop clicks:**
- Remove `onClick={onContinue}` from backdrop if you want to force user interaction

**Loading state during confirmation:**
```tsx
const [isProcessing, setIsProcessing] = useState(false);

const handleExit = async () => {
  setIsProcessing(true);
  try {
    await performDestructiveAction();
    onExit();
  } finally {
    setIsProcessing(false);
  }
};

// In button:
disabled={isProcessing}
```

**Multiple confirmations:**
- Stack z-indexes: first dialog at 50/60, second at 70/80, etc.

## Success Criteria

Confirmation dialog is compliant when:
1. Visual appearance matches reference screenshot
2. Blurred backdrop effect works correctly
3. Icon is properly sized and colored
4. Title and message are centered with correct styling
5. Buttons are vertically stacked with correct colors
6. Gray button (continue) is above red button (exit/danger)
7. All buttons are full-width with proper padding
8. z-index layering works (dialog appears above all content)
9. No TypeScript errors after implementation

Run `npm run build` after implementation to verify no errors.

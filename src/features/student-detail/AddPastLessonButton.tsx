import { Plus } from 'lucide-react';
import { useState } from 'react';
import { theme } from '../../config/theme';
import { AddPastLessonDialog } from './AddPastLessonDialog';

interface AddPastLessonButtonProps {
  studentId: number;
  studentName: string;
  existingDates: Set<string>;
}

/**
 * Button to open dialog for adding past lesson attendance records
 * Only shows if there are past lessons available to add
 */
export function AddPastLessonButton({
  studentId,
  studentName,
  existingDates,
}: AddPastLessonButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed ${theme.borders.primary} ${theme.text.primary} hover:bg-gray-50 active:bg-gray-100 transition-colors font-semibold text-sm`}
      >
        <Plus className="w-4 h-4" />
        Adicionar Lição Passada
      </button>

      {isDialogOpen && (
        <AddPastLessonDialog
          studentId={studentId}
          studentName={studentName}
          existingDates={existingDates}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </>
  );
}

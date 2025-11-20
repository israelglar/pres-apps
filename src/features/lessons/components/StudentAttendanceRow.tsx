import { Check, X } from 'lucide-react';
import type { AttendanceRecordWithRelations } from '../../../types/database.types';
import { theme } from '../../../config/theme';
import { selectionTap } from '../../../utils/haptics';
import { QuickEditAttendanceMenu } from '../../../components/QuickEditAttendanceMenu';

interface StudentAttendanceRowProps {
  record: AttendanceRecordWithRelations;
  onQuickStatusChange: (recordId: number, newStatus: 'present' | 'absent') => void;
  onOpenNotes: (record: AttendanceRecordWithRelations) => void;
  onOpenDeleteDialog: (record: AttendanceRecordWithRelations) => void;
  onViewStudent: (studentId: number) => void;
}

/**
 * Single student row showing attendance status
 * - Tap row: Navigate to student detail page
 * - Menu icon: Change status (Present, Absent, Late, Excused) or edit notes/delete
 */
export function StudentAttendanceRow({ record, onQuickStatusChange, onOpenNotes, onOpenDeleteDialog, onViewStudent }: StudentAttendanceRowProps) {
  /**
   * Handle row click - navigate to student details
   */
  const handleRowClick = () => {
    selectionTap(); // Haptic feedback
    onViewStudent(record.student_id);
  };

  /**
   * Handle quick status change from menu
   */
  const handleMenuStatusChange = (status: 'present' | 'absent') => {
    selectionTap(); // Haptic feedback
    onQuickStatusChange(record.id, status);
  };
  // Status icon and color mapping
  const statusConfig = {
    present: {
      icon: <Check className="w-4 h-4" />,
      color: theme.status.present.text,
      bgColor: theme.status.present.bg,
      label: 'Presente',
    },
    absent: {
      icon: <X className="w-4 h-4" />,
      color: theme.status.absent.text,
      bgColor: theme.status.absent.bg,
      label: 'Falta',
    },
  };

  const config = statusConfig[record.status];

  return (
    <div
      onClick={handleRowClick}
      className={`flex items-center justify-between p-2 rounded-lg ${config.bgColor} border border-${config.color.replace('text-', '')}/20 hover:shadow-md cursor-pointer hover:brightness-95 active:brightness-90 transition-all`}
    >
      <div className="flex items-center gap-2 flex-1">
        {/* Status Icon */}
        <div className={`${config.color} flex-shrink-0`}>
          {config.icon}
        </div>

        {/* Student Name */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className={`font-medium ${theme.text.primary} text-xs`}>{record.student?.name || 'Unknown'}</p>
            {/* Visitor Indicator */}
            {record.student?.is_visitor && (
              <div
                className={`w-1.5 h-1.5 rounded-full ${theme.indicators.visitor} flex-shrink-0`}
                title="Visitante"
              />
            )}
          </div>
          {record.notes && (
            <p className={`text-xs ${theme.text.neutral} mt-0.5 line-clamp-1 opacity-70`}>
              {record.notes}
            </p>
          )}
        </div>

        {/* Status Label (mobile hidden) */}
        <div className={`hidden sm:block text-xs font-medium ${theme.text.neutral}`}>
          {config.label}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ml-2 flex items-center gap-0.5 flex-shrink-0">
        {/* Quick Edit Menu */}
        <QuickEditAttendanceMenu
          onSelectStatus={handleMenuStatusChange}
          onOpenNotesDialog={() => onOpenNotes(record)}
          onOpenDeleteDialog={() => onOpenDeleteDialog(record)}
        />
      </div>
    </div>
  );
}

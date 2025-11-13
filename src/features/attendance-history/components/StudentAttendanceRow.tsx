import { Check, X, Clock, FileText, User } from 'lucide-react';
import type { AttendanceRecordWithRelations } from '../../../types/database.types';
import { theme } from '../../../config/theme';
import { selectionTap } from '../../../utils/haptics';
import { QuickEditMenu } from './QuickEditMenu';

interface StudentAttendanceRowProps {
  record: AttendanceRecordWithRelations;
  onQuickStatusChange: (recordId: number, newStatus: 'present' | 'absent' | 'late' | 'excused') => void;
  onOpenNotes: (record: AttendanceRecordWithRelations) => void;
  onOpenDeleteDialog: (record: AttendanceRecordWithRelations) => void;
  onViewStudent: (studentId: number) => void;
}

/**
 * Single student row showing attendance status with tap-to-cycle and quick edit menu
 * - Tap row: Cycles between Present ↔ Absent
 * - Menu icon: Access Late, Excused, or full edit dialog
 * - User icon: View student detail page
 */
export function StudentAttendanceRow({ record, onQuickStatusChange, onOpenNotes, onOpenDeleteDialog, onViewStudent }: StudentAttendanceRowProps) {
  /**
   * Handle tap on row - cycles between Present and Absent
   * If status is Late or Excused, tapping changes to Present
   */
  const handleRowTap = () => {
    selectionTap(); // Haptic feedback

    let newStatus: 'present' | 'absent';

    if (record.status === 'present') {
      newStatus = 'absent';
    } else {
      // For absent, late, or excused - cycle to present
      newStatus = 'present';
    }

    onQuickStatusChange(record.id, newStatus);
  };

  /**
   * Handle quick status change from menu
   */
  const handleMenuStatusChange = (status: 'late' | 'excused') => {
    selectionTap(); // Haptic feedback
    onQuickStatusChange(record.id, status);
  };
  // Status icon and color mapping
  const statusConfig = {
    present: {
      icon: <Check className="w-5 h-5" />,
      color: theme.status.present.text,
      bgColor: theme.status.present.bg,
      label: 'Presente',
    },
    absent: {
      icon: <X className="w-5 h-5" />,
      color: theme.status.absent.text,
      bgColor: theme.status.absent.bg,
      label: 'Falta',
    },
    late: {
      icon: <Clock className="w-5 h-5" />,
      color: theme.status.late.text,
      bgColor: theme.status.late.bg,
      label: 'Atrasado',
    },
    excused: {
      icon: <FileText className="w-5 h-5" />,
      color: theme.status.excused.text,
      bgColor: theme.status.excused.bg,
      label: 'Justificada',
    },
  };

  const config = statusConfig[record.status];

  return (
    <div
      onClick={handleRowTap}
      className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor} border border-${config.color.replace('text-', '')}/20 transition-all hover:shadow-md cursor-pointer active:scale-98`}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Status Icon */}
        <div className={`${config.color} flex-shrink-0`}>
          {config.icon}
        </div>

        {/* Student Name */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={`font-medium ${theme.text.primary} text-sm`}>{record.student?.name || 'Unknown'}</p>
            {/* Visitor Indicator */}
            {record.student?.is_visitor && (
              <div
                className={`w-2 h-2 rounded-full ${theme.indicators.visitor} flex-shrink-0`}
                title="Visitante"
              />
            )}
          </div>
          {record.notes && (
            <p className={`text-xs ${theme.text.neutral} mt-0.5 line-clamp-1`}>
              {record.notes}
            </p>
          )}
        </div>

        {/* Status Label (mobile hidden) */}
        <div className={`hidden sm:block text-sm font-medium ${theme.text.neutral}`}>
          {config.label}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ml-3 flex items-center gap-1 flex-shrink-0">
        {/* View Student Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent row tap event
            selectionTap();
            onViewStudent(record.student_id);
          }}
          className={`p-2 rounded-lg ${theme.text.primary} hover:bg-gray-100 active:scale-95 transition-all`}
          aria-label="Ver detalhes do pré"
        >
          <User className="w-4 h-4" />
        </button>

        {/* Quick Edit Menu */}
        <QuickEditMenu
          onSelectStatus={handleMenuStatusChange}
          onOpenNotesDialog={() => onOpenNotes(record)}
          onOpenDeleteDialog={() => onOpenDeleteDialog(record)}
        />
      </div>
    </div>
  );
}

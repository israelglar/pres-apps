import { Check, X, Clock, FileText } from 'lucide-react';
import type { AttendanceRecordWithRelations } from '../../../types/database.types';
import { theme } from '../../../config/theme';

interface StudentAttendanceRowProps {
  record: AttendanceRecordWithRelations;
  onEdit: (record: AttendanceRecordWithRelations) => void;
}

/**
 * Single student row showing attendance status with edit button
 */
export function StudentAttendanceRow({ record, onEdit }: StudentAttendanceRowProps) {
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
      className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor} border border-${config.color.replace('text-', '')}/20 transition-all hover:shadow-md`}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Status Icon */}
        <div className={`${config.color} flex-shrink-0`}>
          {config.icon}
        </div>

        {/* Student Name */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className={`font-medium ${theme.text.neutralDarker} text-sm`}>{record.student?.name || 'Unknown'}</p>
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

      {/* Edit Button */}
      <button
        onClick={() => onEdit(record)}
        className={`ml-3 px-3 py-2 text-sm font-semibold ${theme.text.primary} ${theme.borders.primary} border rounded-lg hover:bg-cyan-50 active:scale-95 transition-all flex-shrink-0`}
      >
        Editar
      </button>
    </div>
  );
}

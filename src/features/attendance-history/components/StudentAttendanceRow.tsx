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
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Presente',
    },
    absent: {
      icon: <X className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Falta',
    },
    late: {
      icon: <Clock className="w-5 h-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      label: 'Atrasado',
    },
    excused: {
      icon: <FileText className="w-5 h-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
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
          <p className="font-medium text-gray-800">{record.student?.name || 'Unknown'}</p>
          {record.notes && (
            <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">
              {record.notes}
            </p>
          )}
        </div>

        {/* Status Label (mobile hidden) */}
        <div className="hidden sm:block text-sm font-medium text-gray-600">
          {config.label}
        </div>
      </div>

      {/* Edit Button */}
      <button
        onClick={() => onEdit(record)}
        className={`ml-3 px-3 py-1.5 text-sm font-semibold ${theme.text.primary} ${theme.borders.primary} border rounded-lg hover:bg-cyan-50 active:scale-95 transition-all flex-shrink-0`}
      >
        Editar
      </button>
    </div>
  );
}

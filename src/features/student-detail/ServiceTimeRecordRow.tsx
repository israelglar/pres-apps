import { Check, X } from 'lucide-react';
import { theme } from '../../config/theme';
import { QuickEditAttendanceMenu } from '../../components/QuickEditAttendanceMenu';
import type { AttendanceRecordWithRelations } from '../../types/database.types';

interface ServiceTimeRecordRowProps {
  record: AttendanceRecordWithRelations;
  onStatusChange: (recordId: number, newStatus: 'present' | 'absent') => void;
  onOpenNotesDialog: (record: AttendanceRecordWithRelations) => void;
}

/**
 * Individual service time record row for expanded attendance card
 * Shows service time, status, and edit menu
 */
export function ServiceTimeRecordRow({
  record,
  onStatusChange,
  onOpenNotesDialog,
}: ServiceTimeRecordRowProps) {
  // Status icon and color mapping
  const statusConfig = {
    present: {
      icon: <Check className="w-3.5 h-3.5" />,
      text: theme.status.present.text,
      bg: theme.status.present.bg,
      label: 'Presente',
    },
    absent: {
      icon: <X className="w-3.5 h-3.5" />,
      text: theme.status.absent.text,
      bg: theme.status.absent.bg,
      label: 'Falta',
    },
  };

  const config = statusConfig[record.status];
  const serviceTimeName = record.schedule?.service_time?.name || 'N/A';

  // Handle status change for this specific record
  const handleStatusChange = (newStatus: 'present' | 'absent') => {
    onStatusChange(record.id, newStatus);
  };

  // Handle notes dialog for this specific record
  const handleOpenNotesDialog = () => {
    onOpenNotesDialog(record);
  };

  return (
    <div
      className={`flex items-center justify-between py-2 px-3 rounded-lg ${config.bg} border border-${config.text.replace('text-', '')}/20`}
    >
      <div className="flex items-center gap-2 flex-1">
        {/* Service Time Badge */}
        <span className={`text-xs font-bold ${theme.text.primary} ${theme.backgrounds.primaryLighter} px-2 py-0.5 rounded-md flex-shrink-0`}>
          {serviceTimeName}
        </span>

        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.text} flex-shrink-0`}>
          <span className="leading-none">{config.icon}</span>
          {config.label}
        </span>

        {/* Notes Indicator */}
        {record.notes && (
          <span className={`text-xs ${theme.text.neutral} opacity-70 truncate`} title={record.notes}>
            "{record.notes.substring(0, 20)}{record.notes.length > 20 ? '...' : ''}"
          </span>
        )}
      </div>

      {/* Edit Menu */}
      <div className="ml-2 flex-shrink-0">
        <QuickEditAttendanceMenu
          onSelectStatus={handleStatusChange}
          onOpenNotesDialog={handleOpenNotesDialog}
          showDelete={false}
        />
      </div>
    </div>
  );
}

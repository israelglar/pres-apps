import { Calendar, ExternalLink, Users, UserX, Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { theme } from '../../../config/theme';
import { StudentAttendanceRow } from './StudentAttendanceRow';
import type { AttendanceHistoryGroup } from '../hooks/useAttendanceHistory';
import type { AttendanceRecordWithRelations } from '../../../types/database.types';
import { lightTap } from '../../../utils/haptics';

interface DateGroupCardProps {
  group: AttendanceHistoryGroup;
  onEditRecord: (record: AttendanceRecordWithRelations) => void;
}

/**
 * Date Group Card - Shows all attendance for a specific date
 * Includes lesson info, service time, student list, and summary stats
 * Starts collapsed, expands when clicked
 */
export function DateGroupCard({ group, onEditRecord }: DateGroupCardProps) {
  const { schedule, records, stats } = group;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    lightTap();
    setIsExpanded(!isExpanded);
  };

  // Format date for display
  const formattedDate = new Date(schedule.date).toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Check if it's today
  const today = new Date().toISOString().split('T')[0];
  const isToday = schedule.date === today;

  // Sort students alphabetically
  const sortedRecords = [...records].sort((a, b) => {
    const nameA = a.student?.name || '';
    const nameB = b.student?.name || '';
    return nameA.localeCompare(nameB);
  });

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-white/50">
      {/* Header - Clickable to expand/collapse */}
      <button
        onClick={toggleExpand}
        className="bg-white p-3 w-full text-left hover:bg-gray-50 transition-all active:scale-[0.99]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Calendar className={`w-4 h-4 ${theme.text.primary}`} />
              <h3 className={`text-base font-bold ${theme.text.neutralDarker}`}>
                {formattedDate}
                {isToday && (
                  <span className={`ml-1.5 text-xs font-semibold ${theme.backgrounds.primary} text-white px-1.5 py-0.5 rounded-full`}>
                    Hoje
                  </span>
                )}
              </h3>
            </div>

            {/* Lesson Name */}
            {schedule.lesson?.name && (
              <p className={`${theme.text.neutral} text-sm mt-0.5`}>{schedule.lesson.name}</p>
            )}

            {/* Summary Stats - Show when collapsed */}
            {!isExpanded && records.length > 0 && (
              <div className={`flex items-center gap-3 mt-1.5 ${theme.text.neutral} text-xs`}>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {stats.present}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  {stats.absent}
                </span>
                {stats.late > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    {stats.late}
                  </span>
                )}
                {stats.excused > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {stats.excused}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right side: Expand/Collapse Icon */}
          <div className="flex items-center">
            {/* Expand/Collapse Icon */}
            {isExpanded ? (
              <ChevronUp className={`w-5 h-5 ${theme.text.primary}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${theme.text.primary}`} />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content - Only show when expanded */}
      {isExpanded && (
        <>
          {/* Lesson Link - Show when expanded */}
          {schedule.lesson?.resource_url && (
            <div className="px-4 pt-3 pb-2">
              <a
                href={schedule.lesson.resource_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center gap-1 text-sm ${theme.text.primary} hover:underline transition-colors`}
              >
                <ExternalLink className="w-4 h-4" />
                Ver currículo
              </a>
            </div>
          )}

          {/* Student List */}
          {records.length > 0 ? (
            <div className="p-4 space-y-2">
              {sortedRecords.map((record) => (
                <StudentAttendanceRow
                  key={record.id}
                  record={record}
                  onEdit={onEditRecord}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">Nenhuma presença registada</p>
            </div>
          )}

          {/* Summary Stats - Detailed view when expanded */}
          {records.length > 0 && (
            <div className={`${theme.gradients.cardHighlight} p-4 border-t ${theme.borders.neutralLight}`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Present */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Presenças</p>
                    <p className="text-lg font-bold text-green-600">{stats.present}</p>
                  </div>
                </div>

                {/* Absent */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <UserX className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Faltas</p>
                    <p className="text-lg font-bold text-red-600">{stats.absent}</p>
                  </div>
                </div>

                {/* Late */}
                {stats.late > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Atrasados</p>
                      <p className="text-lg font-bold text-amber-600">{stats.late}</p>
                    </div>
                  </div>
                )}

                {/* Excused */}
                {stats.excused > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Justificadas</p>
                      <p className="text-lg font-bold text-blue-600">{stats.excused}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

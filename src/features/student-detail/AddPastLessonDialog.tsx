import { X, Loader2, Calendar, BookOpen, Clock, Check } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theme, buttonClasses, inputClasses } from '../../config/theme';
import { getAllSchedules } from '../../api/supabase/schedules';
import { createAttendanceRecord } from '../../api/supabase/attendance';
import { getActiveServiceTimes } from '../../api/supabase/service-times';
import { successVibration, errorVibration } from '../../utils/haptics';
import { queryKeys } from '../../lib/queryKeys';
import type { ScheduleWithRelations } from '../../types/database.types';

interface AddPastLessonDialogProps {
  studentId: number;
  studentName: string;
  existingDates: Set<string>; // Dates that already have attendance records
  onClose: () => void;
}

/**
 * Dialog for adding attendance records for past lessons
 * Allows selecting a past date/lesson and marking attendance
 */
export function AddPastLessonDialog({
  studentId,
  studentName,
  existingDates,
  onClose,
}: AddPastLessonDialogProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedServiceTimeIds, setSelectedServiceTimeIds] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<'present' | 'absent'>('present');
  const [notes, setNotes] = useState('');

  // Fetch all schedules
  const { data: allSchedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: queryKeys.schedules(),
    queryFn: getAllSchedules,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch active service times
  const { data: activeServiceTimes = [] } = useQuery({
    queryKey: ['service-times', 'active'],
    queryFn: getActiveServiceTimes,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Filter to only past schedules that don't have attendance yet
  const availableSchedules = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allSchedules.filter((schedule) => {
      const scheduleDate = new Date(schedule.date);
      scheduleDate.setHours(0, 0, 0, 0);

      // Only past dates that don't already have attendance
      return scheduleDate < today && !existingDates.has(schedule.date);
    });
  }, [allSchedules, existingDates]);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const grouped = new Map<string, ScheduleWithRelations[]>();

    for (const schedule of availableSchedules) {
      if (!grouped.has(schedule.date)) {
        grouped.set(schedule.date, []);
      }
      grouped.get(schedule.date)!.push(schedule);
    }

    // Sort dates descending (most recent first)
    return new Map(
      Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    );
  }, [availableSchedules]);

  // Get schedules for selected date
  const selectedDateSchedules = useMemo(() => {
    return selectedDate ? schedulesByDate.get(selectedDate) || [] : [];
  }, [selectedDate, schedulesByDate]);

  // Get lesson info for selected date (should be same across all services)
  const selectedLesson = selectedDateSchedules[0]?.lesson;

  // Auto-select first date when dialog opens
  useEffect(() => {
    if (schedulesByDate.size > 0 && !selectedDate) {
      const firstDate = Array.from(schedulesByDate.keys())[0];
      setSelectedDate(firstDate);
    }
  }, [schedulesByDate, selectedDate]);

  // Auto-select all available service times for the selected date
  useEffect(() => {
    if (selectedDateSchedules.length > 0) {
      const serviceTimeIds = selectedDateSchedules
        .map(s => s.service_time_id)
        .filter((id): id is number => id !== null);
      setSelectedServiceTimeIds(new Set(serviceTimeIds));
    }
  }, [selectedDateSchedules]);

  // Mutation for creating attendance records
  const addMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDate || selectedServiceTimeIds.size === 0) {
        throw new Error('Por favor selecione uma data e pelo menos um horário');
      }

      // Create attendance records for each selected service time
      const promises = Array.from(selectedServiceTimeIds).map(serviceTimeId => {
        const schedule = selectedDateSchedules.find(s => s.service_time_id === serviceTimeId);
        if (!schedule) {
          throw new Error(`Não foi encontrado horário agendado`);
        }

        return createAttendanceRecord({
          student_id: studentId,
          schedule_id: schedule.id,
          status,
          service_time_id: serviceTimeId,
          notes: notes.trim() || undefined,
        });
      });

      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.studentAttendance(studentId) });
      successVibration();
      onClose();
    },
    onError: (error) => {
      console.error('Failed to add past lesson:', error);
      errorVibration();
      alert(error instanceof Error ? error.message : 'Erro ao adicionar lição');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate();
  };

  const handleToggleServiceTime = (serviceTimeId: number) => {
    const newSet = new Set(selectedServiceTimeIds);
    if (newSet.has(serviceTimeId)) {
      newSet.delete(serviceTimeId);
    } else {
      newSet.add(serviceTimeId);
    }
    setSelectedServiceTimeIds(newSet);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Status options
  const statusOptions = [
    { value: 'present', label: 'Presente', color: theme.status.present },
    { value: 'absent', label: 'Falta', color: theme.status.absent },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className={`${theme.solids.primaryButton} p-5 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl`}>
          <h2 className={`text-2xl font-bold ${theme.text.onPrimaryButton}`}>Adicionar Lição Passada</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={addMutation.isPending}
          >
            <X className={`w-6 h-6 ${theme.text.onPrimaryButton}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Student Info */}
          <div className={`p-4 rounded-xl ${theme.solids.cardHighlight} border ${theme.borders.primary}`}>
            <p className={`text-lg font-bold ${theme.text.neutralDarker}`}>{studentName}</p>
          </div>

          {/* Loading State */}
          {isLoadingSchedules && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={`w-8 h-8 ${theme.text.primary} animate-spin`} />
            </div>
          )}

          {/* No available lessons */}
          {!isLoadingSchedules && schedulesByDate.size === 0 && (
            <div className="text-center py-8">
              <Calendar className={`w-12 h-12 ${theme.text.neutralLight} mx-auto mb-3`} />
              <p className={`text-sm ${theme.text.neutral}`}>
                Não há lições passadas disponíveis para adicionar
              </p>
            </div>
          )}

          {/* Date Selection */}
          {!isLoadingSchedules && schedulesByDate.size > 0 && (
            <>
              <div>
                <label
                  htmlFor="date"
                  className={`flex items-center gap-2 ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Data
                </label>
                <select
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full px-4 py-3 ${inputClasses} text-sm`}
                  disabled={addMutation.isPending}
                  required
                >
                  <option value="">Selecione uma data</option>
                  {Array.from(schedulesByDate.keys()).map((date) => (
                    <option key={date} value={date}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Lesson Info */}
              {selectedLesson && (
                <div className={`p-3 rounded-lg ${theme.backgrounds.neutralLight}`}>
                  <div className="flex items-center gap-2">
                    <BookOpen className={`w-4 h-4 ${theme.text.primary}`} />
                    <p className={`text-sm font-semibold ${theme.text.neutralDarker}`}>
                      {selectedLesson.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Service Time Selection */}
              {selectedDateSchedules.length > 0 && (
                <div>
                  <label className={`flex items-center gap-2 ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>
                    <Clock className="w-3.5 h-3.5" />
                    Horário(s)
                  </label>
                  <div className="space-y-2">
                    {selectedDateSchedules.map((schedule) => {
                      const serviceTime = activeServiceTimes.find(st => st.id === schedule.service_time_id);
                      if (!serviceTime) return null;

                      const isSelected = selectedServiceTimeIds.has(schedule.service_time_id!);

                      return (
                        <button
                          key={schedule.id}
                          type="button"
                          onClick={() => handleToggleServiceTime(schedule.service_time_id!)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? `${theme.borders.primary} ${theme.backgrounds.primaryLighter}`
                              : `${theme.borders.neutralLight} ${theme.backgrounds.white} hover:bg-gray-50`
                          }`}
                          disabled={addMutation.isPending}
                        >
                          <span className={`text-sm font-medium ${isSelected ? theme.text.primary : theme.text.neutralDarker}`}>
                            {serviceTime.name} ({serviceTime.time.substring(0, 5)})
                          </span>
                          {isSelected && (
                            <Check className={`w-4 h-4 ${theme.text.primary}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status Selection */}
              <div>
                <label className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>
                  Estado
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => {
                    const isSelected = status === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setStatus(option.value)}
                        className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                          isSelected
                            ? `${option.color.text} ${option.color.bg} border-current`
                            : `${theme.text.neutralDarker} ${theme.backgrounds.white} ${theme.borders.neutralLight} hover:bg-gray-50`
                        }`}
                        disabled={addMutation.isPending}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
                >
                  Notas (opcional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-4 py-3 ${inputClasses} resize-none text-sm`}
                  rows={3}
                  placeholder="Observações..."
                  disabled={addMutation.isPending}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
                  disabled={addMutation.isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center gap-2`}
                  disabled={addMutation.isPending || selectedServiceTimeIds.size === 0}
                >
                  {addMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      A adicionar...
                    </>
                  ) : (
                    'Adicionar'
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

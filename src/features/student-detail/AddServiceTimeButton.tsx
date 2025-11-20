import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { theme } from '../../config/theme';
import { createAttendanceRecord } from '../../api/supabase/attendance';
import { getScheduleByDate } from '../../api/supabase/schedules';
import { successVibration, errorVibration } from '../../utils/haptics';
import { queryKeys } from '../../lib/queryKeys';

interface ServiceTimeInfo {
  id: number;
  name: string;
  time: string;
}

interface AddServiceTimeButtonProps {
  date: string;
  studentId: number;
  missingServiceTimes: ServiceTimeInfo[];
}

/**
 * Button to add attendance record for missing service times
 * Shows a button for each missing service time on a Sunday
 */
export function AddServiceTimeButton({
  date,
  studentId,
  missingServiceTimes,
}: AddServiceTimeButtonProps) {
  const queryClient = useQueryClient();
  const [addingServiceTimeId, setAddingServiceTimeId] = useState<number | null>(null);

  // Mutation for creating attendance record
  const addMutation = useMutation({
    mutationFn: async ({
      serviceTimeId,
    }: {
      serviceTimeId: number;
    }) => {
      // Get all schedules for this date
      const schedules = await getScheduleByDate(date);

      // Find the schedule for this specific service time
      const schedule = schedules.find(s => s.service_time_id === serviceTimeId);

      if (!schedule) {
        throw new Error('Não há aula agendada para este horário');
      }

      // Create the attendance record
      return createAttendanceRecord({
        student_id: studentId,
        schedule_id: schedule.id,
        status: 'present', // Default to present
        service_time_id: serviceTimeId,
      });
    },
    onSuccess: () => {
      // Invalidate student attendance query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.studentAttendance(studentId) });
      successVibration();
      setAddingServiceTimeId(null);
    },
    onError: (error) => {
      console.error('Failed to add service time record:', error);
      errorVibration();
      alert(error instanceof Error ? error.message : 'Erro ao adicionar horário');
      setAddingServiceTimeId(null);
    },
  });

  const handleAddServiceTime = (serviceTimeId: number) => {
    setAddingServiceTimeId(serviceTimeId);
    addMutation.mutate({ serviceTimeId });
  };

  if (missingServiceTimes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {missingServiceTimes.map((serviceTime) => {
        const isAdding = addingServiceTimeId === serviceTime.id;

        return (
          <button
            key={serviceTime.id}
            onClick={() => handleAddServiceTime(serviceTime.id)}
            disabled={isAdding || addMutation.isPending}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border-2 border-dashed ${theme.borders.primary} ${theme.text.primary} hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">A adicionar...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Adicionar {serviceTime.name} (Presente)
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

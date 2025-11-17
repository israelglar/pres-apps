import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LessonsPage } from '../../features/lessons';
import { z } from 'zod';

// Define search params schema
const lessonsSearchSchema = z.object({
  date: z.string().optional(),
  serviceTimeId: z.number().optional(),
});

export const Route = createFileRoute('/_authenticated/lessons')({
  component: LessonsRoute,
  validateSearch: (search) => lessonsSearchSchema.parse(search),
});

function LessonsRoute() {
  const navigate = useNavigate();
  const { date, serviceTimeId } = Route.useSearch();

  const handleBack = () => {
    window.history.back();
  };

  const handleViewStudent = (studentId: number) => {
    navigate({ to: '/students/$studentId', params: { studentId: studentId.toString() } });
  };

  const handleRedoAttendance = (scheduleDate: string, serviceTimeId: number) => {
    navigate({
      to: '/search-marking',
      search: {
        date: new Date(scheduleDate).toISOString(),
        serviceTimeId,
      },
    });
  };

  const handleDateClick = (dateStr: string) => {
    navigate({ to: '/lesson/$date', params: { date: dateStr } });
  };

  return (
    <LessonsPage
      onBack={handleBack}
      onViewStudent={handleViewStudent}
      onRedoAttendance={handleRedoAttendance}
      onDateClick={handleDateClick}
      initialDate={date}
      initialServiceTimeId={serviceTimeId}
    />
  );
}

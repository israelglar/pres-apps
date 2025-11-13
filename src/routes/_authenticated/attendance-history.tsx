import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AttendanceHistoryPage } from '../../features/attendance-history';
import { z } from 'zod';

// Define search params schema
const attendanceHistorySearchSchema = z.object({
  date: z.string().optional(),
  serviceTimeId: z.number().optional(),
});

export const Route = createFileRoute('/_authenticated/attendance-history')({
  component: AttendanceHistoryRoute,
  validateSearch: (search) => attendanceHistorySearchSchema.parse(search),
});

function AttendanceHistoryRoute() {
  const navigate = useNavigate();
  const { date, serviceTimeId } = Route.useSearch();

  const handleBack = () => {
    window.history.back();
  };

  const handleViewStudent = (studentId: number) => {
    navigate({ to: '/students/$studentId', params: { studentId: studentId.toString() } });
  };

  return (
    <AttendanceHistoryPage
      onBack={handleBack}
      onViewStudent={handleViewStudent}
      initialDate={date}
      initialServiceTimeId={serviceTimeId}
    />
  );
}

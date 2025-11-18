import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LessonsPage } from '../../features/lessons';

export const Route = createFileRoute('/_authenticated/lessons')({
  component: LessonsRoute,
});

function LessonsRoute() {
  const navigate = useNavigate();

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
    />
  );
}

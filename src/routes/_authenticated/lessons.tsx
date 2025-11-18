import { createFileRoute, Outlet, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { LessonsPage } from '../../features/lessons';

export const Route = createFileRoute('/_authenticated/lessons')({
  component: LessonsRoute,
});

function LessonsRoute() {
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  // Check if we're viewing a specific lesson detail (child route)
  const isViewingLesson = matchRoute({ to: '/lessons/$lessonId' });

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
    // Navigate to lesson detail
    navigate({
      to: '/lesson/$date',
      params: { date: dateStr }
    });
  };

  // If viewing a specific lesson, render the child route
  if (isViewingLesson) {
    return <Outlet />;
  }

  // Otherwise, render the lessons list page
  return (
    <LessonsPage
      onBack={handleBack}
      onViewStudent={handleViewStudent}
      onRedoAttendance={handleRedoAttendance}
      onDateClick={handleDateClick}
    />
  );
}

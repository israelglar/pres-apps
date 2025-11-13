import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AttendanceHistoryPage } from '../../features/attendance-history';

export const Route = createFileRoute('/_authenticated/attendance-history')({
  component: AttendanceHistoryRoute,
});

function AttendanceHistoryRoute() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleViewStudent = (studentId: number) => {
    navigate({ to: '/students/$studentId', params: { studentId: studentId.toString() } });
  };

  return <AttendanceHistoryPage onBack={handleBack} onViewStudent={handleViewStudent} />;
}

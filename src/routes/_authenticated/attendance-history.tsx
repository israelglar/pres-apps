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

  return <AttendanceHistoryPage onBack={handleBack} />;
}

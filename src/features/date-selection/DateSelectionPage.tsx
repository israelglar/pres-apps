import { theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import type { Schedule } from "../../schemas/attendance.schema";
import { useDateSelectionLogic } from "./DateSelectionPage.logic";
import type { AttendanceStats } from "../../utils/attendance";
import { useEffect } from "react";
import {
  DatePicker,
  LessonInfoCard,
  ServiceTimeSelector,
  AttendanceSummaryCard,
  MethodSelectionCard,
  ActionButton,
} from "./components";

interface DateSelectionPageProps {
  onDateSelected: (
    date: Date,
    method: "search" | "swipe",
    serviceTimeId: number
  ) => void;
  onBack: () => void;
  onViewHistory?: () => void;
  serviceTimes: Array<{ id: number; name: string; time: string }>;
  getSchedule: (
    date: string,
    serviceTimeId: number | null
  ) => Schedule | undefined;
  getAvailableDates: (serviceTimeId?: number | null) => Date[];
  attendanceStats?: AttendanceStats;
  onDateChange?: (date: Date) => void;
  onServiceTimeChange?: (serviceTimeId: number) => void;
}

/**
 * Date Selection Page - Choose a date and method for attendance marking
 *
 * Features:
 * - Dropdown date picker filtered by service time
 * - Filter future lessons
 * - Method selection dialog (search vs swipe)
 * - Lesson name and link display per service time
 */
export function DateSelectionPage({
  onDateSelected,
  onBack,
  onViewHistory,
  serviceTimes,
  getSchedule,
  getAvailableDates,
  attendanceStats,
  onDateChange,
  onServiceTimeChange,
}: DateSelectionPageProps) {
  const logic = useDateSelectionLogic({ getAvailableDates });

  // Get the schedule for the selected date and service time
  const selectedSchedule = getSchedule(
    logic.selectedDate.toISOString().split("T")[0],
    logic.selectedServiceTimeId
  );

  // Notify parent when date or service time changes
  useEffect(() => {
    if (onDateChange) {
      onDateChange(logic.selectedDate);
    }
  }, [logic.selectedDate, onDateChange]);

  useEffect(() => {
    if (onServiceTimeChange) {
      onServiceTimeChange(logic.selectedServiceTimeId);
    }
  }, [logic.selectedServiceTimeId, onServiceTimeChange]);

  // Get lesson info for a specific date and current service time (for dropdown)
  const getLessonForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const schedule = getSchedule(dateStr, logic.selectedServiceTimeId);
    return schedule?.lesson?.name || "Sem lição agendada";
  };

  // Check if a date is in the past (for attendance status badge)
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() < today.getTime();
  };

  // Get attendance status for all service times for a date
  const getAllAttendanceStatuses = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];

    // Get status for each service time
    const statuses = serviceTimes.map((serviceTime) => {
      const schedule = getSchedule(dateStr, serviceTime.id);
      const hasAttendance = schedule?.has_attendance || false;
      const attendanceCount = schedule?.attendance_count || 0;

      return {
        serviceTimeId: serviceTime.id,
        serviceTimeName: serviceTime.name,
        hasAttendance,
        attendanceCount,
        hasSchedule: !!schedule,
      };
    });

    return statuses.filter((s) => s.hasSchedule); // Only return service times that have schedules
  };

  return (
    <div className={`h-screen flex flex-col ${theme.backgrounds.page} overflow-hidden`}>
      {/* Header Section */}
      <PageHeader
        onBack={onBack}
        variant="minimal"
        sticky={true}
        className="flex-shrink-0"
      />

      {/* Main Content Area */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Fixed Date Picker Section */}
        <DatePicker
          selectedDate={logic.selectedDate}
          filteredSundays={logic.filteredSundays}
          isOpen={logic.isOpen}
          dropdownRef={logic.dropdownRef}
          dropdownListRef={logic.dropdownListRef}
          selectedItemRef={logic.selectedItemRef}
          getDateLabel={logic.getDateLabel}
          getLessonForDate={getLessonForDate}
          isPastDate={isPastDate}
          getAllAttendanceStatuses={getAllAttendanceStatuses}
          onToggleOpen={() => logic.setIsOpen(!logic.isOpen)}
          onSelectDate={(date) => {
            logic.setSelectedDate(date);
            logic.setIsOpen(false);
          }}
        />

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
          {/* Lesson Info Card */}
          <LessonInfoCard selectedSchedule={selectedSchedule} />

          {/* Service Time Card */}
          <ServiceTimeSelector
            serviceTimes={serviceTimes}
            selectedServiceTimeId={logic.selectedServiceTimeId}
            getServiceTimeAttendanceStatus={(serviceTimeId) => {
              const dateStr = logic.selectedDate.toISOString().split("T")[0];
              const schedule = getSchedule(dateStr, serviceTimeId);
              return schedule?.has_attendance || false;
            }}
            onSelectServiceTime={(serviceTimeId) =>
              logic.setSelectedServiceTimeId(serviceTimeId)
            }
          />

          {/* Conditional: Method Selection OR Attendance Summary */}
          {selectedSchedule?.has_attendance && attendanceStats ? (
            /* Attendance Summary Card - When attendance is already marked */
            <AttendanceSummaryCard attendanceStats={attendanceStats} />
          ) : (
            /* Method Selection Card - When attendance NOT marked */
            <MethodSelectionCard
              selectedMethod={logic.selectedMethod}
              showMethodInfo={logic.showMethodInfo}
              onSelectMethod={(method) => logic.setSelectedMethod(method)}
              onToggleMethodInfo={(method) =>
                logic.setShowMethodInfo(
                  logic.showMethodInfo === method ? null : method
                )
              }
              onCloseMethodInfo={() => logic.setShowMethodInfo(null)}
            />
          )}
        </div>

        {/* Fixed button at bottom */}
        <ActionButton
          hasAttendance={!!selectedSchedule?.has_attendance && !!attendanceStats}
          onContinue={() =>
            onDateSelected(
              logic.selectedDate,
              logic.selectedMethod,
              logic.selectedServiceTimeId
            )
          }
          onViewHistory={onViewHistory}
        />
      </div>
    </div>
  );
}

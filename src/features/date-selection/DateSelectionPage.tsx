import {
  AlertCircle,
  AlertTriangle,
  ArrowDownAZ,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Eye,
  Info,
  Search,
  UserCheck,
} from "lucide-react";
import { buttonClasses, theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import type { Schedule } from "../../schemas/attendance.schema";
import { formatDate } from "../../utils/helperFunctions";
import { useDateSelectionLogic } from "./DateSelectionPage.logic";

interface DateSelectionPageProps {
  onDateSelected: (
    date: Date,
    method: "search" | "swipe",
    serviceTimeId: number
  ) => void;
  onBack: () => void;
  serviceTimes: Array<{ id: number; name: string; time: string }>;
  getSchedule: (
    date: string,
    serviceTimeId: number | null
  ) => Schedule | undefined;
  getAvailableDates: (serviceTimeId?: number | null) => Date[];
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
  serviceTimes,
  getSchedule,
  getAvailableDates,
}: DateSelectionPageProps) {
  const logic = useDateSelectionLogic({ getAvailableDates });

  // Get the schedule for the selected date and service time
  const selectedSchedule = getSchedule(
    logic.selectedDate.toISOString().split("T")[0],
    logic.selectedServiceTimeId
  );

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
      return {
        serviceTimeId: serviceTime.id,
        serviceTimeName: serviceTime.name,
        hasAttendance: schedule?.has_attendance || false,
        attendanceCount: schedule?.attendance_count || 0,
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
        <div className="flex-shrink-0 p-5 pb-3">
          <div className={`${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primaryLight} shadow-md p-4`}>
            <label className={`block ${theme.text.primary} font-bold mb-3 text-xs uppercase tracking-wide`}>
              Data da Lição
            </label>

            {/* Custom Select Dropdown */}
            <div className="relative" ref={logic.dropdownRef}>
              <button
                type="button"
                onClick={() => logic.setIsOpen(!logic.isOpen)}
                className={`w-full px-4 py-3 text-sm border-2 ${theme.borders.primary} rounded-xl focus:ring-4 ${theme.rings.primary} ${theme.borders.primaryFocus} cursor-pointer ${theme.backgrounds.white} ${theme.borders.primaryHover} hover:shadow-lg transition-all shadow-sm flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`${theme.backgrounds.primaryLight} p-1.5 rounded-lg`}
                  >
                    <Calendar className={`w-4 h-4 ${theme.text.primary}`} />
                  </div>
                  <span
                    className={`font-bold ${theme.text.neutralDarker} text-sm`}
                  >
                    {formatDate(logic.selectedDate)}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 ${theme.text.primary} transition-transform ${logic.isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {logic.isOpen && (
                <div
                  ref={logic.dropdownListRef}
                  className={`absolute z-10 w-full mt-2 bg-white border-2 ${theme.borders.primary} rounded-xl shadow-2xl max-h-80 overflow-y-auto`}
                >
                  {logic.filteredSundays.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className={`w-16 h-16 ${theme.text.neutralLight} mx-auto mb-4`} />
                      <p className={`${theme.text.neutral} font-medium`}>Nenhuma data disponível</p>
                    </div>
                  ) : (
                    <>
                      {logic.filteredSundays.map((sunday) => {
                        const isSelected =
                          sunday.toDateString() ===
                          logic.selectedDate.toDateString();
                        const dateLabel = logic.getDateLabel(sunday);
                        const isPast = isPastDate(sunday);
                        const allAttendanceStatuses =
                          getAllAttendanceStatuses(sunday);

                        return (
                          <button
                            key={sunday.toISOString()}
                            ref={isSelected ? logic.selectedItemRef : null}
                            type="button"
                            onClick={() => {
                              logic.setSelectedDate(sunday);
                              logic.setIsOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left ${theme.backgrounds.primaryHover} transition-all flex items-center justify-between border-b ${theme.borders.neutralLight} last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                              isSelected ? theme.solids.selectedItem : ""
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`font-bold text-sm ${isSelected ? theme.text.primaryDarker : theme.text.neutralDarker}`}
                                  >
                                    {formatDate(sunday)}
                                  </span>
                                  {dateLabel && (
                                    <span
                                      className={`px-2 py-0.5 text-xs font-bold ${theme.solids.badge} ${theme.text.onPrimary} rounded-full shadow-sm`}
                                    >
                                      {dateLabel}
                                    </span>
                                  )}
                                  {/* Attendance status badges for past dates only - show all service times */}
                                  {isPast &&
                                    allAttendanceStatuses.map((status) =>
                                      status.hasAttendance ? (
                                        <span
                                          key={status.serviceTimeId}
                                          className={`px-2 py-0.5 text-xs font-bold ${theme.solids.successButton} text-white rounded-full shadow-sm flex items-center gap-1`}
                                        >
                                          <CheckCircle2 className="w-3 h-3" />
                                          {status.serviceTimeName}
                                        </span>
                                      ) : (
                                        <span
                                          key={status.serviceTimeId}
                                          className={`px-2 py-0.5 text-xs font-bold ${theme.backgrounds.warningMedium} text-white rounded-full shadow-sm flex items-center gap-1`}
                                        >
                                          <AlertTriangle className="w-3 h-3" />
                                          {status.serviceTimeName}
                                        </span>
                                      )
                                    )}
                                </div>
                                <span
                                  className={`text-xs ${isSelected ? `${theme.text.primaryDark} font-medium` : theme.text.neutral}`}
                                >
                                  {getLessonForDate(sunday)}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div
                                className={`${theme.backgrounds.primaryLight} p-1 rounded-full flex-shrink-0`}
                              >
                                <Check
                                  className={`w-4 h-4 ${theme.text.primary}`}
                                />
                              </div>
                            )}
                          </button>
                        );
                      })}

                      {/* Show Future Lessons Toggle */}
                      {!logic.showFutureLessons && (
                        <button
                          type="button"
                          onClick={() => logic.setShowFutureLessons(true)}
                          className={`w-full px-4 py-3 text-left border-t-2 ${theme.borders.primaryLight} ${theme.backgrounds.primaryLighter} ${theme.backgrounds.primaryHover} transition-all flex items-center justify-center gap-2 last:rounded-b-xl`}
                        >
                          <Eye className={`w-4 h-4 ${theme.text.primary}`} />
                          <span className={`font-bold text-sm ${theme.text.primary}`}>
                            Ver Lições Futuras
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
          {/* Lesson Info Card */}
          <div className={`${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primaryLight} shadow-md p-4`}>
            <label
              className={`block ${theme.text.primary} font-bold mb-3 text-xs uppercase tracking-wide flex items-center gap-2`}
            >
              <Calendar className="w-4 h-4" />
              Lição
            </label>
            {selectedSchedule?.lesson ? (
              selectedSchedule.lesson.resource_url ? (
                <a
                  href={selectedSchedule.lesson.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${theme.text.primaryDark} font-semibold text-base ${theme.text.primaryDarker} hover:underline flex items-center gap-2 transition-colors`}
                >
                  {selectedSchedule.lesson.name}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <p className={`${theme.text.primaryDark} font-semibold text-base`}>
                  {selectedSchedule.lesson.name}
                </p>
              )
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <p className="font-semibold text-base">Sem lição agendada</p>
              </div>
            )}
          </div>

          {/* Service Time Card */}
          <div className={`${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primaryLight} shadow-md p-4`}>
            <label
              className={`block ${theme.text.primary} font-bold mb-3 text-xs uppercase tracking-wide flex items-center gap-2`}
            >
              <Clock className="w-4 h-4" />
              Horário do Culto
            </label>
            <div className="flex gap-3">
              {serviceTimes.map((serviceTime) => (
                <button
                  key={serviceTime.id}
                  onClick={() => logic.setSelectedServiceTimeId(serviceTime.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                    logic.selectedServiceTimeId === serviceTime.id
                      ? `${theme.borders.primary} ${theme.backgrounds.primaryLighter} shadow-md`
                      : `${theme.borders.primaryLight} ${theme.backgrounds.white} hover:shadow-md ${theme.borders.primaryHover}`
                  }`}
                >
                  <Clock className={`w-4 h-4 ${
                    logic.selectedServiceTimeId === serviceTime.id
                      ? theme.text.primary
                      : theme.text.neutral
                  }`} />
                  <span
                    className={`font-bold text-sm ${
                      logic.selectedServiceTimeId === serviceTime.id
                        ? theme.text.primaryDarker
                        : theme.text.neutralDarker
                    }`}
                  >
                    {serviceTime.time.substring(0, 5)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Method Selection Card */}
          <div className={`${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primaryLight} shadow-md p-4`}>
            <label
              className={`block ${theme.text.primary} font-bold mb-3 text-xs uppercase tracking-wide flex items-center gap-2`}
            >
              <Search className="w-4 h-4" />
              Método de Registo
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Search Method - DEFAULT */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => logic.setSelectedMethod("search")}
                  className={`w-full p-3 rounded-xl border-2 transition-all ${
                    logic.selectedMethod === "search"
                      ? `${theme.borders.secondary} ${theme.backgrounds.secondaryLight50} shadow-md`
                      : `${theme.borders.primaryLight} ${theme.backgrounds.white} hover:shadow-md ${theme.borders.primaryHover}`
                  }`}
                >
                  <UserCheck className={`w-6 h-6 mx-auto mb-2 ${
                    logic.selectedMethod === "search" ? "text-blue-600" : theme.text.neutral
                  }`} />
                  <p className={`font-bold text-sm ${theme.text.neutralDarker} whitespace-nowrap overflow-hidden text-ellipsis px-1`}>
                    Só Presentes
                  </p>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    logic.setShowMethodInfo(
                      logic.showMethodInfo === "search" ? null : "search"
                    );
                  }}
                  className={`absolute top-2 right-2 p-1.5 ${theme.backgrounds.white} hover:bg-gray-100 rounded-full transition-colors shadow-sm`}
                >
                  <Info className="w-4 h-4 text-blue-600" />
                </button>
                {logic.showMethodInfo === "search" && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => logic.setShowMethodInfo(null)}
                    />
                    <div className={`fixed left-1/2 -translate-x-1/2 bottom-32 w-72 max-w-[calc(100vw-2rem)] p-4 ${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.secondary} shadow-2xl z-50 animate-fade-in`}>
                      <p className={`text-sm ${theme.text.neutral}`}>
                        Ideal para registar pela ordem em que estão sentados.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Swipe Method */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => logic.setSelectedMethod("swipe")}
                  className={`w-full p-3 rounded-xl border-2 transition-all ${
                    logic.selectedMethod === "swipe"
                      ? `${theme.borders.primary} ${theme.backgrounds.primaryLighter} shadow-md`
                      : `${theme.borders.primaryLight} ${theme.backgrounds.white} hover:shadow-md ${theme.borders.primaryHover}`
                  }`}
                >
                  <ArrowDownAZ className={`w-6 h-6 mx-auto mb-2 ${
                    logic.selectedMethod === "swipe" ? theme.text.primary : theme.text.neutral
                  }`} />
                  <p className={`font-bold text-sm ${theme.text.neutralDarker} whitespace-nowrap overflow-hidden text-ellipsis px-1`}>
                    Ordem Alfabética
                  </p>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    logic.setShowMethodInfo(
                      logic.showMethodInfo === "swipe" ? null : "swipe"
                    );
                  }}
                  className={`absolute top-2 right-2 p-1.5 ${theme.backgrounds.white} hover:bg-gray-100 rounded-full transition-colors shadow-sm`}
                >
                  <Info className={`w-4 h-4 ${theme.text.primary}`} />
                </button>
                {logic.showMethodInfo === "swipe" && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => logic.setShowMethodInfo(null)}
                    />
                    <div className={`fixed left-1/2 -translate-x-1/2 bottom-32 w-72 max-w-[calc(100vw-2rem)] p-4 ${theme.backgrounds.white} rounded-xl border-2 ${theme.borders.primary} shadow-2xl z-50 animate-fade-in`}>
                      <p className={`text-sm ${theme.text.neutral}`}>
                        Percorre todos para marcar presente ou falta.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed button at bottom */}
        <div className={`flex-shrink-0 p-5 border-t ${theme.borders.neutralLight} ${theme.backgrounds.white}`}>
          <button
            onClick={() =>
              onDateSelected(
                logic.selectedDate,
                logic.selectedMethod,
                logic.selectedServiceTimeId
              )
            }
            className={`w-full px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center`}
          >
            Continuar
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}

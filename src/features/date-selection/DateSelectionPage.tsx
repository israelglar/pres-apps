import {
  AlertCircle,
  AlertTriangle,
  ArrowDownAZ,
  ArrowLeft,
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
    <div
      className={`min-h-screen ${theme.gradients.background} flex flex-col p-4`}
    >
      <div
        className="max-w-2xl w-full mx-auto flex flex-col"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
      >
        <div className="text-center mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-white">Selecionar Data</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-5">
              <label className="block text-gray-800 font-bold mb-3 text-xs">
                Data da Lição
              </label>

              {/* Custom Select Dropdown */}
              <div className="relative" ref={logic.dropdownRef}>
                <button
                  type="button"
                  onClick={() => logic.setIsOpen(!logic.isOpen)}
                  className={`w-full px-4 py-3 text-sm border-2 ${theme.borders.primary} rounded-xl focus:ring-4 ${theme.rings.primary} ${theme.borders.primaryFocus} cursor-pointer ${theme.gradients.cardNeutral} ${theme.borders.primaryHover} hover:from-cyan-50/50 hover:to-cyan-100/50 transition-all shadow-md hover:shadow-lg flex items-center justify-between`}
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
                          className={`w-full px-4 py-3 text-left hover:bg-cyan-50 transition-all flex items-center justify-between border-b ${theme.borders.neutralLight} last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                            isSelected ? theme.gradients.selectedItem : ""
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
                                    className={`px-2 py-0.5 text-xs font-bold ${theme.gradients.badge} text-white rounded-full shadow-sm`}
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
                                        className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-sm flex items-center gap-1"
                                      >
                                        <CheckCircle2 className="w-3 h-3" />
                                        {status.serviceTimeName}
                                      </span>
                                    ) : (
                                      <span
                                        key={status.serviceTimeId}
                                        className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-sm flex items-center gap-1"
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
                        className="w-full px-4 py-3 text-left border-t-2 border-emerald-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all flex items-center justify-center gap-2 last:rounded-b-xl"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-sm text-blue-700">
                          Ver Lições Futuras
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              className={`${theme.gradients.cardHighlight} border-2 ${theme.borders.primary} rounded-xl p-4 shadow-inner`}
            >
              <div className="mb-4">
                <label
                  className={`block ${theme.text.primaryDark} font-bold mb-3 text-xs uppercase tracking-wide flex items-center gap-2`}
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
                    <p
                      className={`${theme.text.primaryDark} font-semibold text-base`}
                    >
                      {selectedSchedule.lesson.name}
                    </p>
                  )
                ) : (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="font-semibold text-base">
                      Sem lição agendada
                    </p>
                  </div>
                )}
              </div>

              {/* Service Time Selector */}
              <div className="border-t border-cyan-200 pt-4">
                <label
                  className={`block ${theme.text.primaryDark} font-bold mb-3 text-xs uppercase tracking-wide flex items-center gap-2`}
                >
                  <Clock className="w-4 h-4" />
                  Horário do Culto
                </label>
                <div className="flex gap-2">
                  {serviceTimes.map((serviceTime) => (
                    <label
                      key={serviceTime.id}
                      className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        logic.selectedServiceTimeId === serviceTime.id
                          ? `${theme.borders.primary} bg-white shadow-md`
                          : "border-cyan-200 bg-white/50 hover:bg-white hover:border-cyan-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="serviceTime"
                        value={serviceTime.id}
                        checked={logic.selectedServiceTimeId === serviceTime.id}
                        onChange={() =>
                          logic.setSelectedServiceTimeId(serviceTime.id)
                        }
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
                      />
                      <span
                        className={`ml-3 font-bold text-sm ${
                          logic.selectedServiceTimeId === serviceTime.id
                            ? theme.text.primaryDarker
                            : theme.text.neutralDarker
                        }`}
                      >
                        {serviceTime.time.substring(0, 5)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Method Selector */}
              <div className="border-t border-cyan-200 pt-4 mt-4">
                <label
                  className={`block ${theme.text.primaryDark} font-bold mb-3 text-xs uppercase tracking-wide flex items-center gap-2`}
                >
                  <Search className="w-4 h-4" />
                  Método de Registo
                </label>
                <div className="space-y-2">
                  {/* Search Method - DEFAULT */}
                  <div
                    className={`flex items-center p-3 rounded-xl border-2 transition-all relative ${
                      logic.selectedMethod === "search"
                        ? `${theme.borders.secondary} bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md`
                        : "border-cyan-200 bg-white/50"
                    }`}
                  >
                    <label className="flex items-center flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="method"
                        value="search"
                        checked={logic.selectedMethod === "search"}
                        onChange={() => logic.setSelectedMethod("search")}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      />
                      <div className="ml-3 flex items-center gap-1.5 flex-1">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <span
                          className={`font-bold text-sm ${theme.text.neutralDarker}`}
                        >
                          Só Presentes
                        </span>
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        logic.setShowMethodInfo(
                          logic.showMethodInfo === "search" ? null : "search"
                        );
                      }}
                      className="ml-2 p-1 hover:bg-blue-100 rounded-full transition-colors relative"
                    >
                      <Info className="w-4 h-4 text-blue-600" />
                    </button>
                    {logic.showMethodInfo === "search" && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => logic.setShowMethodInfo(null)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white rounded-xl border-2 border-blue-200 shadow-2xl z-50 animate-fade-in">
                          <p className={`text-sm ${theme.text.neutral}`}>
                            Seleciona apenas os prés que estão presentes. Ideal para
                            registar pela ordem em que estão sentados.
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Swipe Method */}
                  <div
                    className={`flex items-center p-3 rounded-xl border-2 transition-all relative ${
                      logic.selectedMethod === "swipe"
                        ? `${theme.borders.primary} bg-gradient-to-r from-cyan-50 to-blue-50 shadow-md`
                        : "border-cyan-200 bg-white/50"
                    }`}
                  >
                    <label className="flex items-center flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="method"
                        value="swipe"
                        checked={logic.selectedMethod === "swipe"}
                        onChange={() => logic.setSelectedMethod("swipe")}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
                      />
                      <div className="ml-3 flex items-center gap-2">
                        <ArrowDownAZ className="w-4 h-4 text-emerald-600" />
                        <span
                          className={`font-bold text-sm ${theme.text.neutralDarker}`}
                        >
                          Ordem Alfabética
                        </span>
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        logic.setShowMethodInfo(
                          logic.showMethodInfo === "swipe" ? null : "swipe"
                        );
                      }}
                      className="ml-2 p-1 hover:bg-cyan-100 rounded-full transition-colors relative"
                    >
                      <Info className="w-4 h-4 text-emerald-600" />
                    </button>
                    {logic.showMethodInfo === "swipe" && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => logic.setShowMethodInfo(null)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-white rounded-xl border-2 border-cyan-200 shadow-2xl z-50 animate-fade-in">
                          <p className={`text-sm ${theme.text.neutral}`}>
                            Percorre todos por ordem alfabética e desliza para
                            marcar presente ou falta.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed buttons at bottom */}
          <div className="p-5 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm flex items-center justify-center`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </button>
              <button
                onClick={() =>
                  onDateSelected(
                    logic.selectedDate,
                    logic.selectedMethod,
                    logic.selectedServiceTimeId
                  )
                }
                className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center`}
              >
                Continuar
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

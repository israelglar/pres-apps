import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { theme } from "../../../config/theme";
import { formatDate } from "../../../utils/helperFunctions";
import type { RefObject } from "react";

interface DatePickerProps {
  selectedDate: Date;
  filteredSundays: Date[];
  isOpen: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  dropdownListRef: RefObject<HTMLDivElement | null>;
  selectedItemRef: RefObject<HTMLButtonElement | null>;
  getDateLabel: (date: Date) => string | null;
  getLessonForDate: (date: Date) => string;
  isPastDate: (date: Date) => boolean;
  getAllAttendanceStatuses: (date: Date) => Array<{
    serviceTimeId: number;
    serviceTimeName: string;
    hasAttendance: boolean;
    attendanceCount: number;
    hasSchedule: boolean;
  }>;
  onToggleOpen: () => void;
  onSelectDate: (date: Date) => void;
}

export function DatePicker({
  selectedDate,
  filteredSundays,
  isOpen,
  dropdownRef,
  dropdownListRef,
  selectedItemRef,
  getDateLabel,
  getLessonForDate,
  isPastDate,
  getAllAttendanceStatuses,
  onToggleOpen,
  onSelectDate,
}: DatePickerProps) {
  return (
    <div className="flex-shrink-0 px-4 pt-4 pb-2">
      <div className={`${theme.backgrounds.white} rounded-xl border ${theme.borders.primaryLight} shadow-md`}>
        {/* Custom Select Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={onToggleOpen}
            className={`w-full px-3 py-3 text-sm ${theme.backgrounds.primaryHover} rounded-xl transition-all flex items-center justify-between`}
          >
            <div className="flex items-center gap-2">
              <Calendar className={`w-4 h-4 ${theme.text.primary}`} />
              <span
                className={`font-semibold ${theme.text.primary} text-sm`}
              >
                {formatDate(selectedDate)}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 ${theme.text.primary} transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <div
              ref={dropdownListRef}
              className={`absolute z-10 w-full mt-2 bg-white border ${theme.borders.primary} rounded-xl shadow-2xl max-h-80 overflow-y-auto`}
            >
              {filteredSundays.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className={`w-16 h-16 ${theme.text.neutralLight} mx-auto mb-4`} />
                  <p className={`${theme.text.neutral} font-medium`}>Nenhuma data disponível</p>
                </div>
              ) : (
                <>
                  {filteredSundays.map((sunday) => {
                    const isSelected =
                      sunday.toDateString() ===
                      selectedDate.toDateString();
                    const dateLabel = getDateLabel(sunday);
                    const isPast = isPastDate(sunday);
                    const allAttendanceStatuses =
                      getAllAttendanceStatuses(sunday);

                    return (
                      <button
                        key={sunday.toISOString()}
                        ref={isSelected ? selectedItemRef : null}
                        type="button"
                        onClick={() => {
                          onSelectDate(sunday);
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
                              {/* Attendance status badges - show all service times */}
                              {allAttendanceStatuses.map((status) =>
                                status.hasAttendance ? (
                                  <span
                                    key={status.serviceTimeId}
                                    className={`px-2 py-0.5 text-xs font-bold ${theme.solids.successButton} text-white rounded-full shadow-sm flex items-center gap-1`}
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    {status.serviceTimeName}
                                  </span>
                                ) : isPast ? (
                                  <span
                                    key={status.serviceTimeId}
                                    className={`px-2 py-0.5 text-xs font-bold ${theme.backgrounds.warningMedium} text-white rounded-full shadow-sm flex items-center gap-1`}
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                    {status.serviceTimeName}
                                  </span>
                                ) : null
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

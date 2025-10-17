import { useBlocker } from "@tanstack/react-router";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { initHaptics, selectionTap, successVibration } from "../utils/haptics";
import {
  formatDate,
  getLessonName,
  getShortName,
} from "../utils/helperFunctions";

// Type definitions
interface Student {
  id: string;
  name: string;
}

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: "P" | "F";
  timestamp: Date;
}

interface AttendanceMarkingPageProps {
  students: Student[];
  selectedDate: Date;
  lessonNames: Record<string, string>;
  onComplete: (records: AttendanceRecord[]) => void;
  onCancel?: () => void;
}

export const AttendanceMarkingPage = ({
  students,
  selectedDate,
  lessonNames,
  onComplete,
  onCancel,
}: AttendanceMarkingPageProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [isComplete, setIsComplete] = useState(false);
  const studentRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);

  // Use TanStack Router's navigation blocker with custom UI
  const hasUnsavedData =
    Object.keys(attendanceRecords).length > 0 && !isComplete;
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => hasUnsavedData,
    withResolver: true,
  });

  // Minimum swipe distance (in px) to trigger action
  const minSwipeDistance = 50;

  const currentStudent = students[currentIndex];
  const completedCount = Object.keys(attendanceRecords).length;
  const progress = (completedCount / students.length) * 100;

  // Initialize haptics on component mount (requires user interaction context)
  useEffect(() => {
    initHaptics();
  }, []);

  useEffect(() => {
    const currentRef = studentRefs.current[currentStudent.id];
    if (currentRef) {
      currentRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [currentIndex, currentStudent.id]);

  const handleConfirmLeave = () => {
    // Allow navigation to proceed
    proceed?.();
  };

  const handleCancelLeave = () => {
    // Cancel navigation and stay on page
    reset?.();
  };

  const handleMark = (status: "P" | "F") => {
    // Haptic feedback for marking
    selectionTap();

    const newRecords = {
      ...attendanceRecords,
      [currentStudent.id]: {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        status: status,
        timestamp: new Date(),
      },
    };

    setAttendanceRecords(newRecords);

    if (Object.keys(newRecords).length === students.length) {
      // Success vibration when completing all students
      successVibration();
      setIsComplete(true);
      setTimeout(() => {
        onComplete(Object.values(newRecords));
      }, 2000);
    } else {
      setTimeout(() => {
        findNextUnmarked(newRecords);
      }, 150);
    }
  };

  const findNextUnmarked = (records: Record<string, AttendanceRecord>) => {
    for (let i = currentIndex + 1; i < students.length; i++) {
      if (!records[students[i].id]) {
        setCurrentIndex(i);
        return;
      }
    }
    for (let i = 0; i < currentIndex; i++) {
      if (!records[students[i].id]) {
        setCurrentIndex(i);
        return;
      }
    }
  };

  const handleClickHistory = (studentId: string) => {
    const index = students.findIndex((s) => s.id === studentId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  // Swipe gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    // Don't allow new swipes while animating
    if (isAnimatingSwipe) return;

    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    if (touchStart !== null) {
      const offset = currentTouch - touchStart;
      // Limit the offset for visual feedback
      setSwipeOffset(Math.max(-150, Math.min(150, offset)));

      // Reset button backgrounds when swiping starts
      if (Math.abs(offset) > 10) {
        const buttons = document.querySelectorAll(".click-area-button");
        buttons.forEach((btn) => {
          if (btn instanceof HTMLElement) {
            const isLeft = btn.classList.contains("left-button");
            btn.style.background = isLeft
              ? "linear-gradient(to right, rgba(239, 68, 68, 0), transparent)"
              : "linear-gradient(to left, rgba(16, 185, 129, 0), transparent)";
          }
        });
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // Trigger completion animation
      setIsAnimatingSwipe(true);
      const targetOffset = isLeftSwipe ? -300 : 300;
      setSwipeOffset(targetOffset);

      // Reset after animation completes (200ms)
      setTimeout(() => {
        setTouchStart(null);
        setTouchEnd(null);
        setSwipeOffset(0);
        setIsAnimatingSwipe(false);
      }, 200);

      // Mark attendance
      if (isLeftSwipe) {
        handleMark("F");
      } else {
        handleMark("P");
      }
    } else {
      // Reset swipe state if threshold not met
      setTouchStart(null);
      setTouchEnd(null);
      setSwipeOffset(0);
    }
  };

  if (isComplete) {
    const presentCount = Object.values(attendanceRecords).filter(
      (r) => r.status === "P"
    ).length;
    const absentCount = Object.values(attendanceRecords).filter(
      (r) => r.status === "F"
    ).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-emerald-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Presenças Registadas!
            </h2>
            <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
              {getLessonName(selectedDate, lessonNames)}
            </p>
            <div className="flex justify-center gap-6 md:gap-8 mb-6 md:mb-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-1">
                  {presentCount}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  Presentes
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-red-600 mb-1">
                  {absentCount}
                </div>
                <div className="text-xs md:text-sm text-gray-600 font-medium">
                  Faltas
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs md:text-sm">
              A regressar ao início...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-80 bg-gradient-to-b from-white to-gray-50 shadow-2xl flex flex-col max-h-[40vh] md:max-h-screen">
        <div className="sticky top-0 bg-gradient-to-br from-emerald-50 to-teal-50 border-b-2 border-emerald-200 px-3 py-2.5 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 bg-white/80 backdrop-blur-sm rounded-full border border-emerald-200 flex-shrink-0">
              <span className="text-xs font-bold text-emerald-700">
                {completedCount}
              </span>
              <span className="text-xs text-gray-500">
                {" "}
                / {students.length}
              </span>
            </div>
            <div className="flex-1 bg-gray-200/70 rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 h-full transition-all duration-300 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 font-medium hover:bg-white/50 rounded-lg transition-all flex-shrink-0"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="p-2 overflow-y-auto flex-1">
          {students.map((student, idx) => {
            const record = attendanceRecords[student.id];
            const isMarked = !!record;
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={student.id}
                ref={(el) => {
                  studentRefs.current[student.id] = el;
                }}
                onClick={() => isMarked && handleClickHistory(student.id)}
                disabled={!isMarked}
                className={`w-full text-left p-2.5 rounded-xl mb-2 transition-all shadow-sm ${
                  isCurrent
                    ? "bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-500 shadow-md"
                    : isMarked
                      ? record.status === "P"
                        ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-2 border-emerald-400 hover:shadow-md cursor-pointer"
                        : "bg-gradient-to-r from-red-50 to-red-100/50 border-2 border-red-400 hover:shadow-md cursor-pointer"
                      : "bg-white border-2 border-gray-200/60 opacity-40 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                        isCurrent
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 ring-2 ring-blue-300"
                          : isMarked
                            ? record.status === "P"
                              ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                              : "bg-gradient-to-br from-red-500 to-red-600"
                            : "bg-gradient-to-br from-gray-300 to-gray-400"
                      }`}
                    >
                      <span className="text-white font-bold text-sm">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-semibold text-sm truncate ${
                          isCurrent
                            ? "text-blue-900"
                            : isMarked
                              ? record.status === "P"
                                ? "text-emerald-900"
                                : "text-red-900"
                              : "text-gray-400"
                        }`}
                      >
                        {student.name}
                      </p>
                    </div>
                  </div>
                  {isMarked &&
                    (record.status === "P" ? (
                      <div className="bg-emerald-100 rounded-full p-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      </div>
                    ) : (
                      <div className="bg-red-100 rounded-full p-1">
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      </div>
                    ))}
                  {isCurrent && !isMarked && (
                    <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5 mb-4">
          <div className="text-center">
            <p className="text-gray-800 text-base font-bold">
              {formatDate(selectedDate)}
            </p>
            <p className="text-gray-600 text-sm mt-0.5">
              {getLessonName(selectedDate, lessonNames)}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
          <div
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl mb-6 relative overflow-hidden p-8"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Always visible gradient backgrounds */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1/3 pointer-events-none rounded-l-3xl z-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(239, 68, 68, 0.1), transparent)",
              }}
            />
            <div
              className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none rounded-r-3xl z-0"
              style={{
                background:
                  "linear-gradient(to left, rgba(16, 185, 129, 0.1), transparent)",
              }}
            />

            {/* Left side indicator - Falta */}
            <div
              className="absolute left-4 top-1/2 pointer-events-none z-10 transition-all duration-150"
              style={{
                opacity:
                  swipeOffset < 0
                    ? Math.min(1, 0.6 + Math.abs(swipeOffset) / 200)
                    : 0.6,
                transform: `translateY(-50%) scale(${swipeOffset < 0 ? 1 + Math.abs(swipeOffset) / 300 : 1})`,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <XCircle className="w-8 h-8 text-red-500" />
                <span className="text-xs font-bold text-red-600">Falta</span>
              </div>
            </div>

            {/* Right side indicator - Presente */}
            <div
              className="absolute right-4 top-1/2 pointer-events-none z-10 transition-all duration-150"
              style={{
                opacity:
                  swipeOffset > 0 ? Math.min(1, 0.6 + swipeOffset / 200) : 0.6,
                transform: `translateY(-50%) scale(${swipeOffset > 0 ? 1 + swipeOffset / 300 : 1})`,
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600">
                  Presente
                </span>
              </div>
            </div>

            {/* Swipe feedback indicators */}
            {swipeOffset !== 0 && (
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-150 rounded-3xl z-0"
                style={{
                  background:
                    swipeOffset > 0
                      ? "linear-gradient(to right, transparent, rgba(16, 185, 129, 0.2))"
                      : "linear-gradient(to left, transparent, rgba(239, 68, 68, 0.2))",
                  opacity: Math.abs(swipeOffset) / 150,
                }}
              />
            )}

            {/* Center - Student info */}
            <div
              className="text-center relative z-10 pointer-events-none"
              style={{
                transform: `translateX(${swipeOffset}px)`,
                transition: isAnimatingSwipe
                  ? "transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)"
                  : "transform 0ms",
              }}
            >
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {currentStudent.name.charAt(0)}
                </span>
              </div>
              <h2 className="text-gray-800 text-2xl font-bold mb-2 leading-tight">
                {getShortName(currentStudent.name)}
              </h2>
              <p className="text-gray-500 text-sm">
                Toque nos lados ou deslize
              </p>
            </div>

            {/* Clickable areas overlaid */}
            <button
              onClick={() => handleMark("F")}
              className="click-area-button left-button absolute left-0 top-0 bottom-0 w-1/3 active:bg-red-200/60 transition-colors rounded-l-3xl z-20 touch-none"
              style={{
                background:
                  "linear-gradient(to right, rgba(239, 68, 68, 0), transparent)",
              }}
              onPointerDown={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, rgba(239, 68, 68, 0.3), transparent)";
              }}
              onPointerUp={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, rgba(239, 68, 68, 0), transparent)";
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to right, rgba(239, 68, 68, 0), transparent)";
              }}
            />
            <button
              onClick={() => handleMark("P")}
              className="click-area-button right-button absolute right-0 top-0 bottom-0 w-1/3 active:bg-emerald-200/60 transition-colors rounded-r-3xl z-20 touch-none"
              style={{
                background:
                  "linear-gradient(to left, rgba(16, 185, 129, 0), transparent)",
              }}
              onPointerDown={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to left, rgba(16, 185, 129, 0.3), transparent)";
              }}
              onPointerUp={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to left, rgba(16, 185, 129, 0), transparent)";
              }}
              onPointerLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(to left, rgba(16, 185, 129, 0), transparent)";
              }}
            />
          </div>

          <div className="hidden md:grid grid-cols-2 gap-4">
            <button
              onClick={() => handleMark("F")}
              className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all p-6 group"
            >
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 inline-flex mb-3 group-hover:scale-110 transition-transform">
                  <XCircle className="w-12 h-12 text-white" />
                </div>
                <p className="text-white text-lg font-bold">Falta</p>
              </div>
            </button>

            <button
              onClick={() => handleMark("P")}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all p-6 group"
            >
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 inline-flex mb-3 group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <p className="text-white text-lg font-bold">Presente</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Confirmation Dialog */}
      {status === "blocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Tem a certeza?
              </h3>
              <p className="text-gray-600 text-sm">
                Tem registos de presença por guardar. Se sair agora, perderá
                todo o progresso.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelLeave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:from-gray-200 hover:to-gray-300 hover:shadow-md active:scale-95 transition-all border-2 border-gray-300"
              >
                Continuar a Marcar
              </button>
              <button
                onClick={handleConfirmLeave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold text-sm hover:from-red-600 hover:to-red-700 hover:shadow-lg active:scale-95 transition-all shadow-md"
              >
                Sair Sem Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  formatDate,
  formatDateLong,
  getShortName,
} from "../utils/helperFunctions";
import { selectionTap, successVibration } from "../utils/haptics";

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
  onComplete: (records: AttendanceRecord[]) => void;
}

export const AttendanceMarkingPage = ({
  students,
  selectedDate,
  onComplete,
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

  // Minimum swipe distance (in px) to trigger action
  const minSwipeDistance = 50;

  const currentStudent = students[currentIndex];
  const completedCount = Object.keys(attendanceRecords).length;
  const progress = (completedCount / students.length) * 100;

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

    if (isLeftSwipe) {
      // Swipe left = Mark as Absent (Falta)
      handleMark("F");
    } else if (isRightSwipe) {
      // Swipe right = Mark as Present (Presente)
      handleMark("P");
    }

    // Reset swipe state
    setTouchStart(null);
    setTouchEnd(null);
    setSwipeOffset(0);
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
              {formatDateLong(selectedDate)}
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
      <div className="w-full md:w-80 bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col max-h-[40vh] md:max-h-screen">
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-3 md:p-4 z-10 flex-shrink-0">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <h3 className="font-bold text-gray-800 text-base md:text-lg">
              Histórico
            </h3>
            <div className="text-xs md:text-sm font-semibold text-gray-600">
              {completedCount} / {students.length}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-600 to-teal-600 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
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
                ref={(el) => { studentRefs.current[student.id] = el; }}
                onClick={() => isMarked && handleClickHistory(student.id)}
                disabled={!isMarked}
                className={`w-full text-left p-3 md:p-3 rounded-lg mb-2 md:mb-2 transition-all min-h-[52px] ${
                  isCurrent
                    ? "bg-blue-100 border-2 border-blue-400 shadow-md"
                    : isMarked
                    ? record.status === "P"
                      ? "bg-emerald-50 border-2 border-emerald-300 hover:bg-emerald-100 cursor-pointer"
                      : "bg-red-50 border-2 border-red-300 hover:bg-red-100 cursor-pointer"
                    : "bg-gray-100 border-2 border-gray-200 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-3 flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? "bg-blue-500"
                          : isMarked
                          ? record.status === "P"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                          : "bg-gray-300"
                      }`}
                    >
                      <span className="text-white font-bold text-sm md:text-base">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm md:text-base truncate ${
                          isCurrent
                            ? "text-blue-800"
                            : isMarked
                            ? record.status === "P"
                              ? "text-emerald-800"
                              : "text-red-800"
                            : "text-gray-500"
                        }`}
                      >
                        {student.name}
                      </p>
                    </div>
                  </div>
                  {isMarked &&
                    (record.status === "P" ? (
                      <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600 flex-shrink-0" />
                    ))}
                  {isCurrent && !isMarked && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/30 px-4 md:px-6 py-3 md:py-4">
          <div className="text-center">
            <p className="text-white/90 text-base md:text-lg font-medium">
              {formatDate(selectedDate)}
            </p>
          </div>
        </div>

        <div className="flex-1 flex">
          <button
            onClick={() => handleMark("F")}
            className="flex-1 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-98 transition-all group"
          >
            <div className="text-center">
              <XCircle className="w-20 h-20 md:w-32 md:h-32 text-white/80 mx-auto mb-2 md:mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-white text-xl md:text-3xl font-bold">Falta</p>
            </div>
          </button>

          <div
            className="w-64 md:w-96 flex items-center justify-center bg-white/10 backdrop-blur-sm border-x-2 md:border-x-4 border-white/30 relative overflow-hidden"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Swipe feedback indicators */}
            {swipeOffset !== 0 && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                  style={{
                    background:
                      swipeOffset > 0
                        ? "linear-gradient(to right, rgba(16, 185, 129, 0.3), transparent)"
                        : "linear-gradient(to left, rgba(239, 68, 68, 0.3), transparent)",
                    opacity: Math.abs(swipeOffset) / 150,
                  }}
                />
              </>
            )}

            <div
              className="text-center px-4 md:px-8 transition-transform duration-150"
              style={{
                transform: `translateX(${swipeOffset}px)`,
              }}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-2xl">
                <span className="text-4xl md:text-6xl font-bold text-emerald-600">
                  {currentStudent.name.charAt(0)}
                </span>
              </div>
              <h2 className="text-white text-xl md:text-3xl font-bold mb-1 md:mb-2 leading-tight px-2">
                {getShortName(currentStudent.name)}
              </h2>
              <p className="text-white/80 text-sm md:text-lg">
                Toque ou deslize
              </p>
            </div>
          </div>

          <button
            onClick={() => handleMark("P")}
            className="flex-1 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-98 transition-all group"
          >
            <div className="text-center">
              <CheckCircle className="w-20 h-20 md:w-32 md:h-32 text-white/80 mx-auto mb-2 md:mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-white text-xl md:text-3xl font-bold">
                Presente
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

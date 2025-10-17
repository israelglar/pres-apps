import { useBlocker } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { CheckCircle, Search } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { initHaptics, selectionTap, successVibration } from "../utils/haptics";
import { formatDate, getLessonName } from "../utils/helperFunctions";

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

interface SearchAttendanceMarkingPageProps {
  students: Student[];
  date: Date;
  lessonNames: Record<string, string>;
  onComplete: (records: AttendanceRecord[]) => void;
  onCancel: () => void;
}

export const SearchAttendanceMarkingPage: React.FC<
  SearchAttendanceMarkingPageProps
> = ({ students, date, lessonNames, onComplete, onCancel }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [isComplete, setIsComplete] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use TanStack Router's navigation blocker with custom UI
  const hasUnsavedData =
    Object.keys(attendanceRecords).length > 0 && !isComplete;
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => hasUnsavedData,
    withResolver: true,
  });

  // Initialize haptics on component mount
  useEffect(() => {
    initHaptics();
  }, []);

  // Separate students into marked and unmarked, with marked at the bottom
  const { unmarkedStudents, markedStudents } = useMemo(() => {
    const unmarked: Student[] = [];
    const marked: Student[] = [];

    students.forEach((student) => {
      if (attendanceRecords[student.id]) {
        marked.push(student);
      } else {
        unmarked.push(student);
      }
    });

    return { unmarkedStudents: unmarked, markedStudents: marked };
  }, [students, attendanceRecords]);

  // Setup Fuse.js for fuzzy search on unmarked students
  const fuse = useMemo(() => {
    return new Fuse(unmarkedStudents, {
      keys: ["name"],
      threshold: 0.3, // 0 = perfect match, 1 = match anything
      includeScore: true,
    });
  }, [unmarkedStudents]);

  // Filter students based on search query
  const displayedStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...unmarkedStudents, ...markedStudents];
    }

    // Search only among unmarked students
    const searchResults = fuse.search(searchQuery);
    const filteredUnmarked = searchResults.map((result) => result.item);

    return [...filteredUnmarked, ...markedStudents];
  }, [searchQuery, unmarkedStudents, markedStudents, fuse]);

  // Auto-focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleConfirmLeave = () => {
    // Allow navigation to proceed
    proceed?.();
  };

  const handleCancelLeave = () => {
    // Cancel navigation and stay on page
    reset?.();
  };

  const handleMarkPresent = (student: Student) => {
    selectionTap();

    const newRecords = {
      ...attendanceRecords,
      [student.id]: {
        studentId: student.id,
        studentName: student.name,
        status: "P" as const,
        timestamp: new Date(),
      },
    };

    setAttendanceRecords(newRecords);
    setSearchQuery(""); // Clear search after marking
    searchInputRef.current?.focus(); // Refocus search input
  };

  const handleUnmark = (studentId: string) => {
    selectionTap();
    const newRecords = { ...attendanceRecords };
    delete newRecords[studentId];
    setAttendanceRecords(newRecords);
  };

  const handleComplete = () => {
    successVibration();

    // Mark all unmarked students as absent
    const finalRecords: Record<string, AttendanceRecord> = {
      ...attendanceRecords,
    };

    students.forEach((student) => {
      if (!finalRecords[student.id]) {
        finalRecords[student.id] = {
          studentId: student.id,
          studentName: student.name,
          status: "F",
          timestamp: new Date(),
        };
      }
    });

    setIsComplete(true);

    // Show completion screen briefly before calling onComplete
    setTimeout(() => {
      onComplete(Object.values(finalRecords));
    }, 1500);
  };

  const presentCount = Object.values(attendanceRecords).filter(
    (r) => r.status === "P"
  ).length;
  const totalCount = students.length;

  if (isComplete) {
    const absentCount = totalCount - presentCount;

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
              {getLessonName(date, lessonNames)}
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
    <div className="h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-b from-white to-gray-50 shadow-lg p-4 flex-shrink-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-base font-bold text-gray-800">
                {formatDate(date)}
              </h1>
              <p className="text-sm text-gray-600 font-medium mt-0.5">
                {getLessonName(date, lessonNames)}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-white/50 rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 w-5 h-5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Procurar pelo nome..."
              className="w-full pl-10 pr-4 py-3 border-2 border-emerald-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:border-emerald-500 text-lg bg-gradient-to-r from-white to-emerald-50/30 shadow-md"
              autoFocus
            />
          </div>

          {/* Progress */}
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-700 font-bold">
              {presentCount} / {totalCount} presentes
            </span>
            <div className="flex-1 mx-4 bg-gray-200/70 rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 h-full transition-all duration-300 shadow-sm"
                style={{
                  width: `${(presentCount / totalCount) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-2">
          {displayedStudents.length === 0 && searchQuery.trim() !== "" ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum aluno encontrado
            </div>
          ) : (
            displayedStudents.map((student) => {
              const isMarked = !!attendanceRecords[student.id];

              return (
                <button
                  key={student.id}
                  onClick={() => {
                    if (isMarked) {
                      handleUnmark(student.id);
                    } else {
                      handleMarkPresent(student);
                    }
                  }}
                  className={`w-full p-4 rounded-xl text-left flex items-center justify-between transition-all duration-200 shadow-sm ${
                    isMarked
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-2 border-emerald-400 opacity-60 hover:shadow-md cursor-pointer"
                      : "bg-white border-2 border-gray-200/60 hover:border-emerald-400 hover:shadow-lg active:scale-98 transition-all"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isMarked && (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600">
                        <span className="text-white font-bold text-sm">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span
                      className={`text-lg font-semibold ${
                        isMarked ? "text-emerald-900" : "text-gray-800"
                      }`}
                    >
                      {student.name}
                    </span>
                  </div>
                  {isMarked && (
                    <div className="bg-emerald-100 rounded-full p-1">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Complete Button */}
      <div className="bg-gradient-to-b from-white to-gray-50 border-t-2 border-emerald-200 p-4 flex-shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleComplete}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-bold text-lg rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            Terminado ({presentCount} presentes)
          </button>
          {unmarkedStudents.length > 0 && (
            <p className="text-center text-sm text-gray-700 font-medium mt-2">
              {unmarkedStudents.length} aluno
              {unmarkedStudents.length !== 1 ? "s" : ""} receber
              {unmarkedStudents.length !== 1 ? "ão" : "á"} falta
            </p>
          )}
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

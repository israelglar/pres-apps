import { CheckCircle, Search } from "lucide-react";
import React from "react";
import { formatDate, getLessonName } from "../../utils/helperFunctions";
import { useSearchAttendanceMarkingLogic } from "./SearchAttendanceMarkingPage.logic";
import type { SearchAttendanceMarkingPageProps } from "./SearchAttendanceMarkingPage.logic";
import { theme, buttonClasses, inputClasses } from "../../config/theme";

export const SearchAttendanceMarkingPage: React.FC<
  SearchAttendanceMarkingPageProps
> = ({ students, date, lessonNames, onComplete, onCancel }) => {
  const {
    searchQuery,
    setSearchQuery,
    attendanceRecords,
    isComplete,
    searchInputRef,
    displayedStudents,
    presentCount,
    totalCount,
    blockerStatus,
    handleMarkPresent,
    handleUnmark,
    handleComplete,
    handleConfirmLeave,
    handleCancelLeave,
  } = useSearchAttendanceMarkingLogic({ students, onComplete });

  if (isComplete) {
    const absentCount = totalCount - presentCount;

    return (
      <div className={`min-h-screen ${theme.gradients.background} flex items-center justify-center p-4`}>
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <div className={`w-20 h-20 ${theme.backgrounds.primaryLight} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <CheckCircle className={`w-12 h-12 ${theme.text.primary}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Presenças Registadas!
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              {getLessonName(date, lessonNames)}
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme.text.primary} mb-1`}>
                  {presentCount}
                </div>
                <div className={`text-xs ${theme.text.neutral} font-medium`}>
                  Presentes
                </div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme.text.error} mb-1`}>
                  {absentCount}
                </div>
                <div className={`text-xs ${theme.text.neutral} font-medium`}>
                  Faltas
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              A regressar ao início...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen ${theme.gradients.background} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`bg-gradient-to-b from-white to-${theme.colors.neutral[50]} shadow-lg p-4 flex-shrink-0 z-10`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-sm font-bold text-gray-800">
                {formatDate(date)}
              </h1>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {getLessonName(date, lessonNames)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-3 py-2 text-gray-600 hover:text-gray-800 font-medium hover:bg-white/50 rounded-lg transition-all text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleComplete}
                className={`px-4 py-2 ${buttonClasses.primary} text-sm flex items-center gap-2`}
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Terminado</span>
                <span className="inline sm:hidden">{presentCount}</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.text.primary} w-4 h-4`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Procurar pelo nome..."
              className={`w-full pl-10 pr-4 py-3 text-sm ${inputClasses}`}
              autoFocus
            />
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={`${theme.text.neutralDark} font-bold`}>
                {presentCount} / {totalCount} presentes
              </span>
            </div>
            <div className={`${theme.backgrounds.neutral}/70 rounded-full h-2 overflow-hidden shadow-inner`}>
              <div
                className={`${theme.gradients.progress} h-full transition-all duration-300 shadow-sm`}
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
                      ? `${theme.gradients.cardPrimary} border-2 ${theme.borders.success} opacity-60 hover:shadow-md cursor-pointer`
                      : `bg-white border-2 ${theme.borders.neutralLight}/60 ${theme.borders.primaryHover} hover:shadow-lg active:scale-98 transition-all`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isMarked && (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${theme.gradients.activeItem}`}>
                        <span className="text-white font-bold text-sm">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span
                      className={`text-base font-semibold ${
                        isMarked ? theme.text.primaryDarker : theme.text.neutralDarker
                      }`}
                    >
                      {student.name}
                    </span>
                  </div>
                  {isMarked && (
                    <div className={`${theme.backgrounds.primaryLight} rounded-full p-1`}>
                      <CheckCircle className={`w-4 h-4 ${theme.text.primary}`} />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Custom Confirmation Dialog */}
      {blockerStatus === "blocked" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 animate-in fade-in zoom-in duration-200">
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
              <h3 className="text-base font-bold text-gray-800 mb-2">
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
                className={`flex-1 px-4 py-3 ${buttonClasses.secondary} text-sm`}
              >
                Continuar a Marcar
              </button>
              <button
                onClick={handleConfirmLeave}
                className={`flex-1 px-4 py-3 ${buttonClasses.danger} text-sm`}
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

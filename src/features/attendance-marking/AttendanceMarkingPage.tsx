import { CheckCircle, Search, UserPlus, XCircle } from "lucide-react";
import { buttonClasses, inputClasses, theme } from "../../config/theme";
import {
  formatDate,
  getLessonName,
  getShortName,
} from "../../utils/helperFunctions";
import type { AttendanceMarkingPageProps } from "./AttendanceMarkingPage.logic";
import { useAttendanceMarkingLogic } from "./AttendanceMarkingPage.logic";

export const AttendanceMarkingPage = ({
  students,
  visitorStudents,
  selectedDate,
  lessonNames,
  onComplete,
  onCancel,
}: AttendanceMarkingPageProps) => {
  const {
    currentIndex,
    attendanceRecords,
    isComplete,
    studentRefs,
    swipeOffset,
    isAnimatingSwipe,
    currentStudent,
    completedCount,
    progress,
    blockerStatus,
    visitorManagement,
    handleMark,
    handleClickHistory,
    handleConfirmLeave,
    handleCancelLeave,
    handleAddVisitor,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useAttendanceMarkingLogic({ students, visitorStudents, onComplete });

  if (isComplete) {
    const presentCount = Object.values(attendanceRecords).filter(
      (r) => r.status === "P"
    ).length;
    const absentCount = Object.values(attendanceRecords).filter(
      (r) => r.status === "F"
    ).length;

    return (
      <div
        className={`min-h-screen ${theme.gradients.background} text-white flex items-center justify-center p-4`}
      >
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-2xl p-5">
            <div
              className={`w-20 h-20 ${theme.backgrounds.primaryLight} rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <CheckCircle className={`w-12 h-12 ${theme.text.primary}`} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Presenças Registadas!
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              {getLessonName(selectedDate, lessonNames)}
            </p>
            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div
                  className={`text-3xl font-bold ${theme.text.primary} mb-1`}
                >
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
            <p className="text-gray-500 text-xs">A regressar ao início...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${theme.gradients.background} text-white overflow-hidden`}>
      {/* Header Section - Sticky */}
      <header className={`flex-shrink-0 ${theme.gradients.primaryButton} shadow-lg`}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          {/* Left: Back Button with "Voltar" text */}
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="text-base font-medium">Voltar</span>
            </button>
          )}
        </div>

        {/* Title Section */}
        <div className="px-4 pb-4">
          <h1 className="text-2xl font-bold text-white mb-1">
            {formatDate(selectedDate)}
          </h1>
          <p className="text-sm font-medium text-white/90">
            {getLessonName(selectedDate, lessonNames)}
          </p>
        </div>
      </header>

      {/* Main Content Area - Takes remaining height */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Student List Section */}
        <div className="flex flex-col h-2/3 md:h-auto md:w-80 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-white/20">
          {/* Visitor Button - Fixed at top */}
          <div className="flex-shrink-0 p-5 pb-3">
            <button
              onClick={visitorManagement.openVisitorDialog}
              className="w-full px-5 py-3 bg-white text-cyan-600 rounded-xl text-sm font-medium hover:bg-white/90 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Adicionar Visitante</span>
            </button>
          </div>

          {/* Scrollable Student List - Takes remaining space */}
          <div className="flex-1 overflow-y-auto px-5 pb-5">
            <div className="space-y-2">
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
                    className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-all duration-200 shadow-sm ${
                      isCurrent && !isMarked
                        ? `bg-gradient-to-r from-blue-100 to-blue-50 border-2 ${theme.borders.secondary} shadow-md`
                        : isMarked
                          ? record.status === "P"
                            ? `${theme.gradients.cardPrimary} border-2 ${theme.borders.success} opacity-60 hover:shadow-md cursor-pointer`
                            : `bg-gradient-to-r from-red-50 to-red-100/50 border-2 ${theme.borders.error} opacity-60 hover:shadow-md cursor-pointer`
                          : `bg-white border-2 ${theme.borders.neutralLight}/60 ${theme.borders.primaryHover} hover:shadow-lg active:scale-98 transition-all`
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          isMarked
                            ? record.status === "P"
                              ? theme.text.primaryDarker
                              : "text-red-900"
                            : theme.text.neutralDarker
                        }`}
                      >
                        {student.name}
                      </span>
                      {student.isVisitor && (
                        <span
                          className={`px-1.5 py-0.5 ${theme.gradients.badge} text-white text-xs font-bold rounded-full`}
                        >
                          Visitante
                        </span>
                      )}
                      {isCurrent && !isMarked && (
                        <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Swipe Card Section - Separate scroll area */}
        <div className="flex-1 overflow-y-auto h-1/3 md:h-auto">
          <div className="p-5 h-full">
            <div className="max-w-2xl mx-auto w-full">
              {/* Compact Progress Indicator */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-white/90 text-xs font-medium">
                  {completedCount} / {students.length}
                </span>
                <div className="flex-1 bg-white/20 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Swipe Card */}
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
                    <span className="text-xs font-bold text-red-600">
                      Falta
                    </span>
                  </div>
                </div>

                {/* Right side indicator - Presente */}
                <div
                  className="absolute right-4 top-1/2 pointer-events-none z-10 transition-all duration-150"
                  style={{
                    opacity:
                      swipeOffset > 0
                        ? Math.min(1, 0.6 + swipeOffset / 200)
                        : 0.6,
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
                  <h2 className="text-gray-800 text-2xl font-bold mb-1 leading-tight">
                    {getShortName(currentStudent.name)}
                  </h2>
                  <p className="text-gray-500 text-xs">
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
                  className={`${theme.gradients.errorButton} ${theme.gradients.errorButtonHover} rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all p-5 group`}
                >
                  <div className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 inline-flex mb-3 group-hover:scale-110 transition-transform">
                      <XCircle className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white text-base font-bold">Falta</p>
                  </div>
                </button>

                <button
                  onClick={() => handleMark("P")}
                  className={`${theme.gradients.activeItem} hover:from-cyan-600 hover:to-cyan-700 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all p-5 group`}
                >
                  <div className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 inline-flex mb-3 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white text-base font-bold">Presente</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Dialog */}
      {visitorManagement.isVisitorDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div
                className={`w-16 h-16 ${theme.backgrounds.primaryLight} rounded-full flex items-center justify-center mx-auto mb-4`}
              >
                <UserPlus className={`w-8 h-8 ${theme.text.primary}`} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {visitorManagement.selectedVisitor
                  ? "Marcar Visitante"
                  : "Adicionar Visitante"}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {visitorManagement.selectedVisitor
                  ? "Este visitante já existe. Clique para marcar presente."
                  : "Procure por visitantes existentes ou adicione um novo. Será marcado como presente automaticamente."}
              </p>
            </div>

            <div className="space-y-4 mb-5">
              {/* Search Input */}
              <div className="relative">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Nome do Visitante
                </label>
                <div className="relative">
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.text.primary} w-4 h-4 z-10`}
                  />
                  <input
                    type="text"
                    value={visitorManagement.searchQuery}
                    onChange={(e) =>
                      visitorManagement.handleSearchChange(e.target.value)
                    }
                    placeholder="Procurar ou criar visitante..."
                    className={`w-full pl-10 pr-4 py-3 text-sm ${inputClasses}`}
                    autoFocus
                    disabled={visitorManagement.isAddingVisitor}
                  />
                </div>

                {/* Search Results Dropdown - Only show if there are results */}
                {visitorManagement.showResults &&
                  visitorManagement.searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      <ul className="py-1">
                        {visitorManagement.searchResults.map((visitor) => (
                          <li
                            key={visitor.id}
                            onClick={() =>
                              visitorManagement.handleSelectVisitor(visitor)
                            }
                            className="px-4 py-3 hover:bg-cyan-50 cursor-pointer transition-colors border-b last:border-b-0 border-gray-100"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-800">
                                {visitor.name}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${theme.gradients.badge}`}
                              >
                                Visitante
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Selected Visitor Card */}
                {visitorManagement.selectedVisitor && (
                  <div
                    className={`mt-3 p-3 ${theme.gradients.cardPrimary} rounded-xl border-2 ${theme.borders.success}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-bold text-gray-800">
                          {visitorManagement.selectedVisitor.name}
                        </span>
                      </div>
                      <button
                        onClick={visitorManagement.handleClearSelection}
                        className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {visitorManagement.error && (
                  <p className="text-red-500 text-xs mt-2">
                    {visitorManagement.error}
                  </p>
                )}
              </div>

              {/* Questions - Only show for new visitors */}
              {!visitorManagement.selectedVisitor && (
                <>
                  {/* Question 1: First time at church? */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Primeira vez na igreja?
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          visitorManagement.setFirstTimeAtChurch("yes")
                        }
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all ${
                          visitorManagement.firstTimeAtChurch === "yes"
                            ? `${theme.gradients.primaryButton} text-white border-transparent`
                            : `bg-white ${theme.borders.neutral} text-gray-700 hover:bg-gray-50`
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          visitorManagement.setFirstTimeAtChurch("no")
                        }
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all ${
                          visitorManagement.firstTimeAtChurch === "no"
                            ? `${theme.gradients.primaryButton} text-white border-transparent`
                            : `bg-white ${theme.borders.neutral} text-gray-700 hover:bg-gray-50`
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>

                  {/* Question 2: Will come regularly? */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Vai vir regularmente?
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          visitorManagement.setWillComeRegularly("yes")
                        }
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all ${
                          visitorManagement.willComeRegularly === "yes"
                            ? `${theme.gradients.primaryButton} text-white border-transparent`
                            : `bg-white ${theme.borders.neutral} text-gray-700 hover:bg-gray-50`
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          visitorManagement.setWillComeRegularly("no")
                        }
                        className={`flex-1 px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all ${
                          visitorManagement.willComeRegularly === "no"
                            ? `${theme.gradients.primaryButton} text-white border-transparent`
                            : `bg-white ${theme.borders.neutral} text-gray-700 hover:bg-gray-50`
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={visitorManagement.closeVisitorDialog}
                disabled={visitorManagement.isAddingVisitor}
                className={`flex-1 px-4 py-3 ${buttonClasses.secondary} text-sm`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddVisitor}
                disabled={
                  !visitorManagement.searchQuery.trim() ||
                  visitorManagement.isAddingVisitor
                }
                className={`flex-1 px-4 py-3 ${buttonClasses.primary} text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {visitorManagement.isAddingVisitor
                  ? "A processar..."
                  : visitorManagement.selectedVisitor
                    ? "Marcar Presente"
                    : "Adicionar Visitante"}
              </button>
            </div>
          </div>
        </div>
      )}

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

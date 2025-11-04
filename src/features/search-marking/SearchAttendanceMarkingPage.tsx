import { CheckCircle, Search, UserPlus } from "lucide-react";
import React from "react";
import { buttonClasses, inputClasses, theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import { CompletionScreen } from "../../components/features/CompletionScreen";
import { formatDate, getLessonName } from "../../utils/helperFunctions";
import type { SearchAttendanceMarkingPageProps } from "./SearchAttendanceMarkingPage.logic";
import { useSearchAttendanceMarkingLogic } from "./SearchAttendanceMarkingPage.logic";

export const SearchAttendanceMarkingPage: React.FC<
  SearchAttendanceMarkingPageProps
> = ({
  students,
  visitorStudents,
  date,
  lessonNames,
  onComplete,
  onCancel,
}) => {
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
    visitorManagement,
    handleMarkPresent,
    handleUnmark,
    handleComplete,
    handleConfirmComplete,
    handleGoBack,
    handleAddVisitor,
    handleConfirmLeave,
    handleCancelLeave,
  } = useSearchAttendanceMarkingLogic({
    students,
    visitorStudents,
    onComplete,
  });

  if (isComplete) {
    const absentCount = totalCount - presentCount;

    return (
      <CompletionScreen
        lessonName={getLessonName(date, lessonNames)}
        presentCount={presentCount}
        absentCount={absentCount}
        onConfirm={handleConfirmComplete}
        onGoBack={handleGoBack}
      />
    );
  }

  return (
    <div className={`h-screen flex flex-col ${theme.gradients.background} text-white overflow-hidden`}>
      {/* Header Section */}
      <PageHeader
        onBack={onCancel}
        title={formatDate(date)}
        subtitle={getLessonName(date, lessonNames)}
        sticky={false}
        className="flex-shrink-0"
      />

      {/* Main Content Area - Fixed at top with scrollable list below */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Search Bar and Visitor Button - Fixed at top */}
        <div className="flex-shrink-0 p-5 pb-3">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-4 h-4" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Procurar pelo nome..."
              className="w-full pl-10 pr-16 py-3 rounded-xl text-sm bg-white/10 text-white placeholder-white/60 border border-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              autoFocus
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white font-bold text-sm">
              {presentCount}/{totalCount} presentes
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={visitorManagement.openVisitorDialog}
              className="flex-1 px-5 py-3 bg-white text-cyan-600 rounded-xl text-sm font-medium hover:bg-white/90 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Adicionar Visitante</span>
            </button>
            <button
              onClick={handleComplete}
              className="px-5 py-3 bg-white/20 text-white rounded-xl text-sm font-medium hover:bg-white/30 transition-all shadow-lg flex items-center justify-center gap-2 backdrop-blur-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Concluir</span>
            </button>
          </div>
        </div>

        {/* Scrollable Student List - Takes remaining space */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-2">
            {displayedStudents.length === 0 && searchQuery.trim() !== "" ? (
              <div className="text-center py-8 text-white/80">
                Nenhum pré encontrado
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
                    className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-all duration-200 shadow-sm ${
                      isMarked
                        ? `${theme.gradients.cardPrimary} border-2 ${theme.borders.success} opacity-60 hover:shadow-md cursor-pointer`
                        : `bg-white border-2 ${theme.borders.neutralLight}/60 ${theme.borders.primaryHover} hover:shadow-lg active:scale-98 transition-all`
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isMarked && (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${theme.gradients.activeItem}`}
                        >
                          <span className="text-white font-bold text-xs">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              isMarked
                                ? theme.text.primaryDarker
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
                        </div>
                      </div>
                    </div>
                    {isMarked && (
                      <div
                        className={`${theme.backgrounds.primaryLight} rounded-full p-0.5`}
                      >
                        <CheckCircle
                          className={`w-4 h-4 ${theme.text.primary}`}
                        />
                      </div>
                    )}
                  </button>
                );
              })
            )}
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
              <h3 className="text-base font-bold text-gray-800 mb-2">
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
                            className="px-4 py-3 hover:bg-cyan-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-800">
                                {visitor.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 ${theme.gradients.badge} text-white text-xs font-bold rounded-full`}
                              >
                                Visitante
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {visitorManagement.error && (
                  <p className="text-red-500 text-xs mt-2">
                    {visitorManagement.error}
                  </p>
                )}
              </div>

              {/* Selected Visitor Card */}
              {visitorManagement.selectedVisitor && (
                <div
                  className={`p-3 ${theme.gradients.cardPrimary} rounded-xl border-2 ${theme.borders.success}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`w-5 h-5 ${theme.text.primary}`}
                      />
                      <span className="text-sm font-bold text-gray-800">
                        {visitorManagement.selectedVisitor.name}
                      </span>
                    </div>
                    <button
                      onClick={visitorManagement.handleClearSelection}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label="Limpar seleção"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

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
                        className={`flex-1 px-5 py-3 text-sm font-bold rounded-xl border-2 transition-all ${
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
                        className={`flex-1 px-5 py-3 text-sm font-bold rounded-xl border-2 transition-all ${
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
                        className={`flex-1 px-5 py-3 text-sm font-bold rounded-xl border-2 transition-all ${
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
                        className={`flex-1 px-5 py-3 text-sm font-bold rounded-xl border-2 transition-all ${
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
                className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddVisitor}
                disabled={
                  !visitorManagement.searchQuery.trim() ||
                  visitorManagement.isAddingVisitor
                }
                className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
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
                className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
              >
                Continuar a Marcar
              </button>
              <button
                onClick={handleConfirmLeave}
                className={`flex-1 px-5 py-3 ${buttonClasses.danger} text-sm`}
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

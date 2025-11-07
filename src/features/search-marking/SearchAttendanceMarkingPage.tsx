import { CheckCircle, Search, UserPlus } from "lucide-react";
import React from "react";
import { theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import { CompletionScreen } from "../../components/features/CompletionScreen";
import { VisitorDialog } from "../../components/features/VisitorDialog";
import { UnsavedChangesDialog } from "../../components/features/UnsavedChangesDialog";
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
    isLoading,
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
        isLoading={isLoading}
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
      <VisitorDialog
        visitorManagement={visitorManagement}
        onAddVisitor={handleAddVisitor}
      />

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={blockerStatus === "blocked"}
        onContinue={handleCancelLeave}
        onLeave={handleConfirmLeave}
      />
    </div>
  );
};

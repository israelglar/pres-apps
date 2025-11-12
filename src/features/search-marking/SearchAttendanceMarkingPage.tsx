import { AlertTriangle, CheckCircle, Search, UserPlus, X } from "lucide-react";
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
  serviceTimeId,
  serviceTimes,
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
    absenceAlerts,
    dismissAbsenceAlert,
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
    date,
    onComplete,
  });

  if (isComplete) {
    // Count visitors who are marked present - check if student is in visitorStudents array
    const visitorsCount = Object.values(attendanceRecords).filter(
      (r) => r.status === "P" && visitorStudents.some(v => v.id === r.studentId)
    ).length;

    // Count only regular students present (excluding visitors)
    const regularPresentCount = presentCount - visitorsCount;

    return (
      <CompletionScreen
        lessonName={getLessonName(date, lessonNames)}
        presentCount={regularPresentCount}
        visitorsCount={visitorsCount}
        onConfirm={handleConfirmComplete}
        onGoBack={handleGoBack}
        isLoading={isLoading}
      />
    );
  }

  // Format title with service time
  const serviceTime = serviceTimes.find(st => st.id === serviceTimeId);
  const timeFormatted = serviceTime?.time.slice(0, 5); // Remove seconds (hh:mm:ss -> hh:mm)
  const titleWithTime = timeFormatted
    ? `${formatDate(date)} - ${timeFormatted}`
    : formatDate(date);

  return (
    <div className={`h-screen flex flex-col ${theme.solids.background} ${theme.text.onPrimary} overflow-hidden`}>
      {/* Header Section */}
      <PageHeader
        onBack={onCancel}
        title={titleWithTime}
        subtitle={getLessonName(date, lessonNames)}
        sticky={false}
        className="flex-shrink-0"
      />

      {/* Main Content Area - Fixed at top with scrollable list below */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Search Bar and Visitor Button - Fixed at top */}
        <div className="flex-shrink-0 p-5 pb-3">
          <div className="relative mb-4">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.text.onPrimary} w-4 h-4`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Procurar pelo nome..."
              className={`w-full pl-10 pr-16 py-3 rounded-xl text-sm bg-white/10 ${theme.text.onPrimary} placeholder-white/60 border border-white/20 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all`}
              autoFocus
            />
            <span className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.text.onPrimary} font-bold text-sm`}>
              {presentCount}/{totalCount} presentes
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={visitorManagement.openVisitorDialog}
              className={`flex-1 px-5 py-3 ${theme.backgrounds.white} ${theme.text.primary} rounded-xl text-sm font-medium ${theme.backgrounds.whiteTransparent90} transition-all shadow-lg flex items-center justify-center gap-2`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Adicionar Visitante</span>
            </button>
            <button
              onClick={handleComplete}
              className={`px-5 py-3 ${theme.backgrounds.whiteTransparent} ${theme.text.white} rounded-xl text-sm font-medium ${theme.backgrounds.whiteHover} transition-all shadow-lg flex items-center justify-center gap-2 backdrop-blur-sm`}
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
              <div className={`text-center py-8 ${theme.text.onPrimary}/80`}>
                Nenhum pré encontrado
              </div>
            ) : (
              displayedStudents.map((student) => {
                const isMarked = !!attendanceRecords[student.id];
                const studentIdNumber = parseInt(student.id);
                const alert = absenceAlerts.get(studentIdNumber);

                return (
                  <div key={student.id}>
                    <div className="relative">
                      <button
                        onClick={() => {
                          if (isMarked) {
                            handleUnmark(student.id);
                          } else {
                            handleMarkPresent(student);
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-all duration-200 shadow-sm ${
                          isMarked
                            ? `${theme.solids.cardPrimary} border-2 ${theme.borders.success} opacity-60 hover:shadow-md cursor-pointer`
                            : `bg-white border-2 ${theme.borders.neutralLight}/60 ${theme.borders.primaryHover} hover:shadow-lg active:scale-98 transition-all`
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isMarked && (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${theme.solids.activeItem}`}
                            >
                              <span className={`${theme.text.onPrimary} font-bold text-xs`}>
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
                                  className={`px-1.5 py-0.5 ${theme.solids.badge} ${theme.text.onPrimary} text-xs font-bold rounded-full`}
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

                      {/* Absence Alert Overlay - Semi-transparent overlay that blocks clicks */}
                      {alert && !isMarked && (
                        <div
                          className={`absolute inset-0 flex items-center justify-end px-3 ${theme.backgrounds.warningLight} rounded-xl z-10`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className={`flex items-center gap-2 ${theme.backgrounds.warning} border-l-4 ${theme.borders.success} rounded-lg px-3 py-1.5 shadow-lg`}>
                            <AlertTriangle className={`w-4 h-4 ${theme.text.warning} flex-shrink-0`} />
                            <span className={`text-xs ${theme.text.warning} font-semibold whitespace-nowrap`}>
                              Ausente há {alert.absenceCount} {alert.absenceCount === 1 ? 'domingo' : 'domingos'}
                            </span>
                            <button
                              onClick={() => dismissAbsenceAlert(studentIdNumber)}
                              className={`ml-1 p-0.5 rounded ${theme.backgrounds.whiteHover} transition-colors`}
                              aria-label="Dispensar alerta"
                            >
                              <X className={`w-4 h-4 ${theme.text.warning}`} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
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

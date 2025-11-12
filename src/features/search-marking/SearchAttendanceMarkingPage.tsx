import { AlertTriangle, Check, CheckCircle, UserPlus, X } from "lucide-react";
import React from "react";
import { theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header Section */}
      <PageHeader
        onBack={onCancel}
        title={titleWithTime}
        subtitle={getLessonName(date, lessonNames)}
        sticky={true}
        className="flex-shrink-0"
        rightAction={{
          icon: <Check className="w-5 h-5" />,
          label: "",
          onClick: handleComplete,
        }}
      />

      {/* Main Content Area - Fixed at top with scrollable list below */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Search Bar - Fixed at top */}
        <div className="flex-shrink-0 p-5 pb-3">
          <SearchBar
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Procurar pelo nome..."
            autoFocus
            rightContent={
              <div className="flex items-center gap-3">
                <span className={`${theme.text.primary} font-bold text-sm whitespace-nowrap`}>
                  {presentCount}/{totalCount}
                </span>
                <button
                  onClick={visitorManagement.openVisitorDialog}
                  className={`${theme.text.primary} hover:opacity-70 transition-opacity`}
                  aria-label="Adicionar visitante"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>
            }
          />
        </div>

        {/* Scrollable Student List - Takes remaining space */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-2">
            {displayedStudents.length === 0 && searchQuery.trim() !== "" ? (
              <div className={`text-center py-8 ${theme.text.neutral}`}>
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
                        className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between transition-all duration-200 ${
                          isMarked
                            ? `${theme.backgrounds.success} border-2 ${theme.borders.success} opacity-70 hover:opacity-80 hover:shadow-md cursor-pointer shadow-sm`
                            : `${theme.backgrounds.white} border-2 ${theme.borders.primaryLight} ${theme.borders.primaryHover} hover:shadow-md active:scale-98 transition-all shadow-sm`
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-semibold ${
                                  isMarked
                                    ? 'text-green-800'
                                    : theme.text.primary
                                }`}
                              >
                                {student.name}
                              </span>
                              {student.isVisitor && (
                                <span
                                  className={`px-1.5 py-0.5 ${theme.solids.badge} ${theme.text.onPrimaryButton} text-xs font-bold rounded-full`}
                                >
                                  Visitante
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {isMarked && (
                          <div
                            className="bg-white rounded-full p-0.5"
                          >
                            <CheckCircle
                              className="w-4 h-4 text-green-600"
                            />
                          </div>
                        )}
                      </button>

                      {/* Absence Alert Overlay - Semi-transparent overlay that blocks clicks */}
                      {alert && !isMarked && (
                        <div
                          className="absolute inset-0 flex items-center justify-end px-3 bg-amber-50/40 rounded-xl z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-700 rounded-lg px-3 py-1.5 shadow-lg">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-semibold whitespace-nowrap">
                              Ausente há {alert.absenceCount} {alert.absenceCount === 1 ? 'domingo' : 'domingos'}
                            </span>
                            <button
                              onClick={() => dismissAbsenceAlert(studentIdNumber)}
                              className="ml-1 p-0.5 rounded text-amber-700/80 hover:text-amber-900 hover:bg-white/20 transition-colors"
                              aria-label="Dispensar alerta"
                            >
                              <X className="w-4 h-4" />
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

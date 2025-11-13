import { Check, UserPlus } from "lucide-react";
import React from "react";
import { theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
import { CompletionScreen } from "../../components/features/CompletionScreen";
import { VisitorDialog } from "../../components/features/VisitorDialog";
import { UnsavedChangesDialog } from "../../components/features/UnsavedChangesDialog";
import { StudentList } from "../../components/features/StudentList";
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
    handleUpdateNote,
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
    <div className={`h-screen flex flex-col ${theme.backgrounds.page} overflow-hidden`}>
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
        <StudentList
          students={displayedStudents}
          attendanceRecords={attendanceRecords}
          absenceAlerts={absenceAlerts}
          emptyMessage={searchQuery.trim() !== "" ? "Nenhum pré encontrado" : undefined}
          onStudentClick={(student, isMarked) => {
            if (isMarked) {
              handleUnmark(student.id);
            } else {
              handleMarkPresent(student);
            }
          }}
          onDismissAlert={dismissAbsenceAlert}
          onUpdateNote={handleUpdateNote}
        />
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

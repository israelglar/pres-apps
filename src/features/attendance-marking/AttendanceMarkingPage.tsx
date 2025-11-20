import { CheckCircle, UserPlus, XCircle } from "lucide-react";
import { ATTENDANCE } from "../../config/constants";
import { theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import { CompletionScreen } from "../../components/features/CompletionScreen";
import { VisitorDialog } from "../../components/features/VisitorDialog";
import { UnsavedChangesDialog } from "../../components/features/UnsavedChangesDialog";
import { AbsenceAlertBanner } from "../../components/features/AbsenceAlertBanner";
import { StudentList } from "../../components/features/StudentList";
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
  serviceTimeId,
  serviceTimes,
  lessonNames,
  onComplete,
  onCancel,
}: AttendanceMarkingPageProps) => {
  const {
    attendanceRecords,
    isComplete,
    isLoading,
    studentRefs,
    swipeOffset,
    isAnimatingSwipe,
    currentStudent,
    completedCount,
    progress,
    blockerStatus,
    allStudents,
    visitorManagement,
    absenceAlerts,
    dismissAbsenceAlert,
    handleMark,
    handleClickHistory,
    handleUpdateNote,
    handleConfirmLeave,
    handleCancelLeave,
    handleAddVisitor,
    handleComplete,
    handleGoBack,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  } = useAttendanceMarkingLogic({ students, visitorStudents, selectedDate, onComplete });

  if (isComplete) {
    // Count visitors who are marked present - check if student is in visitorStudents array
    const visitorsCount = Object.values(attendanceRecords).filter(
      (r) => r.status === ATTENDANCE.STATUS.PRESENT && visitorStudents.some(v => v.id === r.studentId)
    ).length;

    // Count only regular students present (excluding visitors)
    const presentCount = Object.values(attendanceRecords).filter(
      (r) => r.status === ATTENDANCE.STATUS.PRESENT && !visitorStudents.some(v => v.id === r.studentId)
    ).length;

    // Build list of present students for display
    const presentStudentsList = Object.values(attendanceRecords)
      .filter((r) => r.status === ATTENDANCE.STATUS.PRESENT)
      .map((record) => {
        const student = [...students, ...visitorStudents].find(s => s.id === record.studentId);
        return {
          name: student?.name || "Desconhecido",
          isVisitor: visitorStudents.some(v => v.id === record.studentId),
        };
      })
      .sort((a, b) => {
        // Sort: regular students first, then visitors
        if (a.isVisitor !== b.isVisitor) {
          return a.isVisitor ? 1 : -1;
        }
        // Within same group, sort alphabetically
        return a.name.localeCompare(b.name, "pt-PT");
      });

    return (
      <CompletionScreen
        lessonName={getLessonName(selectedDate, lessonNames)}
        presentCount={presentCount}
        visitorsCount={visitorsCount}
        presentStudents={presentStudentsList}
        onConfirm={handleComplete}
        onGoBack={handleGoBack}
        isLoading={isLoading}
      />
    );
  }

  // Format title with service time
  const serviceTime = serviceTimes.find(st => st.id === serviceTimeId);
  const timeFormatted = serviceTime?.time.slice(0, 5); // Remove seconds (hh:mm:ss -> hh:mm)
  const titleWithTime = timeFormatted
    ? `${formatDate(selectedDate)} - ${timeFormatted}`
    : formatDate(selectedDate);

  return (
    <div className={`h-screen flex flex-col ${theme.backgrounds.page} overflow-hidden`}>
      {/* Header Section */}
      <PageHeader
        onBack={onCancel || (() => {})}
        title={titleWithTime}
        subtitle={getLessonName(selectedDate, lessonNames)}
        sticky={false}
        className="flex-shrink-0"
      />

      {/* Main Content Area - Takes remaining height */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Student List Section */}
        <div className="flex flex-col h-2/3 md:h-auto md:w-80 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-white/20">
          {/* Visitor Button - Fixed at top */}
          <div className="flex-shrink-0 p-5 pb-3">
            <button
              onClick={visitorManagement.openVisitorDialog}
              className={`w-full px-5 py-3 ${theme.backgrounds.white} ${theme.text.primary} rounded-xl text-sm font-medium border ${theme.borders.primary} hover:shadow-md transition-all flex items-center justify-center gap-2`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Adicionar Visitante</span>
            </button>
          </div>

          {/* Scrollable Student List - Takes remaining space */}
          <StudentList
            students={allStudents}
            attendanceRecords={attendanceRecords}
            absenceAlerts={absenceAlerts}
            currentStudentId={currentStudent.id}
            onStudentClick={(student, isMarked) => {
              if (isMarked) {
                handleClickHistory(student.id);
              }
            }}
            onDismissAlert={dismissAbsenceAlert}
            studentRefs={studentRefs}
            onUpdateNote={handleUpdateNote}
          />
        </div>

        {/* Swipe Card Section - Separate scroll area */}
        <div className="flex-1 overflow-y-auto h-1/3 md:h-auto">
          <div className="p-5 pb-8 min-h-full">
            <div className="max-w-2xl mx-auto w-full">
              {/* Compact Progress Indicator */}
              <div className="flex items-center gap-2 mb-5">
                <span className={`${theme.text.neutral} text-xs font-medium`}>
                  {completedCount} / {students.length}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${theme.solids.primaryButton} h-full transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Swipe Card */}
              {(() => {
                const currentStudentIdNumber = parseInt(currentStudent.id);
                const hasAlert = absenceAlerts.has(currentStudentIdNumber);

                return (
                  <div
                    className={`${theme.backgrounds.primaryLighter} rounded-3xl shadow-2xl mb-6 relative overflow-hidden p-8 border ${theme.borders.primaryLight}`}
                    onTouchStart={hasAlert ? undefined : onTouchStart}
                    onTouchMove={hasAlert ? undefined : onTouchMove}
                    onTouchEnd={hasAlert ? undefined : onTouchEnd}
                  >
                    {/* Transparent overlay when alert is shown - blocks all interactions */}
                    {hasAlert && (
                      <div
                        className="absolute inset-0 bg-black/10 backdrop-blur-[2px] rounded-3xl z-40"
                        onTouchStart={(e) => e.preventDefault()}
                        onTouchMove={(e) => e.preventDefault()}
                        onTouchEnd={(e) => e.preventDefault()}
                      />
                    )}

                {/* Always visible gradient backgrounds */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1/3 pointer-events-none rounded-l-3xl z-0"
                  style={{
                    background:
                      "linear-gradient(to right, rgba(220, 38, 38, 0.08), transparent)",
                  }}
                />
                <div
                  className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none rounded-r-3xl z-0"
                  style={{
                    background:
                      "linear-gradient(to left, rgba(34, 197, 94, 0.08), transparent)",
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
                    <XCircle className={`w-8 h-8 ${theme.status.absent.text}`} />
                    <span className={`text-xs font-bold ${theme.status.absent.text}`}>
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
                    <CheckCircle className={`w-8 h-8 ${theme.text.success}`} />
                    <span className={`text-xs font-bold ${theme.text.success}`}>
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
                          ? "linear-gradient(to right, transparent, rgba(34, 197, 94, 0.15))"
                          : "linear-gradient(to left, transparent, rgba(220, 38, 38, 0.15))",
                      opacity: Math.abs(swipeOffset) / 150,
                    }}
                  />
                )}

                {/* Center - Student info */}
                <div
                  className={`text-center relative z-10 pointer-events-none`}
                  style={{
                    transform: `translateX(${swipeOffset}px)`,
                    transition: isAnimatingSwipe
                      ? "transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)"
                      : "transform 0ms",
                  }}
                >
                  <h2 className={`${theme.text.neutralDarker} text-2xl font-bold mb-1 leading-tight`}>
                    {getShortName(currentStudent.name)}
                  </h2>
                </div>

                {/* Absence Alert - Floating at bottom */}
                {(() => {
                  const currentStudentIdNumber = parseInt(currentStudent.id);
                  const alert = absenceAlerts.get(currentStudentIdNumber);
                  return alert ? (
                    <div className="absolute bottom-4 left-4 right-4 z-50">
                      <AbsenceAlertBanner
                        absenceCount={alert.absenceCount}
                        onDismiss={() => dismissAbsenceAlert(currentStudentIdNumber)}
                        className="shadow-lg"
                      />
                    </div>
                  ) : null;
                })()}

                {/* Clickable areas overlaid */}
                {!hasAlert && (
                  <>
                    <button
                      onClick={() => handleMark(ATTENDANCE.STATUS.ABSENT)}
                      className="click-area-button left-button absolute left-0 top-0 bottom-0 w-1/3 active:bg-red-200/40 transition-colors rounded-l-3xl z-20 touch-none"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(220, 38, 38, 0), transparent)",
                      }}
                      onPointerDown={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to right, rgba(220, 38, 38, 0.25), transparent)";
                      }}
                      onPointerUp={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to right, rgba(220, 38, 38, 0), transparent)";
                      }}
                      onPointerLeave={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to right, rgba(220, 38, 38, 0), transparent)";
                      }}
                    />
                    <button
                      onClick={() => handleMark(ATTENDANCE.STATUS.PRESENT)}
                      className="click-area-button right-button absolute right-0 top-0 bottom-0 w-1/3 active:bg-green-200/40 transition-colors rounded-r-3xl z-20 touch-none"
                      style={{
                        background:
                          "linear-gradient(to left, rgba(34, 197, 94, 0), transparent)",
                      }}
                      onPointerDown={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to left, rgba(34, 197, 94, 0.25), transparent)";
                      }}
                      onPointerUp={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to left, rgba(34, 197, 94, 0), transparent)";
                      }}
                      onPointerLeave={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to left, rgba(34, 197, 94, 0), transparent)";
                      }}
                    />
                  </>
                )}
              </div>
                );
              })()}

              <div className="hidden md:grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleMark(ATTENDANCE.STATUS.ABSENT)}
                  className={`${theme.solids.errorButton} ${theme.solids.errorButtonHover} rounded-2xl shadow-lg hover:shadow-xl transition-all p-5 group`}
                >
                  <div className="text-center">
                    <div className={`${theme.backgrounds.whiteTransparent} backdrop-blur-sm rounded-full p-2 inline-flex mb-3 group-hover:scale-110 transition-transform`}>
                      <XCircle className={`w-8 h-8 ${theme.text.white}`} />
                    </div>
                    <p className={`${theme.text.white} text-base font-bold`}>Falta</p>
                  </div>
                </button>

                <button
                  onClick={() => handleMark(ATTENDANCE.STATUS.PRESENT)}
                  className={`${theme.solids.activeItem} ${theme.solids.primaryButtonHover} rounded-2xl shadow-lg hover:shadow-xl transition-all p-5 group`}
                >
                  <div className="text-center">
                    <div className={`${theme.backgrounds.whiteTransparent} backdrop-blur-sm rounded-full p-2 inline-flex mb-3 group-hover:scale-110 transition-transform`}>
                      <CheckCircle className={`w-8 h-8 ${theme.text.white}`} />
                    </div>
                    <p className={`${theme.text.white} text-base font-bold`}>Presente</p>
                  </div>
                </button>
              </div>
            </div>
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

import { AlertTriangle, CheckCircle, UserPlus, XCircle } from "lucide-react";
import { theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import { CompletionScreen } from "../../components/features/CompletionScreen";
import { VisitorDialog } from "../../components/features/VisitorDialog";
import { UnsavedChangesDialog } from "../../components/features/UnsavedChangesDialog";
import { AbsenceAlertBanner } from "../../components/features/AbsenceAlertBanner";
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
    currentIndex,
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
    visitorManagement,
    absenceAlerts,
    dismissAbsenceAlert,
    handleMark,
    handleClickHistory,
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
      (r) => r.status === "P" && visitorStudents.some(v => v.id === r.studentId)
    ).length;

    // Count only regular students present (excluding visitors)
    const presentCount = Object.values(attendanceRecords).filter(
      (r) => r.status === "P" && !visitorStudents.some(v => v.id === r.studentId)
    ).length;

    return (
      <CompletionScreen
        lessonName={getLessonName(selectedDate, lessonNames)}
        presentCount={presentCount}
        visitorsCount={visitorsCount}
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
    <div className={`h-screen flex flex-col ${theme.gradients.background} text-white overflow-hidden`}>
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
              className={`w-full px-5 py-3 ${theme.backgrounds.white} ${theme.text.primary} rounded-xl text-sm font-medium ${theme.backgrounds.whiteTransparent90} transition-all shadow-lg flex items-center justify-center gap-2`}
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
                const studentIdNumber = parseInt(student.id);
                const alert = absenceAlerts.get(studentIdNumber);
                const hasAlert = !!alert && !isMarked;

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
                              : theme.status.absent.text
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
                      {hasAlert && (
                        <AlertTriangle className={`w-3 h-3 ${theme.text.warning}`} />
                      )}
                      {isCurrent && !isMarked && (
                        <span className={`ml-1 w-2 h-2 ${theme.backgrounds.secondary} rounded-full animate-pulse`} />
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
                          ? "linear-gradient(to right, transparent, rgba(16, 185, 129, 0.2))"
                          : "linear-gradient(to left, transparent, rgba(239, 68, 68, 0.2))",
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
                  <p className={`${theme.text.neutralMedium} text-xs mb-2`}>
                    Toque nos lados ou deslize
                  </p>

                  {/* Absence Alert */}
                  {(() => {
                    const currentStudentIdNumber = parseInt(currentStudent.id);
                    const alert = absenceAlerts.get(currentStudentIdNumber);
                    return alert ? (
                      <div className="pointer-events-auto inline-block mt-2">
                        <AbsenceAlertBanner
                          absenceCount={alert.absenceCount}
                          onDismiss={() => dismissAbsenceAlert(currentStudentIdNumber)}
                          className="text-left"
                        />
                      </div>
                    ) : null;
                  })()}
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
                  className="click-area-button right-button absolute right-0 top-0 bottom-0 w-1/3 active:bg-green-200/60 transition-colors rounded-r-3xl z-20 touch-none"
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
                    <div className={`${theme.backgrounds.whiteTransparent} backdrop-blur-sm rounded-full p-2 inline-flex mb-3 group-hover:scale-110 transition-transform`}>
                      <XCircle className={`w-8 h-8 ${theme.text.white}`} />
                    </div>
                    <p className={`${theme.text.white} text-base font-bold`}>Falta</p>
                  </div>
                </button>

                <button
                  onClick={() => handleMark("P")}
                  className={`${theme.gradients.activeItem} hover:from-cyan-600 hover:to-cyan-700 rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all p-5 group`}
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

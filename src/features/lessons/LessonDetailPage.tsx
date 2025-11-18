import {
  Calendar,
  ExternalLink,
  Loader2,
  RotateCcw,
  UserPlus,
  Users,
} from "lucide-react";
import { AttendanceStats } from "../../components/AttendanceStats";
import { TeacherList } from "../../components/features/TeacherList";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageHeader } from "../../components/ui/PageHeader";
import { theme } from "../../config/theme";
import { useLessonDetailLogic } from "./LessonDetailPage.logic";
import { AddStudentDialog } from "./components/AddStudentDialog";
import { CreateVisitorDialog } from "./components/CreateVisitorDialog";
import { DeleteAttendanceDialog } from "./components/DeleteAttendanceDialog";
import { NotesDialog } from "./components/NotesDialog";
import { StatusGroupSeparator } from "./components/StatusGroupSeparator";
import { StudentAttendanceRow } from "./components/StudentAttendanceRow";
import { TeacherAssignmentDialog } from "./components/TeacherAssignmentDialog";

interface LessonDetailPageProps {
  date: string;
  initialServiceTimeId?: number;
  onBack: () => void;
  onViewStudent?: (studentId: number) => void;
  onRedoAttendance: (scheduleDate: string, serviceTimeId: number) => void;
}

/**
 * Lesson Detail Page
 * Shows detailed attendance for a specific date with all service times
 */
export function LessonDetailPage({
  date,
  initialServiceTimeId,
  onBack,
  onViewStudent,
  onRedoAttendance,
}: LessonDetailPageProps) {
  const {
    dateGroup,
    isLoading,
    error,
    isEditing,
    isNotesDialogOpen,
    selectedRecordForNotes,
    isAddDialogOpen,
    addDialogScheduleId,
    addDialogServiceTimeId,
    isAdding,
    isDeleteDialogOpen,
    recordToDelete,
    isDeleting,
    isCreateVisitorDialogOpen,
    isCreatingVisitor,
    visitorInitialName,
    isTeacherAssignmentDialogOpen,
    selectedServiceTimeIndex,
    handleQuickStatusChange,
    handleOpenNotes,
    handleCloseNotes,
    handleSubmitNotes,
    handleOpenAddDialog,
    handleCloseAddDialog,
    handleAddStudent,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    handleOpenCreateVisitorDialog,
    handleCloseCreateVisitorDialog,
    handleCreateVisitor,
    handleOpenTeacherAssignmentDialog,
    handleCloseTeacherAssignmentDialog,
    handleTeacherAssignmentSuccess,
    handleViewStudent,
    handleRedoAttendance,
    handleServiceTimeChange,
  } = useLessonDetailLogic(
    date,
    initialServiceTimeId,
    onViewStudent,
    onRedoAttendance,
  );

  // Format date for display (short format: "10 nov 2025")
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const monthNames = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Parse date string as local date (avoid timezone issues)
  const parseLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Check if date is today
  const isToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = parseLocalDate(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  // Check if date is in the future
  const isFutureLesson = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = parseLocalDate(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() > today.getTime();
  };

  const lessonIsFuture = isFutureLesson();

  // Check if date is the most recent past Sunday (Domingo Passado)
  const isPreviousSunday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = parseLocalDate(date);
    checkDate.setHours(0, 0, 0, 0);

    // Must be in the past (not today)
    if (checkDate.getTime() >= today.getTime()) return false;

    // Check if it's a Sunday
    if (checkDate.getDay() !== 0) return false;

    // Find the most recent past Sunday
    const daysToSubtract = today.getDay() === 0 ? 7 : today.getDay();
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - daysToSubtract);
    lastSunday.setHours(0, 0, 0, 0);

    return checkDate.getTime() === lastSunday.getTime();
  };

  // Get date label (Hoje or Domingo Passado)
  const getDateLabel = () => {
    if (isToday()) return "Hoje";
    if (isPreviousSunday()) return "Domingo Passado";
    return null;
  };

  const dateLabel = getDateLabel();
  const formattedDate = formatDate(date);

  return (
    <div className={`fixed inset-0 ${theme.backgrounds.page} overflow-y-auto`}>
      {/* Header */}
      <PageHeader onBack={onBack} sticky={true} variant="minimal" />

      <div className="max-w-4xl mx-auto p-3 pb-20">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2
              className={`w-12 h-12 ${theme.text.primary} animate-spin mb-3`}
            />
            <p className={`${theme.text.neutralDarker} text-sm font-semibold`}>
              A carregar lição...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className={`${theme.backgrounds.error} border-2 ${theme.borders.error} rounded-2xl p-5 text-center`}
          >
            <p className={`${theme.text.error} font-semibold mb-2 text-sm`}>
              Erro ao carregar lição
            </p>
            <p className={`${theme.text.error} text-xs mb-4`}>
              {error.toString()}
            </p>
          </div>
        )}

        {/* Content */}
        {dateGroup && (
          <div className="space-y-3">
            {/* Header Card with Stats */}
            <div className="bg-white rounded-2xl shadow-md p-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`${theme.text.onLightSecondary} text-xs`}>
                    {formattedDate}
                  </span>
                  {dateLabel && (
                    <span
                      className={`px-2 py-0.5 text-xs font-bold ${theme.solids.badge} ${theme.text.onPrimary} rounded-full`}
                    >
                      {dateLabel}
                    </span>
                  )}
                </div>
                <h2 className={`text-lg font-bold ${theme.text.onLight} mb-2`}>
                  {dateGroup.serviceTimes[0]?.schedule.lesson?.name ||
                    "Sem lição"}
                </h2>

                {/* Teacher Assignments */}
                {dateGroup.serviceTimes[selectedServiceTimeIndex]?.schedule && (
                  <div className="mb-2 flex items-center gap-2">
                    <TeacherList
                      assignments={
                        dateGroup.serviceTimes[selectedServiceTimeIndex]
                          .schedule.assignments
                      }
                    />
                    <button
                      onClick={handleOpenTeacherAssignmentDialog}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${theme.backgrounds.neutralLight} ${theme.text.neutral} hover:${theme.backgrounds.primaryLight} hover:${theme.text.primary} transition-colors`}
                      title="Gerir Professores"
                    >
                      <Users className="w-3 h-3" />
                      Gerir
                    </button>
                  </div>
                )}

                {/* Lesson Link */}
                {dateGroup.serviceTimes[0]?.schedule.lesson?.resource_url && (
                  <a
                    href={
                      dateGroup.serviceTimes[0].schedule.lesson.resource_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs ${theme.text.primary} hover:underline transition-colors`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver currículo
                  </a>
                )}
              </div>

              {/* Statistics and Actions - Only show for single service time or selected service time */}
              {dateGroup.serviceTimes[selectedServiceTimeIndex] &&
                (() => {
                  const serviceTimeData =
                    dateGroup.serviceTimes[selectedServiceTimeIndex];
                  const timeFormatted =
                    serviceTimeData.schedule.service_time?.time.slice(0, 5) ||
                    "N/A";

                  return (
                    <>
                      {/* Service Time Label and Stats */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span
                          className={`${theme.text.primary} font-bold text-sm`}
                        >
                          {dateGroup.serviceTimes.length === 1
                            ? timeFormatted
                            : "Presenças"}
                        </span>
                        <AttendanceStats
                          stats={serviceTimeData.stats}
                          mode="inline"
                          showAbsent={true}
                          showTotalPresent={true}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            !lessonIsFuture &&
                            handleOpenAddDialog(
                              serviceTimeData.schedule.id,
                              serviceTimeData.schedule.service_time_id,
                            )
                          }
                          disabled={lessonIsFuture}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 ${
                            lessonIsFuture
                              ? `${theme.backgrounds.neutralLight} ${theme.text.neutral} cursor-not-allowed opacity-50`
                              : `${theme.solids.primaryButton} ${theme.text.onPrimaryButton} hover:shadow-md active:scale-[0.99]`
                          } rounded-lg text-xs font-medium transition-all`}
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Adicionar Pré
                        </button>
                        <button
                          onClick={() =>
                            !lessonIsFuture &&
                            handleRedoAttendance(serviceTimeData.schedule.id)
                          }
                          disabled={lessonIsFuture}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 ${
                            lessonIsFuture
                              ? `${theme.backgrounds.neutralLight} ${theme.text.neutral} cursor-not-allowed opacity-50`
                              : `${theme.backgrounds.white} ${theme.text.primary} border-2 ${theme.borders.primary} hover:${theme.backgrounds.primaryLight} active:scale-[0.99]`
                          } rounded-lg text-xs font-medium transition-all`}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Refazer
                        </button>
                      </div>
                    </>
                  );
                })()}
            </div>

            {/* Service Time Tabs - Only show if there are multiple service times */}
            {dateGroup.serviceTimes.length > 1 && (
              <div className="bg-white rounded-2xl shadow-md p-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`${theme.text.primary} font-bold text-sm whitespace-nowrap`}
                  >
                    Horário
                  </span>
                  <div className="flex gap-1.5 flex-1">
                    {dateGroup.serviceTimes.map((serviceTimeData, index) => {
                      const timeFormatted =
                        serviceTimeData.schedule.service_time?.time.slice(
                          0,
                          5,
                        ) || "N/A";
                      const isSelected = selectedServiceTimeIndex === index;

                      return (
                        <button
                          key={serviceTimeData.schedule.id}
                          onClick={() => handleServiceTimeChange(index)}
                          className={`flex-1 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                            isSelected
                              ? `${theme.backgrounds.primary} ${theme.text.white}`
                              : `${theme.backgrounds.neutralLight} ${theme.text.neutral} hover:${theme.backgrounds.primaryLight}`
                          }`}
                        >
                          {timeFormatted}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Service Time Content */}
            {dateGroup.serviceTimes[selectedServiceTimeIndex] &&
              (() => {
                const serviceTimeData =
                  dateGroup.serviceTimes[selectedServiceTimeIndex];

                // Group students by status
                const presentRegular = serviceTimeData.records
                  .filter(
                    (r) =>
                      (r.status === "present" || r.status === "late") &&
                      !r.student?.is_visitor,
                  )
                  .sort((a, b) =>
                    (a.student?.name || "").localeCompare(
                      b.student?.name || "",
                    ),
                  );

                const presentVisitors = serviceTimeData.records
                  .filter(
                    (r) =>
                      (r.status === "present" || r.status === "late") &&
                      r.student?.is_visitor,
                  )
                  .sort((a, b) =>
                    (a.student?.name || "").localeCompare(
                      b.student?.name || "",
                    ),
                  );

                const absent = serviceTimeData.records
                  .filter(
                    (r) => r.status === "absent" || r.status === "excused",
                  )
                  .sort((a, b) =>
                    (a.student?.name || "").localeCompare(
                      b.student?.name || "",
                    ),
                  );

                const groupedRecords = {
                  presentRegular,
                  presentVisitors,
                  absent,
                };

                return (
                  <>
                    {/* Student List */}
                    {serviceTimeData.records.length > 0 ? (
                      <div className="bg-white rounded-2xl shadow-md p-3 space-y-2">
                        {/* Present Regular Students */}
                        {groupedRecords.presentRegular.map((record) => (
                          <StudentAttendanceRow
                            key={record.id}
                            record={record}
                            onQuickStatusChange={handleQuickStatusChange}
                            onOpenNotes={handleOpenNotes}
                            onOpenDeleteDialog={handleOpenDeleteDialog}
                            onViewStudent={handleViewStudent}
                          />
                        ))}

                        {/* Present Visitors */}
                        {groupedRecords.presentVisitors.map((record) => (
                          <StudentAttendanceRow
                            key={record.id}
                            record={record}
                            onQuickStatusChange={handleQuickStatusChange}
                            onOpenNotes={handleOpenNotes}
                            onOpenDeleteDialog={handleOpenDeleteDialog}
                            onViewStudent={handleViewStudent}
                          />
                        ))}

                        {/* Separator (only show if there are absent students) */}
                        {groupedRecords.absent.length > 0 && (
                          <StatusGroupSeparator
                            count={groupedRecords.absent.length}
                          />
                        )}

                        {/* Absent Students */}
                        {groupedRecords.absent.map((record) => (
                          <StudentAttendanceRow
                            key={record.id}
                            record={record}
                            onQuickStatusChange={handleQuickStatusChange}
                            onOpenNotes={handleOpenNotes}
                            onOpenDeleteDialog={handleOpenDeleteDialog}
                            onViewStudent={handleViewStudent}
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        {lessonIsFuture ? (
                          <EmptyState
                            icon={<Calendar className="w-10 h-10" />}
                            title="Lição Futura"
                            description="Esta lição ainda não tem registos de presença. As presenças podem ser registadas no dia da lição."
                            variant="compact"
                          />
                        ) : (
                          <div className="bg-white rounded-2xl shadow-md p-6 text-center">
                            <p className={`${theme.text.neutral} text-xs`}>
                              Nenhum registo de presença
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
          </div>
        )}
      </div>

      {/* Notes Dialog */}
      {isNotesDialogOpen && selectedRecordForNotes && (
        <NotesDialog
          record={selectedRecordForNotes}
          onClose={handleCloseNotes}
          onSubmit={handleSubmitNotes}
          isSubmitting={isEditing}
        />
      )}

      {/* Add Student Dialog */}
      {isAddDialogOpen && addDialogScheduleId && (
        <AddStudentDialog
          scheduleId={addDialogScheduleId}
          serviceTimeId={addDialogServiceTimeId || 0}
          currentRecords={
            dateGroup?.serviceTimes.find(
              (st) => st.schedule.id === addDialogScheduleId,
            )?.records || []
          }
          onAdd={handleAddStudent}
          onClose={handleCloseAddDialog}
          isAdding={isAdding}
          onCreateVisitor={handleOpenCreateVisitorDialog}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && recordToDelete && (
        <DeleteAttendanceDialog
          studentName={recordToDelete.student?.name || "Estudante"}
          onConfirm={handleConfirmDelete}
          onCancel={handleCloseDeleteDialog}
          isDeleting={isDeleting}
        />
      )}

      {/* Create Visitor Dialog */}
      {isCreateVisitorDialogOpen && (
        <CreateVisitorDialog
          onConfirm={handleCreateVisitor}
          onCancel={handleCloseCreateVisitorDialog}
          isCreating={isCreatingVisitor}
          initialName={visitorInitialName}
        />
      )}

      {/* Teacher Assignment Dialog */}
      {isTeacherAssignmentDialogOpen &&
        dateGroup?.serviceTimes[selectedServiceTimeIndex] && (
          <TeacherAssignmentDialog
            scheduleId={
              dateGroup.serviceTimes[selectedServiceTimeIndex].schedule.id
            }
            currentAssignments={
              dateGroup.serviceTimes[selectedServiceTimeIndex].schedule
                .assignments || []
            }
            onClose={handleCloseTeacherAssignmentDialog}
            onSuccess={handleTeacherAssignmentSuccess}
          />
        )}
    </div>
  );
}

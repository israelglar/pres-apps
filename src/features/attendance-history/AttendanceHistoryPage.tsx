import {
  History as HistoryIcon,
  Loader2,
} from "lucide-react";
import { buttonClasses, theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import { useAttendanceHistoryLogic } from "./AttendanceHistoryPage.logic";
import { DateGroupCard } from "./components/DateGroupCard";
import { NotesDialog } from "./components/NotesDialog";
import { AddStudentDialog } from "./components/AddStudentDialog";
import { DeleteAttendanceDialog } from "./components/DeleteAttendanceDialog";
import { CreateVisitorDialog } from "./components/CreateVisitorDialog";

interface AttendanceHistoryPageProps {
  onBack: () => void;
  onViewStudent?: (studentId: number) => void;
  onRedoAttendance: (scheduleDate: string, serviceTimeId: number) => void;
  initialDate?: string;
  initialServiceTimeId?: number;
}

/**
 * Attendance History Page
 * View and edit past attendance records
 */
export function AttendanceHistoryPage({ onBack, onViewStudent, onRedoAttendance, initialDate, initialServiceTimeId }: AttendanceHistoryPageProps) {
  const {
    history,
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
    canLoadMore,
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
    handleViewStudent,
    handleLoadMore,
    handleRefresh,
    handleRedoAttendance,
  } = useAttendanceHistoryLogic(onViewStudent, onRedoAttendance, initialDate, initialServiceTimeId);

  return (
    <div className={`fixed inset-0 ${theme.backgrounds.page} overflow-y-auto`}>
      {/* Header */}
      <PageHeader
        onBack={onBack}
        title="Histórico de Presenças"
        sticky={true}
      />

      <div className="max-w-4xl mx-auto p-2 pb-20">

        {/* Loading State */}
        {isLoading && !history && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className={`w-16 h-16 ${theme.text.primary} animate-spin mb-4`} />
            <p className={`${theme.text.primary} text-base font-semibold`}>
              A carregar histórico...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`${theme.backgrounds.error} border-2 ${theme.borders.error} rounded-2xl p-5 text-center`}>
            <p className={`${theme.text.error} font-semibold mb-2 text-base`}>
              Erro ao carregar histórico
            </p>
            <p className={`${theme.text.error} text-sm mb-4`}>{error.toString()}</p>
            <button
              onClick={handleRefresh}
              className={`${buttonClasses.danger} px-5 py-3 text-sm`}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && history && history.length === 0 && (
          <div className={`${theme.backgrounds.whiteTransparent} backdrop-blur-sm rounded-2xl p-12 text-center`}>
            <HistoryIcon className={`w-16 h-16 ${theme.text.white}/50 mx-auto mb-4`} />
            <p className={`${theme.text.white} text-base font-semibold mb-2`}>
              Nenhum histórico disponível
            </p>
            <p className={`${theme.text.white}/80 text-sm`}>
              Ainda não existem registos de presenças
            </p>
          </div>
        )}

        {/* History List */}
        {history && history.length > 0 && (
          <div className="space-y-2">
            {history.map((group) => {
              // Only auto-open and scroll if initialDate is provided
              const shouldAutoOpen = !!(initialDate && group.date === initialDate);

              return (
                <DateGroupCard
                  key={group.date}
                  group={group}
                  onQuickStatusChange={handleQuickStatusChange}
                  onOpenNotes={handleOpenNotes}
                  onOpenAddDialog={handleOpenAddDialog}
                  onOpenDeleteDialog={handleOpenDeleteDialog}
                  onViewStudent={handleViewStudent}
                  onRedoAttendance={handleRedoAttendance}
                  initialExpanded={shouldAutoOpen}
                  shouldScrollIntoView={shouldAutoOpen}
                />
              );
            })}

            {/* Load More Button */}
            {canLoadMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className={`${buttonClasses.secondary} px-5 py-3 text-sm bg-white/90 hover:bg-white disabled:opacity-50 flex items-center gap-3`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />A carregar...
                    </>
                  ) : (
                    "Carregar Mais"
                  )}
                </button>
              </div>
            )}

            {/* End of List Message */}
            {!canLoadMore && history.length >= 5 && (
              <div className="text-center py-4">
                <p className={`${theme.text.white}/70 text-sm`}>Fim do histórico</p>
              </div>
            )}
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
            history
              ?.flatMap(g => g.serviceTimes)
              .find(st => st.schedule.id === addDialogScheduleId)?.records || []
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
    </div>
  );
}

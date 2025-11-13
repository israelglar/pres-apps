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
}

/**
 * Attendance History Page
 * View and edit past attendance records
 */
export function AttendanceHistoryPage({ onBack, onViewStudent }: AttendanceHistoryPageProps) {
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
    selectedServiceTime,
    handleServiceTimeChange,
    swipeGesture,
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
  } = useAttendanceHistoryLogic(onViewStudent);

  return (
    <div
      className={`fixed inset-0 ${theme.backgrounds.page} overflow-y-auto`}
      onTouchStart={swipeGesture.handleTouchStart}
      onTouchMove={swipeGesture.handleTouchMove}
      onTouchEnd={swipeGesture.handleTouchEnd}
    >
      {/* Header */}
      <PageHeader
        onBack={onBack}
        title="Histórico de Presenças"
        sticky={true}
      />

      <div className="max-w-4xl mx-auto p-3 pb-20">

        {/* Service Time Tabs */}
        <div className="mb-5">
          <div className={`flex gap-2 ${theme.backgrounds.primaryLighter} rounded-xl p-1.5 border-2 ${theme.borders.primaryLight}`}>
            {/* Tab buttons */}
            <button
              onClick={() => handleServiceTimeChange("09:00:00")}
              className={`flex-1 px-5 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
                selectedServiceTime === "09:00:00"
                  ? `${theme.solids.primaryButton} ${theme.text.onPrimaryButton} shadow-md`
                  : `${theme.backgrounds.white} ${theme.text.primary} hover:shadow-sm`
              }`}
            >
              09:00
            </button>
            <button
              onClick={() => handleServiceTimeChange("11:00:00")}
              className={`flex-1 px-5 py-3 rounded-lg font-bold text-sm transition-all duration-200 ${
                selectedServiceTime === "11:00:00"
                  ? `${theme.solids.primaryButton} ${theme.text.onPrimaryButton} shadow-md`
                  : `${theme.backgrounds.white} ${theme.text.primary} hover:shadow-sm`
              }`}
            >
              11:00
            </button>
          </div>
        </div>

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
          <div className="space-y-3">
            {history.map((group) => (
              <DateGroupCard
                key={group.schedule.id}
                group={group}
                onQuickStatusChange={handleQuickStatusChange}
                onOpenNotes={handleOpenNotes}
                onOpenAddDialog={() => handleOpenAddDialog(group.schedule.id, group.schedule.service_time_id)}
                onOpenDeleteDialog={handleOpenDeleteDialog}
                onViewStudent={handleViewStudent}
              />
            ))}

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
          currentRecords={history?.find(g => g.schedule.id === addDialogScheduleId)?.records || []}
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

import {
  BookOpen,
  Loader2,
  Search,
} from "lucide-react";
import { buttonClasses, theme } from "../../config/theme";
import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
import { FilterButton } from "../../components/ui/FilterButton";
import { FilterPanel } from "../../components/ui/FilterPanel";
import { EmptyState } from "../../components/ui/EmptyState";
import { ItemCount } from "../../components/ui/ItemCount";
import { useLessonsLogic } from "./LessonsPage.logic";
import { DateGroupCard } from "./components/DateGroupCard";
import { NotesDialog } from "./components/NotesDialog";
import { AddStudentDialog } from "./components/AddStudentDialog";
import { DeleteAttendanceDialog } from "./components/DeleteAttendanceDialog";
import { CreateVisitorDialog } from "./components/CreateVisitorDialog";

interface LessonsPageProps {
  onBack: () => void;
  onViewStudent?: (studentId: number) => void;
  onRedoAttendance: (scheduleDate: string, serviceTimeId: number) => void;
  onDateClick?: (date: string) => void;
  initialDate?: string;
  initialServiceTimeId?: number;
}

/**
 * Lessons Page
 * View and edit past attendance records
 */
export function LessonsPage({ onBack, onViewStudent, onRedoAttendance, onDateClick, initialDate, initialServiceTimeId }: LessonsPageProps) {
  const {
    history,
    totalLessons,
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
    searchQuery,
    setSearchQuery,
    timePeriodFilter,
    attendanceFilter,
    isFilterOpen,
    setIsFilterOpen,
    filterGroups,
    hasActiveFilters,
    handleFilterChange,
    handleClearFilters,
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
  } = useLessonsLogic(onViewStudent, onRedoAttendance, initialDate, initialServiceTimeId);

  return (
    <div className={`fixed inset-0 ${theme.backgrounds.page} overflow-y-auto`}>
      {/* Header */}
      <PageHeader
        onBack={onBack}
        title="Lições"
        sticky={true}
      />

      <div className="max-w-4xl mx-auto p-2 pb-20">

        {/* Search and Filter Bar */}
        {!isLoading && !error && (
          <div className="mb-4 space-y-2">
            <div className="flex gap-2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Procurar lição..."
                onClear={() => setSearchQuery('')}
                className="flex-1"
              />

              <FilterButton
                isActive={hasActiveFilters}
                isOpen={isFilterOpen}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              />
            </div>

            <FilterPanel
              isOpen={isFilterOpen}
              filterGroups={filterGroups}
              activeFilters={{
                timePeriod: timePeriodFilter,
                attendance: attendanceFilter,
              }}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && !history && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className={`w-16 h-16 ${theme.text.primary} animate-spin mb-4`} />
            <p className={`${theme.text.primary} text-base font-semibold`}>
              A carregar lições...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`${theme.backgrounds.error} border-2 ${theme.borders.error} rounded-2xl p-5 text-center`}>
            <p className={`${theme.text.error} font-semibold mb-2 text-base`}>
              Erro ao carregar lições
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

        {/* Empty State - No lessons at all */}
        {!isLoading && !error && totalLessons === 0 && (
          <EmptyState
            icon={<BookOpen className="w-16 h-16" />}
            title="Nenhuma lição disponível"
            description="Ainda não existem lições agendadas"
            variant="compact"
          />
        )}

        {/* Filtered Empty State - Has lessons but none match filters */}
        {!isLoading && !error && totalLessons > 0 && history && history.length === 0 && (
          <EmptyState
            icon={<Search className="w-16 h-16" />}
            title="Nenhuma lição encontrada"
            description={
              searchQuery
                ? `Nenhuma lição corresponde a "${searchQuery}"`
                : "Nenhuma lição corresponde aos filtros selecionados"
            }
            action={{
              label: "Limpar Filtros",
              onClick: () => {
                setSearchQuery('');
                handleClearFilters();
              },
            }}
          />
        )}

        {/* Lesson List */}
        {!isLoading && !error && history && history.length > 0 && (
          <>
            {/* Item Count */}
            <ItemCount
              totalCount={totalLessons}
              filteredCount={history.length}
              itemLabel="lição"
              itemLabelPlural="lições"
              isFiltered={hasActiveFilters || searchQuery.length > 0}
              className="mb-4"
            />

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
                  onDateClick={onDateClick}
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
                <p className={`${theme.text.white}/70 text-sm`}>Fim da lista</p>
              </div>
            )}
            </div>
          </>
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

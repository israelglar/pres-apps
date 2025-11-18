import { BookOpen, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { EmptyState } from "../../components/ui/EmptyState";
import { FilterButton } from "../../components/ui/FilterButton";
import { FilterPanel } from "../../components/ui/FilterPanel";
import { ItemCount } from "../../components/ui/ItemCount";
import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
import { buttonClasses, theme } from "../../config/theme";
import { useLessonsLogic } from "./LessonsPage.logic";
import { AddStudentDialog } from "./components/AddStudentDialog";
import { CreateVisitorDialog } from "./components/CreateVisitorDialog";
import { DateGroupCard } from "./components/DateGroupCard";
import { DeleteAttendanceDialog } from "./components/DeleteAttendanceDialog";
import { NotesDialog } from "./components/NotesDialog";

interface LessonsPageProps {
  onBack: () => void;
  onViewStudent?: (studentId: number) => void;
  onRedoAttendance: (scheduleDate: string, serviceTimeId: number) => void;
  onDateClick: (date: string) => void;
  scrollToDate?: string;
}

/**
 * Lessons Page
 * View and edit past attendance records
 */
export function LessonsPage({
  onBack,
  onViewStudent,
  onRedoAttendance,
  onDateClick,
  scrollToDate,
}: LessonsPageProps) {
  // Store refs for each lesson card to enable scrolling
  const lessonRefs = useRef<Map<string, HTMLDivElement>>(new Map());
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
    teacherFilter,
    isFilterOpen,
    setIsFilterOpen,
    filterGroups,
    hasActiveFilters,
    handleFilterChange,
    handleClearFilters,
    handleCloseNotes,
    handleSubmitNotes,
    handleCloseAddDialog,
    handleAddStudent,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    handleOpenCreateVisitorDialog,
    handleCloseCreateVisitorDialog,
    handleCreateVisitor,
    handleRefresh,
  } = useLessonsLogic(onViewStudent, onRedoAttendance);

  // Scroll to the specified lesson when page loads
  useEffect(() => {
    if (scrollToDate && history && history.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = lessonRefs.current.get(scrollToDate);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [scrollToDate, history]);

  return (
    <div className={`fixed inset-0 ${theme.backgrounds.page} overflow-y-auto`}>
      {/* Header */}
      <PageHeader onBack={onBack} title="Lições" sticky={true} />

      <div className="max-w-4xl mx-auto p-2 pb-20">
        {/* Search and Filter Bar */}
        {!isLoading && !error && (
          <div className="mb-4 space-y-2">
            <div className="flex gap-2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Procurar lição..."
                onClear={() => setSearchQuery("")}
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
                teacher: teacherFilter,
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
            <div
              className={`w-16 h-16 ${theme.text.primary} animate-spin mb-4 border-4 border-current border-t-transparent rounded-full`}
            />
            <p className={`${theme.text.primary} text-base font-semibold`}>
              A carregar lições...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div
            className={`${theme.backgrounds.error} border-2 ${theme.borders.error} rounded-2xl p-5 text-center`}
          >
            <p className={`${theme.text.error} font-semibold mb-2 text-base`}>
              Erro ao carregar lições
            </p>
            <p className={`${theme.text.error} text-sm mb-4`}>
              {error.toString()}
            </p>
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
        {!isLoading &&
          !error &&
          totalLessons > 0 &&
          history &&
          history.length === 0 && (
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
                  setSearchQuery("");
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
              {history.map((group, index) => {
                // Check if this is a future lesson
                const today = new Date().toISOString().split('T')[0];
                const isFuture = group.date > today;

                // Check if previous lesson was not future (or this is first item)
                const prevGroup = index > 0 ? history[index - 1] : null;
                const prevIsFuture = prevGroup ? prevGroup.date > today : false;

                // Show separator if this is the first future lesson
                const showSeparator = isFuture && !prevIsFuture;

                return (
                  <div
                    key={group.date}
                    ref={(el) => {
                      if (el) {
                        lessonRefs.current.set(group.date, el);
                      } else {
                        lessonRefs.current.delete(group.date);
                      }
                    }}
                  >
                    {showSeparator && (
                      <div className={`flex items-center gap-3 py-4 px-2`}>
                        <div className={`flex-1 h-px ${theme.backgrounds.neutralLight}`} />
                        <span className={`text-xs font-semibold ${theme.text.neutral} uppercase tracking-wide`}>
                          Lições Futuras
                        </span>
                        <div className={`flex-1 h-px ${theme.backgrounds.neutralLight}`} />
                      </div>
                    )}
                    <DateGroupCard
                      group={group}
                      onDateClick={onDateClick}
                    />
                  </div>
                );
              })}
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
              ?.flatMap((g) => g.serviceTimes)
              .find((st) => st.schedule.id === addDialogScheduleId)?.records ||
            []
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

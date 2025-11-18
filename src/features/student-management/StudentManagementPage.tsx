import { Loader2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "../../components/ui/EmptyState";
import { FilterButton } from "../../components/ui/FilterButton";
import { FilterPanel } from "../../components/ui/FilterPanel";
import { ItemCount } from "../../components/ui/ItemCount";
import { PageHeader } from "../../components/ui/PageHeader";
import { SearchBar } from "../../components/ui/SearchBar";
import { theme } from "../../config/theme";
import {
  useStudentManagement,
  type StudentWithAlert,
} from "../../hooks/useStudentManagement";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { StudentCard } from "./StudentCard";
import { StudentFormModal } from "./StudentFormModal";

type StatusFilter = "all" | "active" | "inactive" | "aged-out" | "moved";
type VisitorFilter = "all" | "visitors";
type AlertFilter = "all" | "with-alerts";

interface StudentManagementPageProps {
  onBack: () => void;
  onStudentClick?: (student: StudentWithAlert) => void;
}

/**
 * Student Management Page - CRUD operations for students
 *
 * Features:
 * - View all active students
 * - Add new student
 * - Edit existing student
 * - Delete student (soft delete)
 * - Card-based responsive layout
 */
export function StudentManagementPage({
  onBack,
  onStudentClick,
}: StudentManagementPageProps) {
  const {
    students,
    isLoading,
    isError,
    error,
    refetch,
    createStudent,
    updateStudent,
    deleteStudent,
    isCreating,
    isUpdating,
    isDeleting,
  } = useStudentManagement(true, 3); // Include alerts with threshold of 3

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentWithAlert | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingStudent, setDeletingStudent] =
    useState<StudentWithAlert | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [visitorFilter, setVisitorFilter] = useState<VisitorFilter>("all");
  const [alertFilter, setAlertFilter] = useState<AlertFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter groups configuration
  const filterGroups = [
    {
      id: "status",
      label: "Estado",
      options: [
        { value: "all", label: "Todos" },
        { value: "active", label: "Ativo" },
        { value: "inactive", label: "Inativo" },
        { value: "aged-out", label: "Passou" },
        { value: "moved", label: "Mudou" },
      ],
    },
    {
      id: "visitor",
      label: "Visitantes",
      options: [
        { value: "all", label: "Todos" },
        { value: "visitors", label: "Visitantes" },
      ],
    },
    {
      id: "alert",
      label: "Alertas",
      options: [
        { value: "all", label: "Todos" },
        { value: "with-alerts", label: "Com alerta" },
      ],
    },
  ];

  // Helper functions
  const hasActiveFilters = statusFilter !== "all" || visitorFilter !== "all" || alertFilter !== "all";

  const handleClearFilters = () => {
    setStatusFilter("all");
    setVisitorFilter("all");
    setAlertFilter("all");
  };

  const handleFilterChange = (groupId: string, value: string) => {
    if (groupId === "status") setStatusFilter(value as StatusFilter);
    if (groupId === "visitor") setVisitorFilter(value as VisitorFilter);
    if (groupId === "alert") setAlertFilter(value as AlertFilter);
  };

  // Filter students based on search query, status, visitor status, and alerts
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    // Apply visitor filter
    if (visitorFilter === "visitors") {
      filtered = filtered.filter((student) => student.is_visitor === true);
    }

    // Apply alert filter
    if (alertFilter === "with-alerts") {
      filtered = filtered.filter((student) => student.hasAlert === true);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(query),
      );
    }

    // Sort by status (active first) then by name
    return filtered.sort((a, b) => {
      // Status priority: active = 0, others = 1
      const statusPriority = (status: StudentWithAlert["status"]) => {
        return status === "active" ? 0 : 1;
      };

      const statusDiff = statusPriority(a.status) - statusPriority(b.status);

      // If same status priority, sort by name
      if (statusDiff === 0) {
        return a.name.localeCompare(b.name, "pt-PT");
      }

      return statusDiff;
    });
  }, [students, searchQuery, statusFilter, visitorFilter, alertFilter]);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowFormModal(true);
  };

  const handleConfirmDelete = () => {
    if (deletingStudent) {
      deleteStudent(deletingStudent.id);
      setShowDeleteDialog(false);
      setDeletingStudent(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingStudent(null);
  };

  const handleFormClose = () => {
    setShowFormModal(false);
    setEditingStudent(null);
  };

  return (
    <div
      className={`h-screen flex flex-col ${theme.backgrounds.page} overflow-hidden`}
    >
      {/* Header Section */}
      <PageHeader
        onBack={onBack}
        title="Prés"
        rightAction={{
          icon: <Plus className="w-5 h-5" />,
          label: "Adicionar",
          onClick: handleAddStudent,
          disabled: isCreating,
        }}
        sticky={false}
        className="flex-shrink-0"
      />

      {/* Main Content Area - Fixed search bar with scrollable list below */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Search Bar and Filters - Fixed at top */}
        {!isLoading && !isError && students.length > 0 && (
          <div className="flex-shrink-0 p-5 pb-3 space-y-3">
            {/* Search Bar and Filter Button Row */}
            <div className="flex gap-2">
              {/* Search Bar */}
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Procurar pré por nome..."
                className="flex-1"
              />

              {/* Filter Toggle Button */}
              <FilterButton
                isActive={hasActiveFilters}
                isOpen={showFilters}
                onClick={() => setShowFilters(!showFilters)}
              />
            </div>

            {/* Filter Options */}
            <FilterPanel
              isOpen={showFilters}
              filterGroups={filterGroups}
              activeFilters={{
                status: statusFilter,
                visitor: visitorFilter,
                alert: alertFilter,
              }}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        {/* Scrollable Content Area - Takes remaining space */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2
                className={`w-16 h-16 ${theme.text.primary} animate-spin mb-4`}
              />
              <p className={`text-base ${theme.text.neutral} font-medium`}>
                A carregar prés...
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div
              className={`${theme.backgrounds.errorLight} border ${theme.borders.error} rounded-xl p-6`}
            >
              <p className={`${theme.text.error} font-bold mb-2`}>
                Erro ao carregar prés
              </p>
              <p className={`${theme.text.neutral} text-sm mb-4`}>
                {error instanceof Error ? error.message : "Erro desconhecido"}
              </p>
              <button
                onClick={() => refetch()}
                className={`px-5 py-3 ${theme.solids.primaryButton} ${theme.text.onPrimaryButton} rounded-xl text-sm font-medium hover:shadow-md transition-all`}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Student List */}
          {!isLoading && !isError && (
            <>
              {students.length === 0 ? (
                <EmptyState
                  icon={<Plus className="w-16 h-16" />}
                  title="Nenhum pré encontrado"
                  action={{
                    label: "Adicionar Primeiro Pré",
                    onClick: handleAddStudent,
                    icon: <Plus className="w-4 h-4" />,
                  }}
                />
              ) : filteredStudents.length === 0 ? (
                <EmptyState
                  icon={<Search className="w-16 h-16" />}
                  title="Nenhum pré encontrado"
                  description="Tenta procurar com outro nome"
                  action={{
                    label: "Limpar pesquisa",
                    onClick: () => {
                      setSearchQuery("");
                      handleClearFilters();
                    },
                  }}
                />
              ) : (
                <>
                  <ItemCount
                    totalCount={students.length}
                    filteredCount={filteredStudents.length}
                    itemLabel="pré"
                    itemLabelPlural="prés"
                    isFiltered={hasActiveFilters || searchQuery.length > 0}
                    className="mb-4"
                  />

                  <div className="space-y-3">
                    {filteredStudents.map((student) => (
                      <StudentCard
                        key={student.id}
                        student={student}
                        onClick={onStudentClick || (() => {})}
                        hasAlert={student.hasAlert}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <StudentFormModal
          key={editingStudent?.id || "new"}
          student={editingStudent}
          onClose={handleFormClose}
          onSubmit={(data) => {
            if (editingStudent) {
              updateStudent({ id: editingStudent.id, updates: data });
            } else {
              createStudent(data as any);
            }
            handleFormClose();
          }}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && deletingStudent && (
        <DeleteConfirmDialog
          studentName={deletingStudent.name}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

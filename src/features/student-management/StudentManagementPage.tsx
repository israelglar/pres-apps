import { Plus, Loader2, Search, X, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useStudentManagement } from '../../hooks/useStudentManagement';
import { PageHeader } from '../../components/ui/PageHeader';
import { StudentCard } from './StudentCard';
import { StudentFormModal } from './StudentFormModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import type { Student } from '../../types/database.types';
import { theme } from '../../config/theme';

type StatusFilter = 'all' | 'active' | 'inactive' | 'aged-out' | 'moved';
type VisitorFilter = 'all' | 'visitors';

interface StudentManagementPageProps {
  onBack: () => void;
  onStudentClick?: (student: Student) => void;
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
export function StudentManagementPage({ onBack, onStudentClick }: StudentManagementPageProps) {
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
  } = useStudentManagement();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [visitorFilter, setVisitorFilter] = useState<VisitorFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter students based on search query, status, and visitor status
  const filteredStudents = useMemo(() => {
    let filtered = students;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    // Apply visitor filter
    if (visitorFilter === 'visitors') {
      filtered = filtered.filter((student) => student.is_visitor === true);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((student) =>
        student.name.toLowerCase().includes(query)
      );
    }

    // Sort by status (active first) then by name
    return filtered.sort((a, b) => {
      // Status priority: active = 0, others = 1
      const statusPriority = (status: Student['status']) => {
        return status === 'active' ? 0 : 1;
      };

      const statusDiff = statusPriority(a.status) - statusPriority(b.status);

      // If same status priority, sort by name
      if (statusDiff === 0) {
        return a.name.localeCompare(b.name, 'pt-PT');
      }

      return statusDiff;
    });
  }, [students, searchQuery, statusFilter, visitorFilter]);

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
    <div className={`h-screen flex flex-col ${theme.gradients.background} text-white overflow-hidden`}>
      {/* Header Section */}
      <PageHeader
        onBack={onBack}
        title="Gerir Prés"
        subtitle="Adicionar, editar ou remover prés"
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
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Procurar pré por nome..."
                  className="w-full pl-12 pr-12 py-3 rounded-xl text-sm bg-white/10 text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                )}
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${
                  showFilters || statusFilter !== 'all' || visitorFilter !== 'all'
                    ? 'bg-white text-cyan-600'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <Filter className="w-4 h-4" />
                {(statusFilter !== 'all' || visitorFilter !== 'all') && (
                  <span className="w-2 h-2 bg-cyan-600 rounded-full" />
                )}
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="bg-white/10 rounded-xl p-4 space-y-4 border border-white/20">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-bold text-white mb-2">
                    Estado
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'Todos' },
                      { value: 'active', label: 'Ativo' },
                      { value: 'inactive', label: 'Inativo' },
                      { value: 'aged-out', label: 'Saiu' },
                      { value: 'moved', label: 'Mudou' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStatusFilter(option.value as StatusFilter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          statusFilter === option.value
                            ? 'bg-white text-cyan-600'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visitor Filter */}
                <div>
                  <label className="block text-xs font-bold text-white mb-2">
                    Visitantes
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'all', label: 'Todos' },
                      { value: 'visitors', label: 'Apenas Visitantes' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setVisitorFilter(option.value as VisitorFilter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          visitorFilter === option.value
                            ? 'bg-white text-cyan-600'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(statusFilter !== 'all' || visitorFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setVisitorFilter('all');
                    }}
                    className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Scrollable Content Area - Takes remaining space */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
              <p className="text-base text-white/90 font-medium">
                A carregar prés...
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="bg-red-500/20 border-2 border-red-400 rounded-xl p-6">
              <p className="text-white font-bold mb-2">
                Erro ao carregar prés
              </p>
              <p className="text-white/90 text-sm mb-4">
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
              <button
                onClick={() => refetch()}
                className="px-5 py-3 bg-white text-cyan-600 hover:bg-white/90 rounded-xl text-sm font-medium transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Student List */}
          {!isLoading && !isError && (
          <>
            {students.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base text-white/90 font-medium mb-4">
                  Nenhum pré encontrado
                </p>
                <button
                  onClick={handleAddStudent}
                  className="px-5 py-3 bg-white text-cyan-600 hover:bg-white/90 rounded-xl text-sm font-medium inline-flex items-center transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Pré
                </button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <p className="text-base text-white/90 font-medium mb-2">
                  Nenhum pré encontrado
                </p>
                <p className="text-sm text-white/80">
                  Tenta procurar com outro nome
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Limpar pesquisa
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-white/90 font-medium">
                    {searchQuery ? (
                      <>
                        A mostrar {filteredStudents.length} de {students.length} {students.length === 1 ? 'pré' : 'prés'}
                      </>
                    ) : (
                      <>
                        Total: {students.length} {students.length === 1 ? 'pré' : 'prés'}
                      </>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onClick={onStudentClick || (() => {})}
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
          key={editingStudent?.id || 'new'}
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

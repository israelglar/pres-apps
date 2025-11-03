import { ArrowLeft, Plus, Loader2, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useStudentManagement } from '../../hooks/useStudentManagement';
import { StudentCard } from './StudentCard';
import { StudentFormModal } from './StudentFormModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import type { Student } from '../../types/database.types';
import { theme } from '../../config/theme';

interface StudentManagementPageProps {
  onBack: () => void;
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
export function StudentManagementPage({ onBack }: StudentManagementPageProps) {
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

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return students;
    }

    const query = searchQuery.toLowerCase().trim();
    return students.filter((student) =>
      student.name.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowFormModal(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setShowFormModal(true);
  };

  const handleDeleteClick = (student: Student) => {
    setDeletingStudent(student);
    setShowDeleteDialog(true);
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
    <div className={`h-screen overflow-y-auto ${theme.gradients.background} text-white`}>
      {/* Header Section */}
      <header className={`sticky top-0 z-10 ${theme.gradients.primaryButton} shadow-lg`}>
        <div className="flex items-center justify-between p-5">
          {/* Left: Back Button with "Voltar" text */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-base font-medium">Voltar</span>
          </button>

          {/* Right: Add Student Button */}
          <button
            onClick={handleAddStudent}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            disabled={isCreating}
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Adicionar</span>
          </button>
        </div>

        {/* Title Section - NO ICON on left */}
        <div className="px-5 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Gerir Alunos
          </h1>
          <p className="text-base font-medium text-white/90">
            Adicionar, editar ou remover alunos
          </p>
        </div>
      </header>

      {/* Body Section */}
      <main className="p-5">

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-16 h-16 text-white animate-spin mb-4" />
            <p className="text-base text-white/90 font-medium">
              A carregar alunos...
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-500/20 border-2 border-red-400 rounded-xl p-6 mb-5">
            <p className="text-white font-bold mb-2">
              Erro ao carregar alunos
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

        {/* Search Bar */}
        {!isLoading && !isError && students.length > 0 && (
          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Procurar aluno por nome..."
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
          </div>
        )}

        {/* Student List */}
        {!isLoading && !isError && (
          <>
            {students.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-base text-white/90 font-medium mb-4">
                  Nenhum aluno encontrado
                </p>
                <button
                  onClick={handleAddStudent}
                  className="px-5 py-3 bg-white text-cyan-600 hover:bg-white/90 rounded-xl text-sm font-medium inline-flex items-center transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Aluno
                </button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <p className="text-base text-white/90 font-medium mb-2">
                  Nenhum aluno encontrado
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
                        A mostrar {filteredStudents.length} de {students.length} {students.length === 1 ? 'aluno' : 'alunos'}
                      </>
                    ) : (
                      <>
                        Total: {students.length} {students.length === 1 ? 'aluno' : 'alunos'}
                      </>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <StudentCard
                      key={student.id}
                      student={student}
                      onEdit={handleEditStudent}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

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

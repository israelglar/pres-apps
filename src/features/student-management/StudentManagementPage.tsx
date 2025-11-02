import { ArrowLeft, Plus, Loader2, Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { theme, buttonClasses, inputClasses } from '../../config/theme';
import { useStudentManagement } from '../../hooks/useStudentManagement';
import { StudentCard } from './StudentCard';
import { StudentFormModal } from './StudentFormModal';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import type { Student } from '../../types/database.types';

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
    <div
      className={`h-screen ${theme.gradients.background} flex items-start justify-center p-4 overflow-y-auto`}
    >
      <div className="max-w-4xl w-full py-4 pb-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white">Gerir Alunos</h1>
          <p className={`${theme.text.primaryLight} text-base font-medium`}>
            Adicionar, editar ou remover alunos
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-5 mb-6">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={onBack}
              className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm flex items-center justify-center`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
            <button
              onClick={handleAddStudent}
              className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center`}
              disabled={isCreating}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Aluno
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className={`w-16 h-16 ${theme.text.primary} animate-spin mb-4`} />
              <p className={`text-base ${theme.text.neutral} font-medium`}>
                A carregar alunos...
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className={`${theme.backgrounds.error} border-2 ${theme.borders.error} rounded-xl p-6 mb-5`}>
              <p className={`${theme.text.error} font-bold mb-2`}>
                Erro ao carregar alunos
              </p>
              <p className={`${theme.text.neutral} text-sm mb-4`}>
                {error instanceof Error ? error.message : 'Erro desconhecido'}
              </p>
              <button
                onClick={() => refetch()}
                className={`px-4 py-2 ${buttonClasses.primary} text-sm`}
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Search Bar */}
          {!isLoading && !isError && students.length > 0 && (
            <div className="mb-5">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.text.neutral}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Procurar aluno por nome..."
                  className={`w-full pl-12 pr-12 py-3 ${inputClasses} text-sm`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors`}
                  >
                    <X className={`w-4 h-4 ${theme.text.neutral}`} />
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
                  <p className={`text-base ${theme.text.neutral} font-medium mb-4`}>
                    Nenhum aluno encontrado
                  </p>
                  <button
                    onClick={handleAddStudent}
                    className={`px-5 py-3 ${buttonClasses.primary} text-sm inline-flex items-center`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Aluno
                  </button>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-16">
                  <Search className={`w-16 h-16 ${theme.text.neutral} mx-auto mb-4`} />
                  <p className={`text-base ${theme.text.neutral} font-medium mb-2`}>
                    Nenhum aluno encontrado
                  </p>
                  <p className={`text-sm ${theme.text.neutral}`}>
                    Tenta procurar com outro nome
                  </p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`mt-4 px-5 py-3 ${buttonClasses.secondary} text-sm`}
                  >
                    Limpar pesquisa
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className={`text-sm ${theme.text.neutral} font-medium`}>
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
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <StudentFormModal
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

import { X, UserPlus, Users } from 'lucide-react';
import { useState, useMemo } from 'react';
import { theme } from '../../../config/theme';
import { SearchBar } from '../../../components/ui/SearchBar';
import { useStudentManagement } from '../../../hooks/useStudentManagement';
import type { AttendanceRecordWithRelations } from '../../../types/database.types';

interface AddStudentDialogProps {
  scheduleId: number;
  serviceTimeId: number;
  currentRecords: AttendanceRecordWithRelations[];
  onAdd: (studentId: number) => void;
  onClose: () => void;
  isAdding: boolean;
  onCreateVisitor: (searchQuery: string) => void;
}

/**
 * Add Student Dialog - Shows list of unmarked students to add to attendance
 * Students are added as "Present" by default and can be edited after
 */
export function AddStudentDialog({
  currentRecords,
  onAdd,
  onClose,
  isAdding,
  onCreateVisitor,
}: AddStudentDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all students (no alerts needed for this dialog)
  const { students, isLoading } = useStudentManagement(false);

  // Filter to only active students not already in attendance
  const unmarkedStudents = useMemo(() => {
    const markedStudentIds = new Set(currentRecords.map(r => r.student_id));

    return students
      .filter(student =>
        student.status === 'active' && !markedStudentIds.has(student.id)
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'));
  }, [students, currentRecords]);

  // Apply search filter
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return unmarkedStudents;

    const query = searchQuery.toLowerCase().trim();
    return unmarkedStudents.filter(student =>
      student.name.toLowerCase().includes(query)
    );
  }, [unmarkedStudents, searchQuery]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        {/* Header */}
        <div className={`${theme.solids.primaryButton} p-5 flex items-center justify-between flex-shrink-0`}>
          <h2 className={`text-xl font-bold ${theme.text.onPrimaryButton}`}>Adicionar Pré</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isAdding}
          >
            <X className={`w-5 h-5 ${theme.text.onPrimaryButton}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-5 pb-3 flex-shrink-0">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Procurar pré..."
          />
          <p className={`text-xs ${theme.text.neutral} mt-2`}>
            {filteredStudents.length} {filteredStudents.length === 1 ? 'pré disponível' : 'prés disponíveis'}
          </p>
        </div>

        {/* Student List - Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className={`w-12 h-12 ${theme.text.neutral} mb-3`} />
              <p className={`text-sm ${theme.text.neutral}`}>A carregar prés...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <UserPlus className={`w-12 h-12 ${theme.text.neutralLight} mb-3`} />
              <p className={`text-base font-semibold ${theme.text.neutralDarker} mb-4`}>
                {searchQuery ? 'Nenhum pré encontrado' : 'Todos os prés já foram marcados'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => onCreateVisitor(searchQuery)}
                  disabled={isAdding}
                  className={`flex items-center gap-2 px-5 py-3 ${theme.solids.primaryButton} ${theme.text.onPrimaryButton} rounded-xl text-sm font-medium hover:shadow-md ${theme.solids.primaryButtonHover} active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <UserPlus className="w-4 h-4" />
                  Adicionar Visitante
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => onAdd(student.id)}
                  disabled={isAdding}
                  className={`w-full ${theme.backgrounds.white} border ${theme.borders.primary} rounded-xl p-3 hover:shadow-md ${theme.backgrounds.primaryHover} active:bg-blue-100 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`${theme.backgrounds.primaryLight} p-1.5 rounded-lg flex-shrink-0`}>
                      <UserPlus className={`w-4 h-4 ${theme.text.primary}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-bold ${theme.text.primary}`}>
                        {student.name}
                      </h3>
                      {student.notes && (
                        <p className={`text-xs ${theme.text.neutral} mt-0.5 line-clamp-1`}>
                          {student.notes}
                        </p>
                      )}
                    </div>
                    {student.is_visitor && (
                      <div
                        className={`w-2 h-2 rounded-full ${theme.indicators.visitor} flex-shrink-0`}
                        title="Visitante"
                      />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Help Text */}
        <div className={`${theme.backgrounds.neutralLight} p-3 flex-shrink-0 border-t ${theme.borders.neutralLight}`}>
          <p className={`text-xs ${theme.text.neutral} text-center`}>
            Toca num pré para adicioná-lo como <strong>Presente</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

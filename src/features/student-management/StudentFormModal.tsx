import { X, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { theme, buttonClasses, inputClasses } from '../../config/theme';
import type { Student, StudentInsert, StudentUpdate } from '../../types/database.types';

interface StudentFormModalProps {
  student: Student | null; // null = create mode, Student = edit mode
  onClose: () => void;
  onSubmit: (data: StudentInsert | StudentUpdate) => void;
  isSubmitting: boolean;
}

/**
 * Student Form Modal - Create or edit a student
 *
 * Fields:
 * - Name (required)
 * - Is Visitor (checkbox)
 * - Status (dropdown)
 * - Date of Birth (date picker, optional)
 * - Notes (textarea, optional)
 */
export function StudentFormModal({
  student,
  onClose,
  onSubmit,
  isSubmitting,
}: StudentFormModalProps) {
  const isEditMode = student !== null;

  const [formData, setFormData] = useState({
    name: student?.name || '',
    is_visitor: student?.is_visitor || false,
    visitor_date: student?.visitor_date || null,
    date_of_birth: student?.date_of_birth || '',
    age_group: student?.age_group || null,
    status: student?.status || 'active' as Student['status'],
    notes: student?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens with different student
  useEffect(() => {
    setFormData({
      name: student?.name || '',
      is_visitor: student?.is_visitor || false,
      visitor_date: student?.visitor_date || null,
      date_of_birth: student?.date_of_birth || '',
      age_group: student?.age_group || null,
      status: student?.status || 'active',
      notes: student?.notes || '',
    });
    setErrors({});
  }, [student]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dataToSubmit: StudentInsert | StudentUpdate = {
      name: formData.name.trim(),
      is_visitor: formData.is_visitor,
      visitor_date: formData.is_visitor && formData.visitor_date ? formData.visitor_date : null,
      date_of_birth: formData.date_of_birth || null,
      age_group: formData.age_group || null,
      status: formData.status,
      notes: formData.notes.trim() || null,
    };

    onSubmit(dataToSubmit);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className={`${theme.gradients.background} p-5 flex items-center justify-between sticky top-0 z-10`}>
          <h2 className="text-2xl font-bold text-white">
            {isEditMode ? 'Editar Aluno' : 'Adicionar Aluno'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name Field */}
          <div>
            <label
              htmlFor="name"
              className={`block ${theme.text.neutralDarker} font-bold mb-2 text-sm`}
            >
              Nome <span className={theme.text.error}>*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 ${inputClasses} ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Nome completo do aluno"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className={`text-sm ${theme.text.error} mt-1`}>{errors.name}</p>
            )}
          </div>

          {/* Is Visitor Checkbox */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_visitor"
              checked={formData.is_visitor}
              onChange={(e) =>
                setFormData({ ...formData, is_visitor: e.target.checked })
              }
              className={`w-5 h-5 ${theme.text.primary} rounded focus:ring-2 ${theme.rings.primary}`}
              disabled={isSubmitting}
            />
            <label
              htmlFor="is_visitor"
              className={`${theme.text.neutralDarker} font-bold text-sm cursor-pointer`}
            >
              Visitante
            </label>
          </div>

          {/* Status Dropdown */}
          <div>
            <label
              htmlFor="status"
              className={`block ${theme.text.neutralDarker} font-bold mb-2 text-sm`}
            >
              Estado
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Student['status'] })
              }
              className={`w-full px-4 py-3 ${inputClasses}`}
              disabled={isSubmitting}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="aged-out">Saiu</option>
              <option value="moved">Mudou</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label
              htmlFor="date_of_birth"
              className={`block ${theme.text.neutralDarker} font-bold mb-2 text-sm`}
            >
              Data de Nascimento
            </label>
            <input
              type="date"
              id="date_of_birth"
              value={formData.date_of_birth || ''}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
              className={`w-full px-4 py-3 ${inputClasses}`}
              disabled={isSubmitting}
            />
          </div>

          {/* Notes Textarea */}
          <div>
            <label
              htmlFor="notes"
              className={`block ${theme.text.neutralDarker} font-bold mb-2 text-sm`}
            >
              Notas
            </label>
            <textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={`w-full px-4 py-3 ${inputClasses} resize-none`}
              rows={4}
              placeholder="Observações sobre o aluno (opcional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-base`}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-base flex items-center justify-center`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>{isEditMode ? 'Guardar' : 'Adicionar'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

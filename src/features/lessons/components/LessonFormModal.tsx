import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonClasses, inputClasses, theme } from "../../../config/theme";
import type {
  Lesson,
  LessonInsert,
  LessonUpdate,
} from "../../../types/database.types";

interface LessonFormModalProps {
  lesson: Lesson | null; // null = create mode, Lesson = edit mode
  onClose: () => void;
  onSubmit: (data: LessonInsert | LessonUpdate) => void;
  isSubmitting: boolean;
}

/**
 * Lesson Form Modal - Create or edit a lesson
 *
 * Fields:
 * - Name (required)
 * - Resource URL (optional)
 * - Curriculum Series (dropdown, optional)
 * - Lesson Number (number, optional)
 * - Description (textarea, optional)
 * - Is Special Event (checkbox)
 */
export function LessonFormModal({
  lesson,
  onClose,
  onSubmit,
  isSubmitting,
}: LessonFormModalProps) {
  const isEditMode = lesson !== null;

  const initialFormData = {
    name: lesson?.name || "",
    resource_url: lesson?.resource_url || "",
    curriculum_series: lesson?.curriculum_series || "",
    lesson_number: lesson?.lesson_number?.toString() || "",
    description: lesson?.description || "",
    is_special_event: lesson?.is_special_event || false,
  };

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens with different lesson
  useEffect(() => {
    const newFormData = {
      name: lesson?.name || "",
      resource_url: lesson?.resource_url || "",
      curriculum_series: lesson?.curriculum_series || "",
      lesson_number: lesson?.lesson_number?.toString() || "",
      description: lesson?.description || "",
      is_special_event: lesson?.is_special_event || false,
    };

    setFormData(newFormData);
    setErrors({});
  }, [lesson]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "O nome da lição é obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dataToSubmit: LessonInsert | LessonUpdate = {
      name: formData.name.trim(),
      resource_url: formData.resource_url.trim() || null,
      curriculum_series: formData.curriculum_series.trim() || null,
      lesson_number: formData.lesson_number
        ? parseInt(formData.lesson_number, 10)
        : null,
      description: formData.description.trim() || null,
      is_special_event: formData.is_special_event,
    };

    onSubmit(dataToSubmit);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in overflow-y-auto">
      <div className="flex items-start justify-center py-8 px-4 min-h-screen">
        <div
          className={`${theme.backgrounds.white} rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in`}
        >
          {/* Header */}
          <div
            className={`${theme.solids.primaryButton} p-5 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl`}
          >
            <h2 className={`text-2xl font-bold ${theme.text.onPrimaryButton}`}>
              {isEditMode ? "Editar Lição" : "Adicionar Lição"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className={`w-4 h-4 ${theme.text.onPrimaryButton}`} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Nome da Lição <span className={theme.text.error}>*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full px-4 py-3 text-sm ${inputClasses} ${errors.name ? theme.borders.error : ""}`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className={`text-sm ${theme.text.error} mt-1`}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Resource URL Field */}
            <div>
              <label
                htmlFor="resource_url"
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Link do Recurso (Google Drive)
              </label>
              <input
                type="url"
                id="resource_url"
                value={formData.resource_url}
                onChange={(e) =>
                  setFormData({ ...formData, resource_url: e.target.value })
                }
                className={`w-full px-4 py-3 text-sm ${inputClasses}`}
                placeholder="https://drive.google.com/..."
                disabled={isSubmitting}
              />
            </div>

            {/* Curriculum Series Dropdown */}
            <div>
              <label
                htmlFor="curriculum_series"
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Série do Currículo
              </label>
              <select
                id="curriculum_series"
                value={formData.curriculum_series}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    curriculum_series: e.target.value,
                  })
                }
                className={`w-full px-4 py-3 text-sm ${inputClasses}`}
                disabled={isSubmitting}
              >
                <option value="">Selecionar...</option>
                <option value="Q2">Q2</option>
                <option value="Q4">Q4</option>
                <option value="Q6">Q6</option>
                <option value="Holiday">Holiday</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Lesson Number */}
            <div>
              <label
                htmlFor="lesson_number"
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Número da Lição
              </label>
              <input
                type="number"
                id="lesson_number"
                value={formData.lesson_number}
                onChange={(e) =>
                  setFormData({ ...formData, lesson_number: e.target.value })
                }
                className={`w-full px-4 py-3 text-sm ${inputClasses}`}
                placeholder="1"
                min="1"
                disabled={isSubmitting}
              />
            </div>

            {/* Is Special Event Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_special_event"
                checked={formData.is_special_event}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_special_event: e.target.checked,
                  })
                }
                className={`w-5 h-5 ${theme.text.primary} rounded focus:ring-2 ${theme.rings.primary}`}
                disabled={isSubmitting}
              />
              <label
                htmlFor="is_special_event"
                className={`${theme.text.neutralDarker} font-bold text-xs cursor-pointer`}
              >
                Evento Especial (não-currículo)
              </label>
            </div>

            {/* Description Textarea */}
            <div>
              <label
                htmlFor="description"
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Descrição
              </label>
              <textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={`w-full px-4 py-3 text-sm ${inputClasses} resize-none`}
                rows={4}
                placeholder="Descrição da lição (opcional)"
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />A
                    guardar...
                  </>
                ) : (
                  <>{isEditMode ? "Guardar" : "Adicionar"}</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { AlertTriangle, Loader2, X } from "lucide-react";
import { useState } from "react";
import { buttonClasses, inputClasses, theme } from "../../../config/theme";
import type { Lesson } from "../../../types/database.types";

interface EditLessonDialogProps {
  lesson: Lesson;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    resourceUrl: string | null;
  }) => void;
  isSubmitting: boolean;
}

/**
 * Edit Lesson Dialog - Edit lesson metadata
 *
 * WARNING: Changes to lesson name or resource URL affect ALL schedules
 * that use this lesson across all dates.
 *
 * Fields:
 * - Lesson Name (required)
 * - Resource URL (optional - curriculum link)
 */
export function EditLessonDialog({
  lesson,
  onClose,
  onSubmit,
  isSubmitting,
}: EditLessonDialogProps) {
  const [formData, setFormData] = useState({
    name: lesson.name || "",
    resourceUrl: lesson.resource_url || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    onSubmit({
      name: formData.name.trim(),
      resourceUrl: formData.resourceUrl.trim() || null,
    });
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
              Editar Lição
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
            {/* Warning Banner */}
            <div
              className={`flex items-start gap-3 p-4 ${theme.backgrounds.warning} ${theme.borders.warning} border-2 rounded-xl`}
            >
              <AlertTriangle
                className={`w-5 h-5 ${theme.text.warning} flex-shrink-0 mt-0.5`}
              />
              <div>
                <p className={`text-sm font-semibold ${theme.text.warning}`}>
                  Atenção: Alterações Globais
                </p>
                <p className={`text-xs ${theme.text.warning} mt-1`}>
                  As alterações ao nome ou URL da lição afetarão{" "}
                  <strong>todas as datas</strong> onde esta lição é ensinada.
                </p>
              </div>
            </div>

            {/* Lesson Name */}
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
                className={`w-full px-4 py-3 text-sm ${inputClasses} ${
                  errors.name ? theme.borders.error : ""
                }`}
                placeholder="Nome da lição"
                disabled={isSubmitting}
                autoFocus
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
                htmlFor="resourceUrl"
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                URL do Currículo
              </label>
              <input
                type="url"
                id="resourceUrl"
                value={formData.resourceUrl}
                onChange={(e) =>
                  setFormData({ ...formData, resourceUrl: e.target.value })
                }
                className={`w-full px-4 py-3 text-sm ${inputClasses}`}
                placeholder="https://exemplo.com/licao"
                disabled={isSubmitting}
              />
              <p className={`text-xs ${theme.text.neutral} mt-1`}>
                Link para o currículo ou materiais da lição (opcional)
              </p>
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
                  <>Guardar Alterações</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

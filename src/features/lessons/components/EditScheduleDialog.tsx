import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { buttonClasses, inputClasses, theme } from "../../../config/theme";
import type { ServiceTime, ScheduleWithRelations } from "../../../types/database.types";
import { useQuery } from "@tanstack/react-query";
import { getActiveServiceTimes } from "../../../api/supabase/service-times";

interface EditScheduleDialogProps {
  schedule: ScheduleWithRelations;
  onClose: () => void;
  onSubmit: (data: {
    date: string;
    lessonId: number | null;
    serviceTimeId: number;
    eventType: string;
    notes: string | null;
  }) => void;
  isSubmitting: boolean;
}

/**
 * Edit Schedule Dialog - Edit an existing schedule
 *
 * Fields:
 * - Date (required)
 * - Service Time (required - 09:00 or 11:00)
 * - Event Type (optional - defaults to 'regular')
 * - Notes (optional)
 */
export function EditScheduleDialog({
  schedule,
  onClose,
  onSubmit,
  isSubmitting,
}: EditScheduleDialogProps) {
  // Fetch service times for the radio buttons
  const { data: serviceTimes = [] } = useQuery({
    queryKey: ["service-times"],
    queryFn: () => getActiveServiceTimes(),
  });

  const [formData, setFormData] = useState<{
    date: string;
    lessonId: number | null;
    serviceTimeId: number;
    eventType: "regular" | "family_service" | "cancelled" | "retreat" | "party";
    notes: string;
  }>({
    date: schedule.date,
    lessonId: schedule.lesson_id,
    serviceTimeId: schedule.service_time_id || serviceTimes[0]?.id || 0,
    eventType: (schedule.event_type as "regular" | "family_service" | "cancelled" | "retreat" | "party") || "regular",
    notes: schedule.notes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = "A data é obrigatória";
    }

    if (!formData.serviceTimeId) {
      newErrors.serviceTimeId = "A hora do culto é obrigatória";
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
      date: formData.date,
      lessonId: formData.lessonId,
      serviceTimeId: formData.serviceTimeId,
      eventType: formData.eventType,
      notes: formData.notes.trim() || null,
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
            {/* Lesson Name (Read-only) */}
            <div>
              <label
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Lição
              </label>
              <div
                className={`w-full px-4 py-3 text-sm ${theme.backgrounds.neutralLight} ${theme.text.neutralDarker} rounded-xl`}
              >
                {schedule.lesson?.name || "Sem lição"}
              </div>
            </div>

            {/* Date Field */}
            <div>
              <label
                htmlFor="date"
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Data <span className={theme.text.error}>*</span>
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={`w-full px-4 py-3 text-sm ${inputClasses} ${errors.date ? theme.borders.error : ""}`}
                disabled={isSubmitting}
              />
              {errors.date && (
                <p className={`text-sm ${theme.text.error} mt-1`}>
                  {errors.date}
                </p>
              )}
            </div>

            {/* Service Time Radio Buttons */}
            <div>
              <label
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Hora do Culto <span className={theme.text.error}>*</span>
              </label>
              <div className="flex gap-4">
                {serviceTimes.map((serviceTime: ServiceTime) => (
                  <label
                    key={serviceTime.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="serviceTime"
                      value={serviceTime.id}
                      checked={formData.serviceTimeId === serviceTime.id}
                      onChange={() =>
                        setFormData({ ...formData, serviceTimeId: serviceTime.id })
                      }
                      className={`w-5 h-5 ${theme.text.primary}`}
                      disabled={isSubmitting}
                    />
                    <span className={`text-sm ${theme.text.neutralDarker}`}>
                      {serviceTime.time}
                    </span>
                  </label>
                ))}
              </div>
              {errors.serviceTimeId && (
                <p className={`text-sm ${theme.text.error} mt-1`}>
                  {errors.serviceTimeId}
                </p>
              )}
            </div>

            {/* Event Type Dropdown */}
            <div>
              <label
                htmlFor="eventType"
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Tipo de Evento
              </label>
              <select
                id="eventType"
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value as "regular" | "family_service" | "cancelled" | "retreat" | "party" })
                }
                className={`w-full px-4 py-3 text-sm ${inputClasses}`}
                disabled={isSubmitting}
              >
                <option value="regular">Regular</option>
                <option value="family_service">Culto Familiar</option>
                <option value="retreat">Retiro</option>
                <option value="party">Festa</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Notes Textarea */}
            <div>
              <label
                htmlFor="notes"
                className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}
              >
                Notas
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className={`w-full px-4 py-3 text-sm ${inputClasses} resize-none`}
                rows={4}
                placeholder="Notas sobre este culto (opcional)"
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
                  <>Guardar</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

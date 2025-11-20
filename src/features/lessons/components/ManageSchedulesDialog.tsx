import { Loader2, X, Plus, Edit2, Trash2, Calendar, Clock } from "lucide-react";
import { useState } from "react";
import { buttonClasses, inputClasses, theme } from "../../../config/theme";
import type { ServiceTime, ScheduleWithRelations } from "../../../types/database.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getActiveServiceTimes } from "../../../api/supabase/service-times";
import {
  checkScheduleConflict,
  getSchedulesByLessonId,
  createSchedule,
  updateSchedule,
  deleteSchedule
} from "../../../api/supabase/schedules";
import { ConfirmDialog } from "../../../components/ui/ConfirmDialog";

interface ManageSchedulesDialogProps {
  lessonId: number;
  lessonName: string;
  onClose: () => void;
  onSuccess: () => void;
}

type ScheduleFormData = {
  date: string;
  serviceTimeId: number;
  eventType: "regular" | "family_service" | "cancelled" | "retreat" | "party";
  notes: string;
};

/**
 * Manage Schedules Dialog - Manage all schedule instances for a lesson
 *
 * Simple individual-save flow:
 * - Add button → Shows form → Save creates immediately
 * - Edit button → Inline form → Save updates immediately
 * - Delete button → Confirmation → Deletes immediately
 */
export function ManageSchedulesDialog({
  lessonId,
  lessonName,
  onClose,
  onSuccess,
}: ManageSchedulesDialogProps) {
  const queryClient = useQueryClient();

  // Fetch all schedules for this lesson
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["lesson-schedules", lessonId],
    queryFn: () => getSchedulesByLessonId(lessonId),
  });

  // Fetch service times
  const { data: serviceTimes = [] } = useQuery({
    queryKey: ["service-times"],
    queryFn: () => getActiveServiceTimes(),
  });

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState<ScheduleFormData>({
    date: "",
    serviceTimeId: 0,
    eventType: "regular",
    notes: "",
  });

  // Edit form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<ScheduleFormData>({
    date: "",
    serviceTimeId: 0,
    eventType: "regular",
    notes: "",
  });

  // Delete confirmation state
  const [scheduleToDelete, setScheduleToDelete] = useState<{ id: number; date: string; time: string } | null>(null);

  // Loading and error states
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper to get event type label
  const getEventTypeLabel = (eventType: string) => {
    const labels = {
      regular: "Regular",
      family_service: "Culto Familiar",
      cancelled: "Cancelado",
      retreat: "Retiro",
      party: "Festa",
    };
    return labels[eventType as keyof typeof labels] || eventType;
  };

  // Helper to get service time label (remove seconds if present)
  const getServiceTimeLabel = (serviceTimeId: number) => {
    const serviceTime = serviceTimes.find(st => st.id === serviceTimeId);
    if (!serviceTime?.time) return "---";
    return serviceTime.time.substring(0, 5);
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-PT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if schedule can be deleted (no attendance records)
  const canDelete = (schedule: ScheduleWithRelations) => {
    return !(schedule.attendance_records && schedule.attendance_records.length > 0);
  };

  // === ADD FORM HANDLERS ===
  const handleOpenAddForm = () => {
    setShowAddForm(true);
    setAddFormData({
      date: "",
      serviceTimeId: serviceTimes[0]?.id || 0,
      eventType: "regular",
      notes: "",
    });
    setErrors({});
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setErrors({});
  };

  const handleSaveAdd = async () => {
    setErrors({});

    // Validate
    const newErrors: Record<string, string> = {};
    if (!addFormData.date) newErrors.date = "A data é obrigatória";
    if (!addFormData.serviceTimeId) newErrors.serviceTime = "A hora do culto é obrigatória";

    // Check for conflicts
    if (addFormData.date && addFormData.serviceTimeId) {
      const hasConflict = await checkScheduleConflict(addFormData.date, addFormData.serviceTimeId);
      if (hasConflict) newErrors.date = "Já existe uma lição agendada para esta data e hora";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save
    setIsSaving(true);
    try {
      await createSchedule({
        date: addFormData.date,
        service_time_id: addFormData.serviceTimeId,
        event_type: addFormData.eventType,
        notes: addFormData.notes.trim() || null,
        lesson_id: lessonId,
        is_cancelled: addFormData.eventType === "cancelled",
      });

      // Invalidate all relevant queries to update both dialog and lesson detail page
      queryClient.invalidateQueries({ queryKey: ["lesson-schedules", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["lessons-unified"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-id", lessonId] });

      setShowAddForm(false);
    } catch (error) {
      console.error("Error creating schedule:", error);
      alert("Erro ao criar agendamento. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // === EDIT FORM HANDLERS ===
  const handleOpenEdit = (schedule: ScheduleWithRelations) => {
    setEditingId(schedule.id);
    setEditFormData({
      date: schedule.date,
      serviceTimeId: schedule.service_time_id || serviceTimes[0]?.id || 0,
      eventType: (schedule.event_type as any) || "regular",
      notes: schedule.notes || "",
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setErrors({});
  };

  const handleSaveEdit = async (scheduleId: number) => {
    setErrors({});

    // Validate
    const newErrors: Record<string, string> = {};
    if (!editFormData.date) newErrors.date = "A data é obrigatória";
    if (!editFormData.serviceTimeId) newErrors.serviceTime = "A hora do culto é obrigatória";

    // Check for conflicts (exclude current schedule)
    if (editFormData.date && editFormData.serviceTimeId) {
      const hasConflict = await checkScheduleConflict(editFormData.date, editFormData.serviceTimeId, scheduleId);
      if (hasConflict) newErrors.date = "Já existe uma lição agendada para esta data e hora";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save
    setIsSaving(true);
    try {
      await updateSchedule(scheduleId, {
        date: editFormData.date,
        service_time_id: editFormData.serviceTimeId,
        event_type: editFormData.eventType,
        notes: editFormData.notes.trim() || null,
        lesson_id: lessonId,
      });

      // Invalidate all relevant queries to update both dialog and lesson detail page
      queryClient.invalidateQueries({ queryKey: ["lesson-schedules", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["lessons-unified"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-id", lessonId] });

      setEditingId(null);
    } catch (error) {
      console.error("Error updating schedule:", error);
      alert("Erro ao atualizar agendamento. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  // === DELETE HANDLERS ===
  const handleOpenDelete = (schedule: ScheduleWithRelations) => {
    setScheduleToDelete({
      id: schedule.id,
      date: formatDate(schedule.date),
      time: getServiceTimeLabel(schedule.service_time_id || 0),
    });
  };

  const handleConfirmDelete = async () => {
    if (!scheduleToDelete) return;

    setIsSaving(true);
    try {
      await deleteSchedule(scheduleToDelete.id);

      // Invalidate all relevant queries to update both dialog and lesson detail page
      queryClient.invalidateQueries({ queryKey: ["lesson-schedules", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["lessons-unified"] });
      queryClient.invalidateQueries({ queryKey: ["lesson-id", lessonId] });

      setScheduleToDelete(null);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("Erro ao eliminar agendamento. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelDelete = () => {
    setScheduleToDelete(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in overflow-y-auto">
      <div className="flex items-start justify-center py-8 px-4 min-h-screen">
        <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl max-w-2xl w-full animate-scale-in`}>
          {/* Header */}
          <div className={`${theme.solids.primaryButton} p-5 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl`}>
            <div>
              <h2 className={`text-2xl font-bold ${theme.text.onPrimaryButton}`}>
                Gerir Agendamentos
              </h2>
              <p className={`text-sm ${theme.text.onPrimaryButton} opacity-90 mt-1`}>
                {lessonName}
              </p>
            </div>
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              disabled={isSaving}
            >
              <X className={`w-4 h-4 ${theme.text.onPrimaryButton}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Add Button - Hidden when form is open */}
            {!showAddForm && (
              <button
                onClick={handleOpenAddForm}
                className={`w-full px-5 py-3 ${buttonClasses.secondary} text-sm flex items-center justify-center gap-2`}
                disabled={isSaving || isLoading}
              >
                <Plus className="w-4 h-4" />
                Adicionar Data
              </button>
            )}

            {/* Add Form - Replaces button when open */}
            {showAddForm && (
              <div className={`${theme.backgrounds.neutralLight} rounded-xl p-4 space-y-3`}>
                <h3 className={`text-sm font-bold ${theme.text.primary} mb-3`}>Nova Data</h3>

                {/* Date */}
                <div>
                  <label className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>
                    Data <span className={theme.text.error}>*</span>
                  </label>
                  <input
                    type="date"
                    value={addFormData.date}
                    onChange={(e) => setAddFormData({ ...addFormData, date: e.target.value })}
                    className={`w-full px-4 py-3 text-sm ${inputClasses} ${errors.date ? theme.borders.error : ""}`}
                    disabled={isSaving}
                  />
                  {errors.date && <p className={`text-sm ${theme.text.error} mt-1`}>{errors.date}</p>}
                </div>

                {/* Service Time */}
                <div>
                  <label className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>
                    Hora do Culto <span className={theme.text.error}>*</span>
                  </label>
                  <div className="flex gap-4">
                    {serviceTimes.map((serviceTime: ServiceTime) => (
                      <label key={serviceTime.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="addServiceTime"
                          value={serviceTime.id}
                          checked={addFormData.serviceTimeId === serviceTime.id}
                          onChange={() => setAddFormData({ ...addFormData, serviceTimeId: serviceTime.id })}
                          className={`w-5 h-5 ${theme.text.primary}`}
                          disabled={isSaving}
                        />
                        <span className={`text-sm ${theme.text.neutralDarker}`}>
                          {getServiceTimeLabel(serviceTime.id)}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.serviceTime && <p className={`text-sm ${theme.text.error} mt-1`}>{errors.serviceTime}</p>}
                </div>

                {/* Event Type */}
                <div>
                  <label className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>
                    Tipo de Evento
                  </label>
                  <select
                    value={addFormData.eventType}
                    onChange={(e) => setAddFormData({ ...addFormData, eventType: e.target.value as any })}
                    className={`w-full px-4 py-3 text-sm ${inputClasses}`}
                    disabled={isSaving}
                  >
                    <option value="regular">Regular</option>
                    <option value="family_service">Culto Familiar</option>
                    <option value="retreat">Retiro</option>
                    <option value="party">Festa</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>Notas</label>
                  <textarea
                    value={addFormData.notes}
                    onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })}
                    className={`w-full px-4 py-3 text-sm ${inputClasses} resize-none`}
                    rows={3}
                    placeholder="Notas sobre este culto (opcional)"
                    disabled={isSaving}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCancelAdd}
                    className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveAdd}
                    className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center`}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        A guardar...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className={`w-8 h-8 animate-spin ${theme.text.primary}`} />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && schedules.length === 0 && !showAddForm && (
              <div className={`text-center py-8 ${theme.text.neutral}`}>
                <p className="text-sm">Nenhum agendamento ainda.</p>
                <p className="text-xs mt-2">Clique em "Adicionar Data" para começar.</p>
              </div>
            )}

            {/* Existing Schedules */}
            {schedules.map((schedule) => {
              const isEditing = editingId === schedule.id;
              const hasAttendance = schedule.attendance_records && schedule.attendance_records.length > 0;
              const attendanceCount = schedule.attendance_records?.length || 0;

              return (
                <div
                  key={schedule.id}
                  className={`${theme.backgrounds.white} border-2 ${theme.borders.neutralLight} rounded-xl p-4`}
                >
                  {!isEditing ? (
                    // Collapsed View
                    <>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Calendar className={`w-4 h-4 ${theme.text.primary} flex-shrink-0`} />
                              <span className={`text-sm font-bold ${theme.text.neutralDarker}`}>
                                {formatDate(schedule.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className={`w-4 h-4 ${theme.text.secondary} flex-shrink-0`} />
                              <span className={`text-sm ${theme.text.neutralDarker}`}>
                                {getServiceTimeLabel(schedule.service_time_id || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleOpenEdit(schedule)}
                            className={`p-2.5 ${theme.backgrounds.primaryLighter} ${theme.text.primary} rounded-lg hover:opacity-80 transition-opacity`}
                            disabled={isSaving}
                            title="Editar agendamento"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(schedule)}
                            className={`p-2.5 ${
                              canDelete(schedule)
                                ? `${theme.backgrounds.errorLight} ${theme.text.error} hover:opacity-80`
                                : `${theme.backgrounds.neutralLight} ${theme.text.neutral} opacity-40 cursor-not-allowed`
                            } rounded-lg transition-opacity`}
                            disabled={!canDelete(schedule) || isSaving}
                            title={
                              !canDelete(schedule)
                                ? "Não pode eliminar agendamentos com presenças registadas"
                                : "Eliminar agendamento"
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className={`text-xs ${theme.text.neutral}`}>
                        {getEventTypeLabel(schedule.event_type || "regular")}
                        {schedule.notes && ` • ${schedule.notes.substring(0, 40)}${schedule.notes.length > 40 ? "..." : ""}`}
                      </div>
                      {hasAttendance && (
                        <div className={`text-xs ${theme.text.warning} mt-1`}>
                          ⚠️ {attendanceCount} registo(s) de presenças
                        </div>
                      )}
                    </>
                  ) : (
                    // Edit Form
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`text-sm font-bold ${theme.text.primary}`}>Editar Agendamento</h3>
                      </div>

                      {/* Date */}
                      <div>
                        <label className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>
                          Data <span className={theme.text.error}>*</span>
                        </label>
                        <input
                          type="date"
                          value={editFormData.date}
                          onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                          className={`w-full px-4 py-3 text-sm ${inputClasses} ${errors.date ? theme.borders.error : ""}`}
                          disabled={isSaving}
                        />
                        {errors.date && <p className={`text-sm ${theme.text.error} mt-1`}>{errors.date}</p>}
                      </div>

                      {/* Service Time */}
                      <div>
                        <label className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>
                          Hora do Culto <span className={theme.text.error}>*</span>
                        </label>
                        <div className="flex gap-4">
                          {serviceTimes.map((serviceTime: ServiceTime) => (
                            <label key={serviceTime.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="editServiceTime"
                                value={serviceTime.id}
                                checked={editFormData.serviceTimeId === serviceTime.id}
                                onChange={() => setEditFormData({ ...editFormData, serviceTimeId: serviceTime.id })}
                                className={`w-5 h-5 ${theme.text.primary}`}
                                disabled={isSaving}
                              />
                              <span className={`text-sm ${theme.text.neutralDarker}`}>
                                {getServiceTimeLabel(serviceTime.id)}
                              </span>
                            </label>
                          ))}
                        </div>
                        {errors.serviceTime && <p className={`text-sm ${theme.text.error} mt-1`}>{errors.serviceTime}</p>}
                      </div>

                      {/* Event Type */}
                      <div>
                        <label className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>
                          Tipo de Evento
                        </label>
                        <select
                          value={editFormData.eventType}
                          onChange={(e) => setEditFormData({ ...editFormData, eventType: e.target.value as any })}
                          className={`w-full px-4 py-3 text-sm ${inputClasses}`}
                          disabled={isSaving}
                        >
                          <option value="regular">Regular</option>
                          <option value="family_service">Culto Familiar</option>
                          <option value="retreat">Retiro</option>
                          <option value="party">Festa</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className={`block ${theme.text.neutralDarker} font-bold mb-2 text-xs`}>Notas</label>
                        <textarea
                          value={editFormData.notes}
                          onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                          className={`w-full px-4 py-3 text-sm ${inputClasses} resize-none`}
                          rows={3}
                          placeholder="Notas sobre este culto (opcional)"
                          disabled={isSaving}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleCancelEdit}
                          className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-sm`}
                          disabled={isSaving}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveEdit(schedule.id)}
                          className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-sm flex items-center justify-center`}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              A guardar...
                            </>
                          ) : (
                            "Guardar"
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Close Button at Bottom */}
          <div className="p-5 border-t-2 border-gray-100">
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className={`w-full px-5 py-3 ${buttonClasses.secondary} text-sm`}
              disabled={isSaving}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {scheduleToDelete && (
        <ConfirmDialog
          title="Eliminar Agendamento?"
          message={`Tem a certeza que deseja eliminar o agendamento de:\n\n${scheduleToDelete.date} às ${scheduleToDelete.time}\n\nEsta ação não pode ser revertida.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={isSaving}
          loadingText="A eliminar..."
        />
      )}
    </div>
  );
}

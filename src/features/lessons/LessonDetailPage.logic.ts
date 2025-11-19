import { useState, useEffect } from 'react';
import { useLessonById, useEditAttendance, useAddAttendance, useDeleteAttendance } from './hooks/useLessons';
import type { AttendanceRecordWithRelations } from '../../types/database.types';
import { lightTap, successVibration } from '../../utils/haptics';
import { addVisitor } from '../../api/supabase/students';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { updateLesson } from '../../api/supabase/lessons';

/**
 * Business logic for Lesson Detail Page
 * Handles state management and operations for a specific lesson across multiple dates
 */
export function useLessonDetailLogic(
  lessonId: number,
  selectedDate?: string,
  initialServiceTimeId?: number,
  onViewStudent?: (studentId: number) => void,
  onRedoAttendance?: (scheduleDate: string, serviceTimeId: number) => void,
  onDateChange?: (date: string) => void
) {
  const queryClient = useQueryClient();

  // Fetch all schedules for this lesson
  const { dateGroup, availableDates, currentDate, isLoading, error } = useLessonById(lessonId, selectedDate);

  // Edit attendance mutation
  const { editAttendance, isEditing } = useEditAttendance();

  // Add attendance mutation
  const { addAttendance, isAdding } = useAddAttendance();

  // Delete attendance mutation
  const { deleteAttendance, isDeleting } = useDeleteAttendance();

  // Determine initial service time index
  const getInitialServiceTimeIndex = () => {
    if (!dateGroup) return 0;

    // If initialServiceTimeId is provided, find its index
    if (initialServiceTimeId) {
      const index = dateGroup.serviceTimes.findIndex(
        st => st.schedule.service_time_id === initialServiceTimeId
      );
      if (index !== -1) return index;
    }

    // Otherwise, find the index of 11:00 service time, default to 0 if not found
    const default11hIndex = dateGroup.serviceTimes.findIndex(
      st => st.schedule.service_time?.time === '11:00:00'
    );
    return default11hIndex !== -1 ? default11hIndex : 0;
  };

  const [selectedServiceTimeIndex, setSelectedServiceTimeIndex] = useState(0);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize selected service time index only once when data first loads
  useEffect(() => {
    if (dateGroup && !hasInitialized) {
      setSelectedServiceTimeIndex(getInitialServiceTimeIndex());
      setHasInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateGroup, hasInitialized]);

  // Reset initialization when initialServiceTimeId changes (navigating to different service time)
  useEffect(() => {
    if (initialServiceTimeId !== undefined) {
      setHasInitialized(false);
    }
  }, [initialServiceTimeId]);

  // Notes dialog state
  const [selectedRecordForNotes, setSelectedRecordForNotes] = useState<AttendanceRecordWithRelations | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

  // Add student dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addDialogScheduleId, setAddDialogScheduleId] = useState<number | null>(null);
  const [addDialogServiceTimeId, setAddDialogServiceTimeId] = useState<number | null>(null);

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<AttendanceRecordWithRelations | null>(null);

  // Create visitor dialog state
  const [isCreateVisitorDialogOpen, setIsCreateVisitorDialogOpen] = useState(false);
  const [isCreatingVisitor, setIsCreatingVisitor] = useState(false);
  const [visitorInitialName, setVisitorInitialName] = useState('');

  // Teacher assignment dialog state
  const [isTeacherAssignmentDialogOpen, setIsTeacherAssignmentDialogOpen] = useState(false);

  // Edit schedule dialog state
  const [isEditScheduleDialogOpen, setIsEditScheduleDialogOpen] = useState(false);

  // Edit lesson dialog state
  const [isEditLessonDialogOpen, setIsEditLessonDialogOpen] = useState(false);

  // Edit lesson mutation (lesson-level properties only)
  const editLessonMutation = useMutation({
    mutationFn: async (data: {
      lessonId: number;
      name: string;
      resourceUrl: string | null;
    }) => {
      // Update lesson properties only (affects all schedules using this lesson)
      return await updateLesson(data.lessonId, {
        name: data.name,
        resource_url: data.resourceUrl,
      });
    },
    onSuccess: () => {
      // Invalidate both the main lessons list and this specific lesson
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['lessons-list'] });
      queryClient.invalidateQueries({ queryKey: ['lesson-id', lessonId] });
    },
  });

  /**
   * Quick status change (no dialog) - used by tap-to-cycle and quick menu
   * Auto-saves immediately with optimistic updates
   */
  const handleQuickStatusChange = async (
    recordId: number,
    newStatus: 'present' | 'absent' | 'excused' | 'late'
  ) => {
    try {
      await editAttendance({ recordId, status: newStatus });
      successVibration();
    } catch (error) {
      console.error('Failed to quick-edit attendance:', error);
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Open notes dialog for a specific attendance record
   */
  const handleOpenNotes = (record: AttendanceRecordWithRelations) => {
    lightTap();
    setSelectedRecordForNotes(record);
    setIsNotesDialogOpen(true);
  };

  /**
   * Close notes dialog
   */
  const handleCloseNotes = () => {
    lightTap();
    setIsNotesDialogOpen(false);
    // Don't clear selectedRecordForNotes immediately to prevent flash during close animation
    setTimeout(() => setSelectedRecordForNotes(null), 300);
  };

  /**
   * Submit notes changes (keeps current status)
   */
  const handleSubmitNotes = async (recordId: number, notes: string) => {
    try {
      // Get the current record to preserve its status
      const currentRecord = selectedRecordForNotes;
      if (!currentRecord) return;

      await editAttendance({
        recordId,
        status: currentRecord.status,
        notes: notes ? notes : null, // Use null to clear, not undefined
      });
      successVibration();
      handleCloseNotes();
    } catch (error) {
      console.error('Failed to edit notes:', error);
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Open add student dialog for a specific schedule
   */
  const handleOpenAddDialog = (scheduleId: number, serviceTimeId: number | null) => {
    lightTap();
    setAddDialogScheduleId(scheduleId);
    setAddDialogServiceTimeId(serviceTimeId);
    setIsAddDialogOpen(true);
  };

  /**
   * Close add student dialog
   */
  const handleCloseAddDialog = () => {
    lightTap();
    setIsAddDialogOpen(false);
    // Clear state after animation
    setTimeout(() => {
      setAddDialogScheduleId(null);
      setAddDialogServiceTimeId(null);
    }, 300);
  };

  /**
   * Add student to attendance (as Present)
   */
  const handleAddStudent = async (studentId: number) => {
    if (!addDialogScheduleId) return;

    try {
      await addAttendance({
        studentId,
        scheduleId: addDialogScheduleId,
        status: 'present',
        serviceTimeId: addDialogServiceTimeId || undefined,
      });
      successVibration();
      handleCloseAddDialog();
    } catch (error) {
      console.error('Failed to add attendance:', error);
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Open delete confirmation dialog for a specific record
   */
  const handleOpenDeleteDialog = (record: AttendanceRecordWithRelations) => {
    lightTap();
    setRecordToDelete(record);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Close delete confirmation dialog
   */
  const handleCloseDeleteDialog = () => {
    lightTap();
    setIsDeleteDialogOpen(false);
    // Clear state after animation
    setTimeout(() => setRecordToDelete(null), 300);
  };

  /**
   * Confirm delete attendance record
   */
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      await deleteAttendance({ recordId: recordToDelete.id });
      successVibration();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error('Failed to delete attendance:', error);
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Open create visitor dialog
   */
  const handleOpenCreateVisitorDialog = (searchQuery: string) => {
    lightTap();
    setVisitorInitialName(searchQuery);
    setIsCreateVisitorDialogOpen(true);
  };

  /**
   * Close create visitor dialog
   */
  const handleCloseCreateVisitorDialog = () => {
    lightTap();
    setIsCreateVisitorDialogOpen(false);
    // Clear initial name after animation
    setTimeout(() => setVisitorInitialName(''), 300);
  };

  /**
   * Create visitor and add to attendance
   */
  const handleCreateVisitor = async (visitorName: string) => {
    if (!addDialogScheduleId) return;

    setIsCreatingVisitor(true);

    try {
      // First, create the visitor student
      const newVisitor = await addVisitor(visitorName);

      // Invalidate students cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['students'] });

      // Then add them to attendance as Present
      await addAttendance({
        studentId: newVisitor.id,
        scheduleId: addDialogScheduleId,
        status: 'present',
        serviceTimeId: addDialogServiceTimeId || undefined,
      });

      successVibration();
      handleCloseCreateVisitorDialog();
      handleCloseAddDialog(); // Also close the add dialog
    } catch (error) {
      console.error('Failed to create visitor and add attendance:', error);
      // Error will be shown by mutation hooks or thrown
    } finally {
      setIsCreatingVisitor(false);
    }
  };

  /**
   * Open teacher assignment dialog
   */
  const handleOpenTeacherAssignmentDialog = () => {
    lightTap();
    setIsTeacherAssignmentDialogOpen(true);
  };

  /**
   * Close teacher assignment dialog
   */
  const handleCloseTeacherAssignmentDialog = () => {
    lightTap();
    setIsTeacherAssignmentDialogOpen(false);
  };

  /**
   * Handle successful teacher assignment update
   * Refreshes the data to show updated assignments
   */
  const handleTeacherAssignmentSuccess = () => {
    successVibration();
    // Invalidate lessons query to refetch with updated assignments
    queryClient.invalidateQueries({ queryKey: ['lessons'] });
    queryClient.invalidateQueries({ queryKey: ['lesson-id', lessonId] });
  };

  /**
   * Handle date change from DateSelector
   */
  const handleDateChange = (newDate: string) => {
    lightTap();
    if (onDateChange) {
      onDateChange(newDate);
    }
  };

  /**
   * View student detail page
   */
  const handleViewStudent = (studentId: number) => {
    lightTap();
    if (onViewStudent) {
      onViewStudent(studentId);
    }
  };

  /**
   * Redo attendance for a specific schedule
   * Navigates to search marking page with pre-filled date and service time
   */
  const handleRedoAttendance = (scheduleId: number) => {
    lightTap();

    // Find the schedule in dateGroup
    const serviceTimeData = dateGroup?.serviceTimes.find(st => st.schedule.id === scheduleId);
    if (!serviceTimeData || !serviceTimeData.schedule.service_time_id || !onRedoAttendance) return;

    // Navigate to search marking with the schedule's date and service time
    const serviceTimeId = serviceTimeData.schedule.service_time_id;
    onRedoAttendance(currentDate, serviceTimeId);
  };

  /**
   * Handle service time tab change
   */
  const handleServiceTimeChange = (index: number) => {
    lightTap();
    setSelectedServiceTimeIndex(index);
  };

  /**
   * Open edit schedule dialog
   */
  const handleOpenEditScheduleDialog = () => {
    lightTap();
    setIsEditScheduleDialogOpen(true);
  };

  /**
   * Close edit schedule dialog
   */
  const handleCloseEditScheduleDialog = () => {
    lightTap();
    setIsEditScheduleDialogOpen(false);
  };

  /**
   * Open edit lesson dialog
   */
  const handleOpenEditLessonDialog = () => {
    lightTap();
    setIsEditLessonDialogOpen(true);
  };

  /**
   * Close edit lesson dialog
   */
  const handleCloseEditLessonDialog = () => {
    lightTap();
    setIsEditLessonDialogOpen(false);
  };

  /**
   * Submit edit lesson form (lesson-level properties only)
   * This affects ALL schedules that use this lesson
   */
  const handleEditLessonSubmit = async (data: {
    name: string;
    resourceUrl: string | null;
  }) => {
    const currentLesson = dateGroup?.serviceTimes[0]?.schedule.lesson;
    if (!currentLesson) return;

    try {
      await editLessonMutation.mutateAsync({
        lessonId: currentLesson.id,
        ...data,
      });
      successVibration();
      handleCloseEditLessonDialog();
    } catch (error) {
      console.error('Failed to edit lesson:', error);
      // Error handling is done by the mutation hook
    }
  };

  return {
    // Data
    dateGroup,
    availableDates,
    currentDate,
    isLoading,
    error,

    // Dialog state
    isEditing,

    // Notes dialog state
    isNotesDialogOpen,
    selectedRecordForNotes,

    // Add student dialog state
    isAddDialogOpen,
    addDialogScheduleId,
    addDialogServiceTimeId,
    isAdding,

    // Delete confirmation dialog state
    isDeleteDialogOpen,
    recordToDelete,
    isDeleting,

    // Create visitor dialog state
    isCreateVisitorDialogOpen,
    isCreatingVisitor,
    visitorInitialName,

    // Teacher assignment dialog state
    isTeacherAssignmentDialogOpen,

    // Edit schedule dialog state
    isEditScheduleDialogOpen,

    // Edit lesson dialog state
    isEditLessonDialogOpen,
    isEditingLesson: editLessonMutation.isPending,

    // Selected service time
    selectedServiceTimeIndex,

    // Actions
    handleQuickStatusChange,
    handleOpenNotes,
    handleCloseNotes,
    handleSubmitNotes,
    handleOpenAddDialog,
    handleCloseAddDialog,
    handleAddStudent,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete,
    handleOpenCreateVisitorDialog,
    handleCloseCreateVisitorDialog,
    handleCreateVisitor,
    handleOpenTeacherAssignmentDialog,
    handleCloseTeacherAssignmentDialog,
    handleTeacherAssignmentSuccess,
    handleViewStudent,
    handleRedoAttendance,
    handleServiceTimeChange,
    handleDateChange,
    handleOpenEditScheduleDialog,
    handleCloseEditScheduleDialog,
    handleOpenEditLessonDialog,
    handleCloseEditLessonDialog,
    handleEditLessonSubmit,
  };
}

import { useState, useMemo } from 'react';
import { useEditAttendance, useAddAttendance, useDeleteAttendance } from './hooks/useLessons';
import type { AttendanceRecordWithRelations, Lesson, LessonInsert, LessonUpdate, ScheduleWithRelations } from '../../types/database.types';
import { lightTap, successVibration } from '../../utils/haptics';
import { addVisitor } from '../../api/supabase/students';
import { getAllTeachers } from '../../api/supabase/teachers';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useLessonManagement } from '../../hooks/useLessonManagement';
import { useLessonsUnified } from './hooks/useLessonsUnified';
import { useFuseSearch } from '../../hooks/useFuseSearch';

/**
 * Business logic for Lessons Page
 * Handles state management, pagination, and edit operations
 */
export function useLessonsLogic(
  onViewStudent?: (studentId: number) => void,
  onRedoAttendance?: (scheduleDate: string, serviceTimeId: number) => void
) {
  const queryClient = useQueryClient();

  // Fetch all unified lessons (one entry per unique lesson with schedules aggregated)
  const {
    unifiedLessons,
    totalCount,
    scheduledCount,
    unscheduledCount,
    isLoading,
    error,
    refetch
  } = useLessonsUnified();

  // Edit attendance mutation
  const { editAttendance, isEditing } = useEditAttendance();

  // Add attendance mutation
  const { addAttendance, isAdding } = useAddAttendance();

  // Delete attendance mutation
  const { deleteAttendance, isDeleting } = useDeleteAttendance();

  // Lesson management (for creating/editing lessons in catalog)
  const { createLesson, updateLesson, isCreating: isCreatingLesson, isUpdating: isUpdatingLesson } = useLessonManagement();

  // Dialog state
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  // Lesson form modal state
  const [isLessonFormModalOpen, setIsLessonFormModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriodFilter, setTimePeriodFilter] = useState('all'); // 'past' | 'today' | 'future' | 'all'
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'has-attendance' | 'no-attendance' | 'all'
  const [teacherFilter, setTeacherFilter] = useState('all'); // 'all' | teacher ID
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch teachers for filter with TanStack Query
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: getAllTeachers,
    staleTime: 10 * 60 * 1000, // 10 minutes - teachers rarely change
  });

  // Filter groups configuration
  const filterGroups = [
    {
      id: 'timePeriod',
      label: 'Período',
      options: [
        { value: 'all', label: 'Todas' },
        { value: 'past', label: 'Passadas' },
        { value: 'today', label: 'Hoje' },
        { value: 'future', label: 'Futuras' },
      ],
    },
    {
      id: 'attendance',
      label: 'Presenças',
      options: [
        { value: 'all', label: 'Todas' },
        { value: 'has-attendance', label: 'Com Presenças' },
        { value: 'no-attendance', label: 'Sem Presenças' },
      ],
    },
    {
      id: 'teacher',
      label: 'Professor',
      options: [
        { value: 'all', label: 'Todos' },
        ...teachers.map((teacher) => ({
          value: teacher.id.toString(),
          label: teacher.name,
        })),
      ],
    },
  ];

  // Helper functions for filtering
  const hasActiveFilters = timePeriodFilter !== 'all' || attendanceFilter !== 'all' || teacherFilter !== 'all';

  const handleClearFilters = () => {
    setTimePeriodFilter('all');
    setAttendanceFilter('all');
    setTeacherFilter('all');
  };

  const handleFilterChange = (groupId: string, value: string) => {
    if (groupId === 'timePeriod') setTimePeriodFilter(value);
    if (groupId === 'attendance') setAttendanceFilter(value);
    if (groupId === 'teacher') setTeacherFilter(value);
  };

  // Use Fuse search on all unified lessons
  const { results: searchedLessons } = useFuseSearch({
    items: unifiedLessons || [],
    searchQuery,
    keys: ['lesson.name'],
  });

  // Apply filters to unified lessons
  const filteredLessons = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    const filtered = searchedLessons.filter((unifiedLesson) => {
      // Time period filter - check if ANY schedule matches the period
      if (timePeriodFilter !== 'all' && unifiedLesson.isScheduled) {
        const hasMatchingSchedule = unifiedLesson.schedules.some(schedule => {
          if (timePeriodFilter === 'past') return schedule.date < today;
          if (timePeriodFilter === 'today') return schedule.date === today;
          if (timePeriodFilter === 'future') return schedule.date > today;
          return false;
        });
        if (!hasMatchingSchedule) return false;
      }

      // If filtering by time period and lesson is unscheduled, exclude it
      if (timePeriodFilter !== 'all' && !unifiedLesson.isScheduled) return false;

      // Attendance filter - check if ANY schedule has attendance
      if (attendanceFilter !== 'all') {
        const hasAttendance = unifiedLesson.schedules.some(schedule =>
          (schedule.attendance_records as any[])?.length > 0
        );
        if (attendanceFilter === 'has-attendance' && !hasAttendance) return false;
        if (attendanceFilter === 'no-attendance' && hasAttendance) return false;
      }

      // Teacher filter - check if ANY schedule has the selected teacher assigned
      if (teacherFilter !== 'all') {
        const teacherId = parseInt(teacherFilter);
        const hasTeacher = unifiedLesson.schedules.some(schedule =>
          schedule.assignments?.some(assignment => assignment.teacher_id === teacherId)
        );
        if (!hasTeacher) return false;
      }

      return true;
    });

    return filtered;
  }, [searchedLessons, timePeriodFilter, attendanceFilter, teacherFilter]);

  // Separate scheduled and unscheduled for display
  const scheduledLessons = useMemo(() =>
    filteredLessons.filter(ul => ul.isScheduled),
    [filteredLessons]
  );

  const unscheduledLessons = useMemo(() =>
    filteredLessons.filter(ul => !ul.isScheduled),
    [filteredLessons]
  );

  /**
   * Open edit dialog for a specific attendance record
   */
  const handleOpenEdit = (record: AttendanceRecordWithRelations) => {
    lightTap();
    setSelectedRecord(record);
    setIsDialogOpen(true);
  };

  /**
   * Close edit dialog
   */
  const handleCloseEdit = () => {
    lightTap();
    setIsDialogOpen(false);
    // Don't clear selectedRecord immediately to prevent flash during close animation
    setTimeout(() => setSelectedRecord(null), 300);
  };

  /**
   * Submit edit changes
   */
  const handleSubmitEdit = async (
    recordId: number,
    status: 'present' | 'absent' | 'excused' | 'late',
    notes?: string
  ) => {
    try {
      await editAttendance({ recordId, status, notes });
      successVibration();
      handleCloseEdit();
    } catch (error) {
      console.error('Failed to edit attendance:', error);
      // Error handling is done by the mutation hook
    }
  };

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
   * Open lesson form modal for creating a new lesson
   */
  const handleAddLesson = () => {
    lightTap();
    setEditingLesson(null); // null = create mode
    setIsLessonFormModalOpen(true);
  };

  /**
   * Open lesson form modal for editing an existing lesson
   */
  const handleEditLesson = (lesson: Lesson) => {
    lightTap();
    setEditingLesson(lesson);
    setIsLessonFormModalOpen(true);
  };

  /**
   * Close lesson form modal
   */
  const handleCloseLessonForm = () => {
    lightTap();
    setIsLessonFormModalOpen(false);
    // Clear state after animation
    setTimeout(() => setEditingLesson(null), 300);
  };

  /**
   * Submit lesson form (create or update)
   */
  const handleSubmitLessonForm = async (data: LessonInsert | LessonUpdate) => {
    try {
      if (editingLesson) {
        // Edit mode
        await updateLesson({ id: editingLesson.id, updates: data });
      } else {
        // Create mode
        await createLesson(data as LessonInsert);
      }

      // Refresh the schedules data to reflect any changes
      await refetch();

      handleCloseLessonForm();
      successVibration();
    } catch (error) {
      console.error('Failed to save lesson:', error);
      // Error will be shown by mutation hooks
    }
  };

  /**
   * Refresh all data
   */
  const handleRefresh = async () => {
    lightTap();
    await refetch();
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

    // Find the schedule in unified lessons
    let foundSchedule: ScheduleWithRelations | undefined = undefined;
    for (const unifiedLesson of unifiedLessons || []) {
      foundSchedule = unifiedLesson.schedules.find(s => s.id === scheduleId);
      if (foundSchedule) break;
    }

    if (!foundSchedule || !foundSchedule.service_time_id || !onRedoAttendance) return;

    // Navigate to search marking with the schedule's date and service time
    onRedoAttendance(foundSchedule.date, foundSchedule.service_time_id);
  };

  return {
    // Data
    scheduledLessons, // Filtered scheduled lessons
    unscheduledLessons, // Filtered unscheduled lessons
    totalLessons: totalCount, // Total unique lessons (fixed counter!)
    scheduledCount,
    unscheduledCount,
    isLoading,
    error,

    // Dialog state
    isDialogOpen,
    selectedRecord,
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

    // Lesson form modal state
    isLessonFormModalOpen,
    editingLesson,
    isCreatingLesson,
    isUpdatingLesson,

    // Search and filter state
    searchQuery,
    setSearchQuery,
    timePeriodFilter,
    attendanceFilter,
    teacherFilter,
    isFilterOpen,
    setIsFilterOpen,
    filterGroups,
    hasActiveFilters,
    handleFilterChange,
    handleClearFilters,

    // Actions
    handleOpenEdit,
    handleCloseEdit,
    handleSubmitEdit,
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
    handleAddLesson,
    handleEditLesson,
    handleCloseLessonForm,
    handleSubmitLessonForm,
    handleViewStudent,
    handleRefresh,
    handleRedoAttendance,
  };
}

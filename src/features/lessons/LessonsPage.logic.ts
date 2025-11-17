import { useState, useMemo } from 'react';
import { useLessons, useEditAttendance, useAddAttendance, useDeleteAttendance } from './hooks/useLessons';
import type { AttendanceRecordWithRelations } from '../../types/database.types';
import { lightTap, successVibration } from '../../utils/haptics';
import { addVisitor } from '../../api/supabase/students';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Business logic for Lessons Page
 * Handles state management, pagination, and edit operations
 */
export function useLessonsLogic(
  onViewStudent?: (studentId: number) => void,
  onRedoAttendance?: (scheduleDate: string, serviceTimeId: number) => void,
  initialDate?: string,
  initialServiceTimeId?: number
) {
  const queryClient = useQueryClient();

  // Fetch all lessons at once (no pagination)
  const { history, isLoading, error, refetch } = useLessons();

  // Edit attendance mutation
  const { editAttendance, isEditing } = useEditAttendance();

  // Add attendance mutation
  const { addAttendance, isAdding } = useAddAttendance();

  // Delete attendance mutation
  const { deleteAttendance, isDeleting } = useDeleteAttendance();

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

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [timePeriodFilter, setTimePeriodFilter] = useState('all'); // 'past' | 'today' | 'future' | 'all'
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'has-attendance' | 'no-attendance' | 'all'
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
  ];

  // Helper functions for filtering
  const hasActiveFilters = timePeriodFilter !== 'all' || attendanceFilter !== 'all';

  const handleClearFilters = () => {
    setTimePeriodFilter('all');
    setAttendanceFilter('all');
  };

  const handleFilterChange = (groupId: string, value: string) => {
    if (groupId === 'timePeriod') setTimePeriodFilter(value);
    if (groupId === 'attendance') setAttendanceFilter(value);
  };

  // Apply filters to history
  const filteredLessons = useMemo(() => {
    if (!history) return [];

    const today = new Date().toISOString().split('T')[0];

    return history.filter((group) => {
      // Search filter - search in lesson name
      if (searchQuery) {
        const lessonName = group.serviceTimes[0]?.schedule.lesson?.name || '';
        if (!lessonName.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
      }

      // Time period filter
      if (timePeriodFilter === 'past' && group.date >= today) return false;
      if (timePeriodFilter === 'today' && group.date !== today) return false;
      if (timePeriodFilter === 'future' && group.date <= today) return false;

      // Attendance filter
      const hasAttendance = group.serviceTimes.some(st => st.records.length > 0);
      if (attendanceFilter === 'has-attendance' && !hasAttendance) return false;
      if (attendanceFilter === 'no-attendance' && hasAttendance) return false;

      return true;
    });
  }, [history, searchQuery, timePeriodFilter, attendanceFilter]);

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

    // Find the schedule in history (now grouped by date with multiple service times)
    const dateGroup = history?.find(g =>
      g.serviceTimes.some(st => st.schedule.id === scheduleId)
    );
    if (!dateGroup || !onRedoAttendance) return;

    // Find the specific service time
    const serviceTimeData = dateGroup.serviceTimes.find(st => st.schedule.id === scheduleId);
    if (!serviceTimeData || !serviceTimeData.schedule.service_time_id) return;

    // Navigate to search marking with the schedule's date and service time
    const serviceTimeId = serviceTimeData.schedule.service_time_id;
    onRedoAttendance(dateGroup.date, serviceTimeId);
  };

  return {
    // Data
    history: filteredLessons, // Use filtered lessons instead of raw history
    totalLessons: history?.length || 0, // Track total unfiltered count for ItemCount
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

    // Search and filter state
    searchQuery,
    setSearchQuery,
    timePeriodFilter,
    attendanceFilter,
    isFilterOpen,
    setIsFilterOpen,
    filterGroups,
    hasActiveFilters,
    handleFilterChange,
    handleClearFilters,

    // Initial navigation params
    initialDate,
    initialServiceTimeId,

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
    handleViewStudent,
    handleRefresh,
    handleRedoAttendance,
  };
}

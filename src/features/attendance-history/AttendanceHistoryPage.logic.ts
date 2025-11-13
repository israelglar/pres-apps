import { useState, useCallback } from 'react';
import { useAttendanceHistory, useEditAttendance } from './hooks/useAttendanceHistory';
import type { AttendanceRecordWithRelations } from '../../types/database.types';
import { lightTap, successVibration } from '../../utils/haptics';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';

/**
 * Business logic for Attendance History Page
 * Handles state management, pagination, and edit operations
 */
export function useAttendanceHistoryLogic() {
  // Service time tab state - default to 11:00 (11h service)
  const [selectedServiceTime, setSelectedServiceTime] = useState<'09:00:00' | '11:00:00'>('11:00:00');

  // Pagination state - starts with 5 dates
  const [limit, setLimit] = useState(5);

  // Fetch attendance history with current limit and service time filter
  const { history, isLoading, error, refetch } = useAttendanceHistory(limit, selectedServiceTime);

  // Edit attendance mutation
  const { editAttendance, isEditing } = useEditAttendance();

  // Dialog state
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Notes dialog state
  const [selectedRecordForNotes, setSelectedRecordForNotes] = useState<AttendanceRecordWithRelations | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);

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
        notes: notes || undefined,
      });
      successVibration();
      handleCloseNotes();
    } catch (error) {
      console.error('Failed to edit notes:', error);
      // Error handling is done by the mutation hook
    }
  };

  /**
   * Load more history dates (pagination)
   */
  const handleLoadMore = () => {
    lightTap();
    setLimit((prev) => prev + 5);
  };

  /**
   * Refresh all data
   */
  const handleRefresh = async () => {
    lightTap();
    await refetch();
  };

  /**
   * Switch between service time tabs
   */
  const handleServiceTimeChange = useCallback((serviceTime: '09:00:00' | '11:00:00') => {
    lightTap();
    setSelectedServiceTime(serviceTime);
    setLimit(5); // Reset to 5 when switching tabs
  }, []);

  /**
   * Swipe gesture for tab switching
   */
  const swipeGesture = useSwipeGesture({
    minSwipeDistance: 80,
    enabled: true,
    onSwipeLeft: useCallback(() => {
      // Swipe left: 11h -> 9h
      if (selectedServiceTime === '11:00:00') {
        handleServiceTimeChange('09:00:00');
      }
    }, [selectedServiceTime, handleServiceTimeChange]),
    onSwipeRight: useCallback(() => {
      // Swipe right: 9h -> 11h
      if (selectedServiceTime === '09:00:00') {
        handleServiceTimeChange('11:00:00');
      }
    }, [selectedServiceTime, handleServiceTimeChange]),
  });

  return {
    // Data
    history,
    isLoading,
    error,

    // Dialog state
    isDialogOpen,
    selectedRecord,
    isEditing,

    // Notes dialog state
    isNotesDialogOpen,
    selectedRecordForNotes,

    // Service time tab state
    selectedServiceTime,
    handleServiceTimeChange,

    // Swipe gesture
    swipeGesture,

    // Pagination
    limit,
    canLoadMore: history && history.length === limit,

    // Actions
    handleOpenEdit,
    handleCloseEdit,
    handleSubmitEdit,
    handleQuickStatusChange,
    handleOpenNotes,
    handleCloseNotes,
    handleSubmitNotes,
    handleLoadMore,
    handleRefresh,
  };
}

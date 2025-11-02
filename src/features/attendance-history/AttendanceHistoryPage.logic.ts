import { useState } from 'react';
import { useAttendanceHistory, useEditAttendance } from './hooks/useAttendanceHistory';
import type { AttendanceRecordWithRelations } from '../../types/database.types';
import { lightTap, successVibration } from '../../utils/haptics';

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
  const handleServiceTimeChange = (serviceTime: '09:00:00' | '11:00:00') => {
    lightTap();
    setSelectedServiceTime(serviceTime);
    setLimit(5); // Reset to 5 when switching tabs
  };

  return {
    // Data
    history,
    isLoading,
    error,

    // Dialog state
    isDialogOpen,
    selectedRecord,
    isEditing,

    // Service time tab state
    selectedServiceTime,
    handleServiceTimeChange,

    // Pagination
    limit,
    canLoadMore: history && history.length === limit,

    // Actions
    handleOpenEdit,
    handleCloseEdit,
    handleSubmitEdit,
    handleLoadMore,
    handleRefresh,
  };
}

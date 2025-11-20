/**
 * Core Attendance Hook
 * Shared logic for attendance marking features (search-marking and attendance-marking)
 */

import { useState, useEffect } from 'react';
import { useBlocker } from '@tanstack/react-router';
import { ATTENDANCE } from '../config/constants';
import { initHaptics, selectionTap } from '../utils/haptics';
import { useVisitorManagement, type Student } from './useVisitorManagement';
import type { AttendanceRecord } from '../types/attendance.types';

interface UseAttendanceCoreProps {
  visitorStudents: Student[];
}

export const useAttendanceCore = ({
  visitorStudents,
}: UseAttendanceCoreProps) => {
  // Core state
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Visitor management
  const visitorManagement = useVisitorManagement(visitorStudents);

  // Navigation blocking
  const hasUnsavedData =
    Object.keys(attendanceRecords).length > 0 && !isComplete;
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => hasUnsavedData,
    withResolver: true,
  });

  // Initialize haptics on mount
  useEffect(() => {
    initHaptics();
  }, []);

  // Navigation blocker handlers
  const handleConfirmLeave = () => {
    proceed?.();
  };

  const handleCancelLeave = () => {
    reset?.();
  };

  // Visitor addition handler
  const handleAddVisitor = async () => {
    let result;

    // Case 1: Existing visitor selected - mark them present
    if (visitorManagement.selectedVisitor) {
      result = visitorManagement.markExistingVisitor();
    } else {
      // Case 2: New visitor - create and mark present
      result = await visitorManagement.addNewVisitor();
    }

    if (result) {
      // Immediately mark visitor as present with notes
      const tempStudent: Student = {
        id: String(result.student.id),
        name: result.student.name,
        isVisitor: true,
      };

      // Mark as present and store notes in the record
      selectionTap();

      const newRecords = {
        ...attendanceRecords,
        [tempStudent.id]: {
          studentId: tempStudent.id,
          studentName: tempStudent.name,
          status: ATTENDANCE.STATUS.PRESENT,
          timestamp: new Date(),
          notes: result.notes,
        },
      };

      setAttendanceRecords(newRecords);

      return tempStudent;
    }

    return null;
  };

  return {
    // State
    attendanceRecords,
    setAttendanceRecords,
    isComplete,
    setIsComplete,
    isLoading,
    setIsLoading,
    blockerStatus: status,

    // Visitor management
    visitorManagement,

    // Handlers
    handleAddVisitor,
    handleConfirmLeave,
    handleCancelLeave,
  };
};

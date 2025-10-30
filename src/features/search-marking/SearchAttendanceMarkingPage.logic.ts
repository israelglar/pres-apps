import { useState, useEffect, useMemo, useRef } from "react";
import { useBlocker } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { initHaptics, selectionTap, successVibration } from "../../utils/haptics";

// Type definitions
export interface Student {
  id: string;
  name: string;
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: "P" | "F";
  timestamp: Date;
}

export interface SearchAttendanceMarkingPageProps {
  students: Student[];
  date: Date;
  lessonNames: Record<string, string>;
  onComplete: (records: AttendanceRecord[]) => void;
  onCancel: () => void;
}

export const useSearchAttendanceMarkingLogic = ({
  students,
  onComplete,
}: {
  students: Student[];
  onComplete: (records: AttendanceRecord[]) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [isComplete, setIsComplete] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use TanStack Router's navigation blocker with custom UI
  const hasUnsavedData =
    Object.keys(attendanceRecords).length > 0 && !isComplete;
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => hasUnsavedData,
    withResolver: true,
  });

  // Initialize haptics on component mount
  useEffect(() => {
    initHaptics();
  }, []);

  // Auto-focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Separate students into marked and unmarked, with marked at the bottom
  const { unmarkedStudents, markedStudents } = useMemo(() => {
    const unmarked: Student[] = [];
    const marked: Student[] = [];

    students.forEach((student) => {
      if (attendanceRecords[student.id]) {
        marked.push(student);
      } else {
        unmarked.push(student);
      }
    });

    return { unmarkedStudents: unmarked, markedStudents: marked };
  }, [students, attendanceRecords]);

  // Setup Fuse.js for fuzzy search on unmarked students
  const fuse = useMemo(() => {
    return new Fuse(unmarkedStudents, {
      keys: ["name"],
      threshold: 0.3, // 0 = perfect match, 1 = match anything
      includeScore: true,
    });
  }, [unmarkedStudents]);

  // Filter students based on search query
  const displayedStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return [...unmarkedStudents, ...markedStudents];
    }

    // Search only among unmarked students
    const searchResults = fuse.search(searchQuery);
    const filteredUnmarked = searchResults.map((result) => result.item);

    return [...filteredUnmarked, ...markedStudents];
  }, [searchQuery, unmarkedStudents, markedStudents, fuse]);

  const handleConfirmLeave = () => {
    // Allow navigation to proceed
    proceed?.();
  };

  const handleCancelLeave = () => {
    // Cancel navigation and stay on page
    reset?.();
  };

  const handleMarkPresent = (student: Student) => {
    selectionTap();

    const newRecords = {
      ...attendanceRecords,
      [student.id]: {
        studentId: student.id,
        studentName: student.name,
        status: "P" as const,
        timestamp: new Date(),
      },
    };

    setAttendanceRecords(newRecords);
    setSearchQuery(""); // Clear search after marking
    searchInputRef.current?.focus(); // Refocus search input
  };

  const handleUnmark = (studentId: string) => {
    selectionTap();
    const newRecords = { ...attendanceRecords };
    delete newRecords[studentId];
    setAttendanceRecords(newRecords);
  };

  const handleComplete = () => {
    successVibration();

    // Mark all unmarked students as absent
    const finalRecords: Record<string, AttendanceRecord> = {
      ...attendanceRecords,
    };

    students.forEach((student) => {
      if (!finalRecords[student.id]) {
        finalRecords[student.id] = {
          studentId: student.id,
          studentName: student.name,
          status: "F",
          timestamp: new Date(),
        };
      }
    });

    setIsComplete(true);

    // Show completion screen briefly before calling onComplete
    setTimeout(() => {
      onComplete(Object.values(finalRecords));
    }, 1500);
  };

  // Derived values
  const presentCount = Object.values(attendanceRecords).filter(
    (r) => r.status === "P"
  ).length;
  const totalCount = students.length;

  return {
    // State
    searchQuery,
    setSearchQuery,
    attendanceRecords,
    isComplete,
    searchInputRef,
    displayedStudents,
    presentCount,
    totalCount,
    blockerStatus: status,

    // Handlers
    handleMarkPresent,
    handleUnmark,
    handleComplete,
    handleConfirmLeave,
    handleCancelLeave,
  };
};

import { useState, useEffect, useMemo, useRef } from "react";
import { useBlocker } from "@tanstack/react-router";
import Fuse from "fuse.js";
import { initHaptics, selectionTap, successVibration } from "../../utils/haptics";
import { useVisitorManagement, type Student } from "../../hooks/useVisitorManagement";

// Type definitions
export type { Student };

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  status: "P" | "F";
  timestamp: Date;
  notes?: string;
}

export interface SearchAttendanceMarkingPageProps {
  students: Student[];
  visitorStudents: Student[];
  date: Date;
  lessonNames: Record<string, string>;
  onComplete: (records: AttendanceRecord[]) => void;
  onCancel: () => void;
}

export const useSearchAttendanceMarkingLogic = ({
  students,
  visitorStudents,
  onComplete,
}: {
  students: Student[];
  visitorStudents: Student[];
  onComplete: (records: AttendanceRecord[]) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [isComplete, setIsComplete] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Visitor management with existing visitors
  const visitorManagement = useVisitorManagement(visitorStudents);

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
          status: "P" as const,
          timestamp: new Date(),
          notes: result.notes,
        },
      };

      setAttendanceRecords(newRecords);
      setSearchQuery(""); // Clear search after marking
      searchInputRef.current?.focus(); // Refocus search input
    }
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

    setAttendanceRecords(finalRecords);
    setIsComplete(true);
  };

  const handleConfirmComplete = () => {
    onComplete(Object.values(attendanceRecords));
  };

  const handleGoBack = () => {
    // Remove all auto-marked absent records (only keep manually marked present)
    const manualRecords: Record<string, AttendanceRecord> = {};

    Object.entries(attendanceRecords).forEach(([studentId, record]) => {
      // Only keep records that were manually marked as present
      // Records marked as absent were auto-generated in handleComplete
      if (record.status === "P") {
        manualRecords[studentId] = record;
      }
    });

    setAttendanceRecords(manualRecords);
    setIsComplete(false);
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

    // Visitor management
    visitorManagement,

    // Handlers
    handleMarkPresent,
    handleUnmark,
    handleComplete,
    handleConfirmComplete,
    handleGoBack,
    handleAddVisitor,
    handleConfirmLeave,
    handleCancelLeave,
  };
};

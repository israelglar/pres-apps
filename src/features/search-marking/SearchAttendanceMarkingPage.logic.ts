import { useState, useEffect, useMemo, useRef } from "react";
import Fuse from "fuse.js";
import { selectionTap, successVibration } from "../../utils/haptics";
import { useAttendanceCore } from "../../hooks/useAttendanceCore";
import { useAbsenceAlerts } from "../../hooks/useAbsenceAlerts";
import type { Student, AttendanceRecord } from "../../types/attendance.types";

export interface SearchAttendanceMarkingPageProps {
  students: Student[];
  visitorStudents: Student[];
  date: Date;
  serviceTimeId: number;
  serviceTimes: Array<{ id: number; time: string; name: string }>;
  lessonNames: Record<string, string>;
  onComplete: (records: AttendanceRecord[]) => void | Promise<void>;
  onCancel: () => void;
}

export const useSearchAttendanceMarkingLogic = ({
  students,
  visitorStudents,
  date,
  onComplete,
}: {
  students: Student[];
  visitorStudents: Student[];
  date: Date;
  onComplete: (records: AttendanceRecord[]) => void | Promise<void>;
}) => {
  // Search-specific state
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [addedVisitors, setAddedVisitors] = useState<Student[]>([]); // Track visitors added during session

  // Use shared attendance core logic
  const {
    attendanceRecords,
    setAttendanceRecords,
    isComplete,
    setIsComplete,
    isLoading,
    setIsLoading,
    blockerStatus,
    visitorManagement,
    handleAddVisitor: coreHandleAddVisitor,
    handleConfirmLeave,
    handleCancelLeave,
  } = useAttendanceCore({
    visitorStudents,
  });

  // Fetch absence alerts for students
  const { alerts, dismissAlert } = useAbsenceAlerts({
    threshold: 3,
    currentDate: date.toISOString().split('T')[0], // Exclude current date from absence count
  });

  // Auto-focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Merge regular students with added visitors
  const allStudents = useMemo(() => {
    return [...students, ...addedVisitors];
  }, [students, addedVisitors]);

  // Separate students into marked and unmarked, with marked at the bottom
  const { unmarkedStudents, markedStudents } = useMemo(() => {
    const unmarked: Student[] = [];
    const marked: Student[] = [];

    allStudents.forEach((student) => {
      if (attendanceRecords[student.id]) {
        marked.push(student);
      } else {
        unmarked.push(student);
      }
    });

    return { unmarkedStudents: unmarked, markedStudents: marked };
  }, [allStudents, attendanceRecords]);

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
    const result = await coreHandleAddVisitor();

    if (result) {
      // Add visitor to local list
      setAddedVisitors(prev => [...prev, result]);

      // Search-specific: clear search and refocus
      setSearchQuery("");
      searchInputRef.current?.focus();
    }
  };

  const handleComplete = () => {
    successVibration();

    // Mark all unmarked students as absent
    const finalRecords: Record<string, AttendanceRecord> = {
      ...attendanceRecords,
    };

    allStudents.forEach((student) => {
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

  const handleConfirmComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete(Object.values(attendanceRecords));
    } finally {
      setIsLoading(false);
    }
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
  const totalCount = allStudents.length;

  return {
    // State
    searchQuery,
    setSearchQuery,
    attendanceRecords,
    isComplete,
    isLoading,
    searchInputRef,
    displayedStudents,
    presentCount,
    totalCount,
    blockerStatus,

    // Visitor management
    visitorManagement,

    // Absence alerts
    absenceAlerts: alerts,
    dismissAbsenceAlert: dismissAlert,

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

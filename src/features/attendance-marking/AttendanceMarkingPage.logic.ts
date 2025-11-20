import { useState, useEffect, useRef, useMemo } from "react";
import { ATTENDANCE, UI } from "../../config/constants";
import { selectionTap, successVibration } from "../../utils/haptics";
import { useAttendanceCore } from "../../hooks/useAttendanceCore";
import { useAbsenceAlerts } from "../../hooks/useAbsenceAlerts";
import type { Student, AttendanceRecord } from "../../types/attendance.types";

export interface AttendanceMarkingPageProps {
  students: Student[];
  visitorStudents: Student[];
  selectedDate: Date;
  serviceTimeId: number;
  serviceTimes: Array<{ id: number; time: string; name: string }>;
  lessonNames: Record<string, string>;
  onComplete: (records: AttendanceRecord[]) => void | Promise<void>;
  onCancel?: () => void;
}

export const useAttendanceMarkingLogic = ({
  students,
  visitorStudents,
  selectedDate,
  onComplete,
}: {
  students: Student[];
  visitorStudents: Student[];
  selectedDate: Date;
  onComplete: (records: AttendanceRecord[]) => void | Promise<void>;
}) => {
  // Swipe/sequential-specific state
  const [currentIndex, setCurrentIndex] = useState(0);
  const studentRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [addedVisitors, setAddedVisitors] = useState<Student[]>([]); // Track visitors added during session

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);

  // Minimum swipe distance (in px) to trigger action
  const minSwipeDistance = ATTENDANCE.MIN_SWIPE_DISTANCE;

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
    threshold: ATTENDANCE.ABSENCE_ALERT_THRESHOLD,
    currentDate: selectedDate.toISOString().split('T')[0], // Exclude current date from absence count
  });

  // Merge regular students with added visitors
  const allStudents = useMemo(() => {
    return [...students, ...addedVisitors];
  }, [students, addedVisitors]);

  // Derived values
  const currentStudent = allStudents[currentIndex];
  const completedCount = Object.keys(attendanceRecords).length;
  const progress = (completedCount / allStudents.length) * 100;

  // Auto-scroll to current student in side panel
  useEffect(() => {
    const currentRef = studentRefs.current[currentStudent.id];
    if (currentRef) {
      currentRef.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    }
  }, [currentIndex, currentStudent.id]);

  const findNextUnmarked = (records: Record<string, AttendanceRecord>) => {
    for (let i = currentIndex + 1; i < allStudents.length; i++) {
      if (!records[allStudents[i].id]) {
        setCurrentIndex(i);
        return;
      }
    }
    for (let i = 0; i < currentIndex; i++) {
      if (!records[allStudents[i].id]) {
        setCurrentIndex(i);
        return;
      }
    }
  };

  const handleMark = (status: typeof ATTENDANCE.STATUS.PRESENT | typeof ATTENDANCE.STATUS.ABSENT) => {
    // Haptic feedback for marking
    selectionTap();

    const newRecords = {
      ...attendanceRecords,
      [currentStudent.id]: {
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        status: status,
        timestamp: new Date(),
      },
    };

    setAttendanceRecords(newRecords);

    if (Object.keys(newRecords).length === allStudents.length) {
      // Success vibration when completing all students
      successVibration();
      setIsComplete(true);
    } else {
      setTimeout(() => {
        findNextUnmarked(newRecords);
      }, UI.TRANSITION_FAST);
    }
  };

  const handleClickHistory = (studentId: string) => {
    const index = allStudents.findIndex((s) => s.id === studentId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  };

  const handleUpdateNote = (studentId: string, note: string, isMarked: boolean) => {
    selectionTap(); // Haptic feedback on save

    if (isMarked) {
      // Student already marked - just update the note
      const existingRecord = attendanceRecords[studentId];
      setAttendanceRecords({
        ...attendanceRecords,
        [studentId]: {
          ...existingRecord,
          notes: note || undefined, // Clear note if empty string
        },
      });
    } else {
      // Student not marked yet - mark as Present and add note
      // (In swipe marking, this is less common but still supported)
      const student = allStudents.find(s => s.id === studentId);
      if (student) {
        setAttendanceRecords({
          ...attendanceRecords,
          [studentId]: {
            studentId: student.id,
            studentName: student.name,
            status: ATTENDANCE.STATUS.PRESENT,
            timestamp: new Date(),
            notes: note || undefined,
          },
        });
      }
    }
  };

  // Swipe gesture handlers
  const onTouchStart = (e: React.TouchEvent) => {
    // Don't allow new swipes while animating
    if (isAnimatingSwipe) return;

    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeOffset(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);

    if (touchStart !== null) {
      const offset = currentTouch - touchStart;
      // Limit the offset for visual feedback
      setSwipeOffset(Math.max(-ATTENDANCE.MAX_SWIPE_OFFSET, Math.min(ATTENDANCE.MAX_SWIPE_OFFSET, offset)));

      // Reset button backgrounds when swiping starts
      if (Math.abs(offset) > 10) {
        const buttons = document.querySelectorAll(".click-area-button");
        buttons.forEach((btn) => {
          if (btn instanceof HTMLElement) {
            const isLeft = btn.classList.contains("left-button");
            btn.style.background = isLeft
              ? "linear-gradient(to right, rgba(239, 68, 68, 0), transparent)"
              : "linear-gradient(to left, rgba(16, 185, 129, 0), transparent)";
          }
        });
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setSwipeOffset(0);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // Trigger completion animation
      setIsAnimatingSwipe(true);
      const targetOffset = isLeftSwipe ? -300 : 300;
      setSwipeOffset(targetOffset);

      // Reset after animation completes (200ms)
      setTimeout(() => {
        setTouchStart(null);
        setTouchEnd(null);
        setSwipeOffset(0);
        setIsAnimatingSwipe(false);
      }, 200);

      // Mark attendance
      if (isLeftSwipe) {
        handleMark(ATTENDANCE.STATUS.ABSENT);
      } else {
        handleMark(ATTENDANCE.STATUS.PRESENT);
      }
    } else {
      // Reset swipe state if threshold not met
      setTouchStart(null);
      setTouchEnd(null);
      setSwipeOffset(0);
    }
  };

  const handleAddVisitor = async () => {
    const result = await coreHandleAddVisitor();

    if (result) {
      // Add visitor to local list
      setAddedVisitors(prev => [...prev, result]);
    }

    return result;
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete(Object.values(attendanceRecords));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    // For swipe marking, all records are manually marked, so just go back
    setIsComplete(false);
  };

  return {
    // State
    currentIndex,
    attendanceRecords,
    isComplete,
    isLoading,
    studentRefs,
    swipeOffset,
    isAnimatingSwipe,
    currentStudent,
    completedCount,
    progress,
    blockerStatus,
    allStudents, // Export merged students list

    // Visitor management
    visitorManagement,

    // Absence alerts
    absenceAlerts: alerts,
    dismissAbsenceAlert: dismissAlert,

    // Handlers
    handleMark,
    handleClickHistory,
    handleUpdateNote,
    handleConfirmLeave,
    handleCancelLeave,
    handleAddVisitor,
    handleComplete,
    handleGoBack,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

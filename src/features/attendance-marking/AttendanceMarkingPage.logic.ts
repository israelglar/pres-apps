import { useState, useEffect, useRef } from "react";
import { selectionTap, successVibration } from "../../utils/haptics";
import { useAttendanceCore } from "../../hooks/useAttendanceCore";
import type { Student, AttendanceRecord } from "../../types/attendance.types";

export interface AttendanceMarkingPageProps {
  students: Student[];
  visitorStudents: Student[];
  selectedDate: Date;
  lessonNames: Record<string, string>;
  onComplete: (records: AttendanceRecord[]) => void | Promise<void>;
  onCancel?: () => void;
}

export const useAttendanceMarkingLogic = ({
  students,
  visitorStudents,
  onComplete,
}: {
  students: Student[];
  visitorStudents: Student[];
  onComplete: (records: AttendanceRecord[]) => void | Promise<void>;
}) => {
  // Swipe/sequential-specific state
  const [currentIndex, setCurrentIndex] = useState(0);
  const studentRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);

  // Minimum swipe distance (in px) to trigger action
  const minSwipeDistance = 50;

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

  // Derived values
  const currentStudent = students[currentIndex];
  const completedCount = Object.keys(attendanceRecords).length;
  const progress = (completedCount / students.length) * 100;

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
    for (let i = currentIndex + 1; i < students.length; i++) {
      if (!records[students[i].id]) {
        setCurrentIndex(i);
        return;
      }
    }
    for (let i = 0; i < currentIndex; i++) {
      if (!records[students[i].id]) {
        setCurrentIndex(i);
        return;
      }
    }
  };

  const handleMark = (status: "P" | "F") => {
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

    if (Object.keys(newRecords).length === students.length) {
      // Success vibration when completing all students
      successVibration();
      setIsComplete(true);
    } else {
      setTimeout(() => {
        findNextUnmarked(newRecords);
      }, 150);
    }
  };

  const handleClickHistory = (studentId: string) => {
    const index = students.findIndex((s) => s.id === studentId);
    if (index !== -1) {
      setCurrentIndex(index);
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
      setSwipeOffset(Math.max(-150, Math.min(150, offset)));

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
        handleMark("F");
      } else {
        handleMark("P");
      }
    } else {
      // Reset swipe state if threshold not met
      setTouchStart(null);
      setTouchEnd(null);
      setSwipeOffset(0);
    }
  };

  // Use core visitor handler directly (no additional logic needed for swipe marking)
  const handleAddVisitor = coreHandleAddVisitor;

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

    // Visitor management
    visitorManagement,

    // Handlers
    handleMark,
    handleClickHistory,
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

import { useState, useEffect, useRef } from "react";
import { useBlocker } from "@tanstack/react-router";
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

export interface AttendanceMarkingPageProps {
  students: Student[];
  selectedDate: Date;
  lessonNames: Record<string, string>;
  onComplete: (records: AttendanceRecord[]) => void;
  onCancel?: () => void;
}

export const useAttendanceMarkingLogic = ({
  students,
  onComplete,
}: {
  students: Student[];
  onComplete: (records: AttendanceRecord[]) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceRecord>
  >({});
  const [isComplete, setIsComplete] = useState(false);
  const studentRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimatingSwipe, setIsAnimatingSwipe] = useState(false);

  // Minimum swipe distance (in px) to trigger action
  const minSwipeDistance = 50;

  // Use TanStack Router's navigation blocker with custom UI
  const hasUnsavedData =
    Object.keys(attendanceRecords).length > 0 && !isComplete;
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => hasUnsavedData,
    withResolver: true,
  });

  // Derived values
  const currentStudent = students[currentIndex];
  const completedCount = Object.keys(attendanceRecords).length;
  const progress = (completedCount / students.length) * 100;

  // Initialize haptics on component mount (requires user interaction context)
  useEffect(() => {
    initHaptics();
  }, []);

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

  const handleConfirmLeave = () => {
    // Allow navigation to proceed
    proceed?.();
  };

  const handleCancelLeave = () => {
    // Cancel navigation and stay on page
    reset?.();
  };

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
      setTimeout(() => {
        onComplete(Object.values(newRecords));
      }, 2000);
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

  return {
    // State
    currentIndex,
    attendanceRecords,
    isComplete,
    studentRefs,
    swipeOffset,
    isAnimatingSwipe,
    currentStudent,
    completedCount,
    progress,
    blockerStatus: status,

    // Handlers
    handleMark,
    handleClickHistory,
    handleConfirmLeave,
    handleCancelLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};

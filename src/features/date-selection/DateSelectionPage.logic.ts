import { useState, useEffect, useMemo, useRef } from 'react';
import { getClosestSunday } from '../../utils/helperFunctions';
import type { Schedule } from '../../schemas/attendance.schema';
import type { ScheduleAssignment } from '../../types/database.types';

export interface UseDateSelectionLogicProps {
  getAvailableDates: () => Date[];
  serviceTimes: Array<{ id: number; name: string; time: string }>;
  getSchedule: (
    date: string,
    serviceTimeId: number | null
  ) => (Schedule & { assignments?: (ScheduleAssignment & { teacher?: { name: string } })[] }) | undefined;
}

/**
 * Get default service time ID
 * Always defaults to 11h service (ID: 2)
 */
function getDefaultServiceTimeId(): number {
  return 2; // 11h service (default)
}

/**
 * Get the most recent lesson date (today if there's a lesson, otherwise the closest past date)
 */
function getMostRecentLessonDate(availableDates: Date[]): Date {
  if (availableDates.length === 0) {
    // Fallback to closest Sunday if no scheduled dates exist (edge case during initial setup)
    return getClosestSunday();
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort dates in descending order (most recent first)
  const sortedDates = [...availableDates].sort((a, b) => b.getTime() - a.getTime());

  // Find the most recent date that is today or in the past
  const mostRecentDate = sortedDates.find((date) => {
    const dateTime = new Date(date);
    dateTime.setHours(0, 0, 0, 0);
    return dateTime.getTime() <= today.getTime();
  });

  // If we found a date, return it; otherwise return the first available date
  return mostRecentDate || sortedDates[0];
}

/**
 * Business logic for Date Selection Page
 * Handles date selection, dropdown, method dialog, and filtering
 */
export function useDateSelectionLogic({
  getAvailableDates,
  serviceTimes,
  getSchedule
}: UseDateSelectionLogicProps) {
  const [selectedServiceTimeId, setSelectedServiceTimeId] = useState(getDefaultServiceTimeId());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'search' | 'swipe'>('search');
  const [showMethodInfo, setShowMethodInfo] = useState<'search' | 'swipe' | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Get all available dates (showing all scheduled dates regardless of service time)
  const availableDates = useMemo(() => {
    return getAvailableDates();
  }, [getAvailableDates]);

  // Get the most recent lesson date based on available dates
  const defaultDate = useMemo(() => {
    return getMostRecentLessonDate(availableDates);
  }, [availableDates]);

  const [selectedDate, setSelectedDate] = useState(defaultDate);

  // Update selected date when available dates change
  useEffect(() => {
    // Check if the currently selected date is still available
    const isSelectedDateAvailable = availableDates.some(
      (date) => date.toISOString() === selectedDate.toISOString()
    );

    // Only reset the date if the current selection is NOT available anymore
    if (!isSelectedDateAvailable) {
      const newDefaultDate = getMostRecentLessonDate(availableDates);
      setSelectedDate(newDefaultDate);
    }
  }, [availableDates, selectedDate]);

  // Auto-select first available service time when date changes
  useEffect(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];

    // Get service times that have schedules for this date
    const availableServiceTimes = serviceTimes.filter((st) => {
      const schedule = getSchedule(dateStr, st.id);
      return !!schedule;
    });

    // Check if currently selected service time has a schedule
    const currentIsAvailable = availableServiceTimes.some(
      (st) => st.id === selectedServiceTimeId
    );

    // If current selection is not available and there are available service times,
    // select the first one
    if (!currentIsAvailable && availableServiceTimes.length > 0) {
      setSelectedServiceTimeId(availableServiceTimes[0].id);
    }
  }, [selectedDate, serviceTimes, getSchedule, selectedServiceTimeId]);

  // Get all scheduled dates sorted in ascending order (oldest first)
  const sortedDates = useMemo(() => {
    // Sort dates in ascending order (oldest first)
    return [...availableDates].sort((a, b) => a.getTime() - b.getTime());
  }, [availableDates]);


  // Helper functions
  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) {
      return 'Hoje';
    }
    return null;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll to selected item when dropdown opens
  useEffect(() => {
    if (isOpen && selectedItemRef.current && dropdownListRef.current) {
      setTimeout(() => {
        if (selectedItemRef.current && dropdownListRef.current) {
          const listElement = dropdownListRef.current;
          const itemElement = selectedItemRef.current;

          const listHeight = listElement.clientHeight;
          const itemTop = itemElement.offsetTop;
          const itemHeight = itemElement.clientHeight;

          listElement.scrollTop = itemTop - listHeight / 2 + itemHeight / 2;
        }
      }, 10);
    }
  }, [isOpen]);

  return {
    // State
    selectedDate,
    selectedServiceTimeId,
    isOpen,
    selectedMethod,
    showMethodInfo,
    sortedDates,

    // Refs
    dropdownRef,
    dropdownListRef,
    selectedItemRef,

    // Actions
    setSelectedDate,
    setSelectedServiceTimeId,
    setIsOpen,
    setSelectedMethod,
    setShowMethodInfo,

    // Helpers
    isToday,
    getDateLabel,
  };
}

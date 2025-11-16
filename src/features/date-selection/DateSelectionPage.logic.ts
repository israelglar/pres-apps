import { useState, useEffect, useMemo, useRef } from 'react';
import { getClosestSunday } from '../../utils/helperFunctions';

export interface UseDateSelectionLogicProps {
  getAvailableDates: (serviceTimeId?: number | null) => Date[];
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
export function useDateSelectionLogic({ getAvailableDates }: UseDateSelectionLogicProps) {
  const [selectedServiceTimeId, setSelectedServiceTimeId] = useState(getDefaultServiceTimeId());
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'search' | 'swipe'>('search');
  const [showMethodInfo, setShowMethodInfo] = useState<'search' | 'swipe' | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  // Get dates available for the selected service time
  const availableDatesForService = useMemo(() => {
    return getAvailableDates(selectedServiceTimeId);
  }, [getAvailableDates, selectedServiceTimeId]);

  // Get the most recent lesson date based on available dates for the selected service
  const defaultDate = useMemo(() => {
    return getMostRecentLessonDate(availableDatesForService);
  }, [availableDatesForService]);

  const [selectedDate, setSelectedDate] = useState(defaultDate);

  // Update selected date when service time changes or available dates change
  useEffect(() => {
    // Check if the currently selected date is available for the new service time
    const isSelectedDateAvailable = availableDatesForService.some(
      (date) => date.toISOString() === selectedDate.toISOString()
    );

    // Only reset the date if the current selection is NOT available for the new service time
    if (!isSelectedDateAvailable) {
      const newDefaultDate = getMostRecentLessonDate(availableDatesForService);
      setSelectedDate(newDefaultDate);
    }
  }, [availableDatesForService, selectedDate]);

  // Get all sundays sorted in ascending order (oldest first)
  const filteredSundays = useMemo(() => {
    // Sort dates in ascending order (oldest first)
    return [...availableDatesForService].sort((a, b) => a.getTime() - b.getTime());
  }, [availableDatesForService]);

  // Get the most recent past Sunday with a lesson (for "Domingo Passado" label)
  const mostRecentPastSunday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter to past dates only (not today)
    const pastDates = availableDatesForService.filter((date) => {
      const dateTime = new Date(date);
      dateTime.setHours(0, 0, 0, 0);
      return dateTime.getTime() < today.getTime();
    });

    if (pastDates.length === 0) return null;

    // Sort in descending order and get the most recent
    const sortedPastDates = [...pastDates].sort((a, b) => b.getTime() - a.getTime());
    return sortedPastDates[0];
  }, [availableDatesForService]);

  // Helper functions
  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const isPreviousSunday = (date: Date) => {
    if (!mostRecentPastSunday) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const mostRecentDate = new Date(mostRecentPastSunday);
    mostRecentDate.setHours(0, 0, 0, 0);

    return checkDate.getTime() === mostRecentDate.getTime() && !isToday(date);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) {
      return 'Hoje';
    } else if (isPreviousSunday(date)) {
      return 'Domingo Passado';
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
    filteredSundays,

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
    isPreviousSunday,
    getDateLabel,
  };
}

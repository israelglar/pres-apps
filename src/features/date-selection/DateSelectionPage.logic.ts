import { useState, useEffect, useMemo, useRef } from 'react';
import { getClosestSunday } from '../../utils/helperFunctions';

export interface UseDateSelectionLogicProps {
  allSundays: Date[];
}

/**
 * Business logic for Date Selection Page
 * Handles date selection, dropdown, method dialog, and filtering
 */
export function useDateSelectionLogic({ allSundays }: UseDateSelectionLogicProps) {
  const [selectedDate, setSelectedDate] = useState(getClosestSunday());
  const [isOpen, setIsOpen] = useState(false);
  const [showMethodDialog, setShowMethodDialog] = useState(false);
  const [showFutureLessons, setShowFutureLessons] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownListRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLButtonElement>(null);
  const closestSunday = getClosestSunday();

  // Filter sundays based on showFutureLessons
  const filteredSundays = useMemo(() => {
    if (showFutureLessons) {
      return allSundays;
    }

    // Only show current and past sundays
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allSundays.filter((sunday) => {
      const sundayDate = new Date(sunday);
      sundayDate.setHours(0, 0, 0, 0);
      return sundayDate <= today;
    });
  }, [allSundays, showFutureLessons]);

  // Helper functions
  const isToday = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate.getTime() === today.getTime();
  };

  const isPreviousSunday = (date: Date) => {
    return (
      date.toDateString() === closestSunday.toDateString() && !isToday(date)
    );
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
    isOpen,
    showMethodDialog,
    showFutureLessons,
    filteredSundays,

    // Refs
    dropdownRef,
    dropdownListRef,
    selectedItemRef,

    // Actions
    setSelectedDate,
    setIsOpen,
    setShowMethodDialog,
    setShowFutureLessons,

    // Helpers
    isToday,
    isPreviousSunday,
    getDateLabel,
  };
}

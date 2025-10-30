import { create } from 'zustand';

/**
 * Attendance marking state
 */
interface AttendanceStore {
  // Current marking session state
  selectedDate: Date | null;
  selectedMethod: 'swipe' | 'search' | null;

  // Actions
  setSelectedDate: (date: Date | null) => void;
  setSelectedMethod: (method: 'swipe' | 'search' | null) => void;
  resetSession: () => void;
}

/**
 * Zustand store for attendance-related state
 *
 * This replaces the complex state management in App.tsx
 * and provides a cleaner separation of concerns
 */
export const useAttendanceStore = create<AttendanceStore>((set) => ({
  // Initial state
  selectedDate: null,
  selectedMethod: null,

  // Actions
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedMethod: (method) => set({ selectedMethod: method }),
  resetSession: () =>
    set({
      selectedDate: null,
      selectedMethod: null,
    }),
}));

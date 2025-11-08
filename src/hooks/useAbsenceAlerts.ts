/**
 * Hook to manage absence alerts for students
 * Fetches alerts dynamically and manages dismiss state in memory
 */

import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { getAbsenceAlertsForSchedule } from '../api/supabase/absence-alerts';
import type { AbsenceAlert, AbsenceAlertsMap } from '../types/absence-alerts.types';

interface UseAbsenceAlertsOptions {
  /** Number of consecutive absences to trigger alert (default: 3) */
  threshold?: number;

  /** Whether to enable the query (default: true) */
  enabled?: boolean;
}

interface UseAbsenceAlertsReturn {
  /** Map of student IDs to their absence alerts (excluding dismissed) */
  alerts: AbsenceAlertsMap;

  /** All alerts including dismissed ones */
  allAlerts: AbsenceAlertsMap;

  /** Set of student IDs with dismissed alerts */
  dismissedStudentIds: Set<number>;

  /** Dismiss an alert for a student (in memory, session only) */
  dismissAlert: (studentId: number) => void;

  /** Whether alerts are currently loading */
  isLoading: boolean;

  /** Error if alert fetch failed */
  error: Error | null;

  /** Refetch alerts */
  refetch: () => void;
}

/**
 * Hook to fetch and manage absence alerts for all active students
 *
 * Alerts are calculated in runtime based on recent attendance records.
 * Dismissed alerts are stored in memory and reset when the page reloads.
 *
 * @example
 * ```tsx
 * const { alerts, dismissAlert, isLoading } = useAbsenceAlerts({
 *   threshold: 3
 * });
 *
 * // Check if student has an alert
 * const hasAlert = alerts.has(student.id);
 *
 * // Dismiss an alert
 * dismissAlert(student.id);
 * ```
 */
export function useAbsenceAlerts({
  threshold = 3,
  enabled = true,
}: UseAbsenceAlertsOptions): UseAbsenceAlertsReturn {
  console.log('🎣 [useAbsenceAlerts Hook] Called with:', { threshold, enabled });

  // Track dismissed alerts in memory (resets on page reload)
  const [dismissedStudentIds, setDismissedStudentIds] = useState<Set<number>>(new Set());

  // Fetch alerts using TanStack Query
  const {
    data: alertsArray,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['absence-alerts', threshold],
    queryFn: async () => {
      return await getAbsenceAlertsForSchedule(threshold);
    },
    enabled: enabled,
    staleTime: 55 * 60 * 1000, // 55 minutes (same as attendance data)
    gcTime: 60 * 60 * 1000, // 60 minutes
    refetchOnWindowFocus: false,
  });

  // Convert array to map for easy lookup
  const allAlerts = useMemo<AbsenceAlertsMap>(() => {
    const map = new Map<number, AbsenceAlert>();
    alertsArray?.forEach((alert) => {
      map.set(alert.studentId, alert);
    });
    console.log('🗺️ [useAbsenceAlerts Hook] All alerts map:', map.size, 'alerts');
    return map;
  }, [alertsArray]);

  // Filter out dismissed alerts
  const alerts = useMemo<AbsenceAlertsMap>(() => {
    const map = new Map<number, AbsenceAlert>();
    alertsArray?.forEach((alert) => {
      if (!dismissedStudentIds.has(alert.studentId)) {
        map.set(alert.studentId, alert);
      }
    });
    console.log('✨ [useAbsenceAlerts Hook] Active alerts (after dismiss):', map.size, 'alerts');
    console.log('  Dismissed students:', Array.from(dismissedStudentIds));
    return map;
  }, [alertsArray, dismissedStudentIds]);

  // Dismiss an alert (in memory only)
  const dismissAlert = useCallback((studentId: number) => {
    setDismissedStudentIds((prev) => new Set(prev).add(studentId));
  }, []);

  return {
    alerts,
    allAlerts,
    dismissedStudentIds,
    dismissAlert,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

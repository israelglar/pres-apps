import { RouterProvider } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { bulkUpdateAttendance, getAttendance } from "./api/attendance";
import { SavingOverlay } from "./components/SavingOverlay";
import { router } from "./router";
import { getCachedData, setCachedData } from "./utils/cache";

interface AttendanceData {
  success: boolean;
  dates: string[];
  lessonNames: Record<string, string>;
  students: Array<{ name: string }>;
}

export default function App() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); // Track if we've already fetched
  const [pendingNavigation, setPendingNavigation] = useState(false); // Track if user clicked before data ready
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render when pendingNavigation changes

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Prevent double fetch on React StrictMode remount
    if (hasFetched && !forceRefresh) {
      return;
    }

    setHasFetched(true);
    setIsLoading(true);
    setError(null);

    try {
      // Skip cache if force refresh
      if (!forceRefresh) {
        // Try to get cached data first
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setIsDataReady(true);
          setIsLoading(false);
          return;
        }
      }

      // If no cache or force refresh, fetch from API
      const result = await getAttendance();
      setData(result);
      setIsDataReady(true);

      // Cache the fetched data
      setCachedData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
      setIsDataReady(false);
    } finally {
      setIsLoading(false);
    }
  }, [hasFetched]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const result = await getAttendance();
      setData(result);
      setIsDataReady(true);
      setCachedData(result);
    } catch (err: any) {
      // Silently fail on refresh - don't show error, just stop refreshing
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Start loading data in background only once
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allSundays = useMemo(() => {
    return data ? data.dates.map((d) => new Date(d)) : [];
  }, [data]);

  const lessonNames = useMemo(() => {
    return data ? data.lessonNames : {};
  }, [data]);

  const students = useMemo(() => {
    return data
      ? data.students
          .map((s, id) => ({ id, name: s.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [data]);

  const handleComplete = useCallback(async (records: any[], selectedDate: string) => {
    setSaving(true);
    setSaveError(null);

    try {
      // Transform records to match API format
      const attendanceRecords = records.map((record) => ({
        name: record.studentName,
        date: new Date(selectedDate),
        status: record.status,
      }));

      // Save to Google Sheets
      await bulkUpdateAttendance(attendanceRecords);

      // Wait a moment to show success message
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (err: any) {
      setSaveError(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  }, []);

  const retryLoadData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const requestNavigation = useCallback(() => {
    setPendingNavigation(true);
    // Force router to re-render immediately to show overlay
    setForceUpdate(prev => prev + 1);
  }, []);

  const cancelNavigation = useCallback(() => {
    setPendingNavigation(false);
  }, []);

  // Memoize the context to prevent unnecessary re-renders
  // Note: pendingNavigation is NOT in dependencies - we update it without recreating context
  const routerContext = useMemo(() => {
    return {
      allSundays,
      lessonNames,
      students,
      handleComplete,
      handleRefresh,
      isRefreshing: refreshing,
      isDataReady,
      isLoading,
      dataError: error,
      retryLoadData,
      pendingNavigation,
      requestNavigation,
      cancelNavigation,
    };
  }, [allSundays, lessonNames, students, handleComplete, handleRefresh, refreshing, isDataReady, isLoading, error, retryLoadData, pendingNavigation, requestNavigation, cancelNavigation]);

  // Force key to change when data state changes OR when forceUpdate changes
  // forceUpdate changes when pendingNavigation is set, ensuring immediate re-render with overlay
  const routerKey = `router-${isDataReady}-${isLoading}-${forceUpdate}`;

  return (
    <>
      {saving && (
        <SavingOverlay
          error={saveError}
          onRetry={() => {
            setSaveError(null);
            // Note: We can't easily retry from here, user will need to re-mark
            setSaving(false);
          }}
        />
      )}

      <RouterProvider
        key={routerKey}
        router={router}
        context={routerContext}
      />
    </>
  );
}

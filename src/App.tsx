import { useEffect, useMemo, useState } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { bulkUpdateAttendance, getAttendance } from "./api/attendance";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { SavingOverlay } from "./components/SavingOverlay";
import { getCachedData, setCachedData } from "./utils/cache";
import { router } from "./router";

interface AttendanceData {
  success: boolean;
  dates: string[];
  students: Array<{ name: string }>;
}

export default function App() {
  const [data, setData] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      // Skip cache if force refresh
      if (!forceRefresh) {
        // Try to get cached data first
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // If no cache or force refresh, fetch from API
      const result = await getAttendance();
      setData(result);

      // Cache the fetched data
      setCachedData(result);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await getAttendance();
      setData(result);
      setCachedData(result);
    } catch (err: any) {
      // Silently fail on refresh - don't show error, just stop refreshing
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allSundays = useMemo(() => {
    return data ? data.dates.map((d) => new Date(d)) : [];
  }, [data]);

  const students = useMemo(() => {
    return data
      ? data.students
          .map((s, id) => ({ id, name: s.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
      : [];
  }, [data]);

  const handleComplete = async (records: any[], selectedDate: string) => {
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
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchData} />;
  }

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
        router={router}
        context={{
          allSundays,
          students,
          handleComplete,
          handleRefresh,
          isRefreshing: refreshing,
        }}
      />
    </>
  );
}

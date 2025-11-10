import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAttendanceData } from '../../hooks/useAttendanceData';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import type { Schedule } from '../../schemas/attendance.schema';

export interface UseHomePageLogicProps {
  onNavigate: () => void;
}

interface TodaySchedule extends Schedule {
  serviceTimeName: string;
  serviceTimeTime: string;
}

/**
 * Business logic for the Home Page
 * Handles data loading, gestures, and user interactions
 */
export function useHomePageLogic({ onNavigate }: UseHomePageLogicProps) {
  const {
    isLoading,
    isDataReady,
    error: dataError,
    refetch,
    isRefreshing: isRefetchingData,
    getSchedule,
    serviceTimes,
  } = useAttendanceData();

  const { canInstall, promptInstall, isInstalled, isRunningInPWA, openPWAApp, isIOS } = usePWAInstall();

  // Get today's date in YYYY-MM-DD format
  const today = useMemo(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }, []);

  // Check if today has any schedules and get them
  const todaySchedules = useMemo<TodaySchedule[]>(() => {
    if (!isDataReady) return [];

    const schedules: TodaySchedule[] = [];

    serviceTimes.forEach((serviceTime) => {
      const schedule = getSchedule(today, serviceTime.id);
      if (schedule) {
        schedules.push({
          ...schedule,
          serviceTimeName: serviceTime.name,
          serviceTimeTime: serviceTime.time,
        });
      }
    });

    return schedules;
  }, [isDataReady, today, getSchedule, serviceTimes]);

  const isLessonDay = todaySchedules.length > 0;

  const [waitingForData, setWaitingForData] = useState(false);

  // Auto-navigate when data becomes ready while waiting
  useEffect(() => {
    if (waitingForData && isDataReady) {
      onNavigate();
    }
  }, [waitingForData, isDataReady, onNavigate]);

  // Pull-to-refresh gesture
  const pullToRefresh = usePullToRefresh({
    minPullDistance: 80,
    maxPullDistance: 120,
    onRefresh: async () => {
      await refetch();
    },
  });

  // Swipe left gesture
  const swipeGesture = useSwipeGesture({
    minSwipeDistance: 50,
    enabled: isDataReady,
    onSwipeLeft: () => {
      onNavigate();
    },
  });

  const handleStartClick = useCallback(() => {
    if (isDataReady) {
      onNavigate();
    } else {
      setWaitingForData(true);
    }
  }, [isDataReady, onNavigate]);

  const handleRetryLoad = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleCancelWaiting = useCallback(() => {
    setWaitingForData(false);
  }, []);

  // Combine touch handlers from both pull-to-refresh and swipe
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      pullToRefresh.handleTouchStart(e);
      swipeGesture.handleTouchStart(e);
    },
    [pullToRefresh, swipeGesture]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      pullToRefresh.handleTouchMove(e);
      swipeGesture.handleTouchMove(e);
    },
    [pullToRefresh, swipeGesture]
  );

  const handleTouchEnd = useCallback(async () => {
    await pullToRefresh.handleTouchEnd();
    swipeGesture.handleTouchEnd();
  }, [pullToRefresh, swipeGesture]);

  return {
    // Data states
    isLoading,
    isDataReady,
    dataError,
    isRefreshing: pullToRefresh.isRefreshing || isRefetchingData,

    // Lesson day data
    isLessonDay,
    todaySchedules,
    today,

    // UI states
    waitingForData,
    pullDistance: pullToRefresh.pullDistance,
    swipeOffset: swipeGesture.swipeOffset,
    isAnimatingSwipe: swipeGesture.isAnimating,

    // PWA Install
    canInstall,
    promptInstall,
    isInstalled,
    isRunningInPWA,
    openPWAApp,
    isIOS,

    // Handlers
    handleStartClick,
    handleRetryLoad,
    handleCancelWaiting,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,

    // Computed values
    canNavigate: isDataReady,
    minPullDistance: 80,
  };
}

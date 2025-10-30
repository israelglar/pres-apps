import { useState, useCallback, useEffect } from 'react';
import { useAttendanceData } from '../../hooks/useAttendanceData';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export interface UseHomePageLogicProps {
  onNavigate: () => void;
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
  } = useAttendanceData();

  const { canInstall, promptInstall, isInstalled, isRunningInPWA, openPWAApp } = usePWAInstall();

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

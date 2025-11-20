import { useState, useCallback } from 'react';
import { ATTENDANCE } from '@/config/constants';

export interface PullToRefreshConfig {
  minPullDistance?: number;
  maxPullDistance?: number;
  onRefresh: () => Promise<void> | void;
}

export interface PullToRefreshReturn {
  pullDistance: number;
  isRefreshing: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => Promise<void>;
}

/**
 * Hook to handle pull-to-refresh gesture
 *
 * @param config Configuration object
 * @returns Pull-to-refresh handlers and state
 */
export function usePullToRefresh({
  minPullDistance = ATTENDANCE.PULL_TO_REFRESH_MIN_DISTANCE,
  maxPullDistance = ATTENDANCE.PULL_TO_REFRESH_DISTANCE,
  onRefresh,
}: PullToRefreshConfig): PullToRefreshReturn {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setPullDistance(0);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartY === null || isRefreshing) return;

      const currentTouchY = e.touches[0].clientY;
      const distanceY = currentTouchY - touchStartY;

      // Only show pull indicator if pulling down and at top of page
      if (window.scrollY === 0 && distanceY > 0) {
        setPullDistance(Math.min(distanceY, maxPullDistance));
      }
    },
    [touchStartY, isRefreshing, maxPullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (touchStartY === null) return;

    const currentPullDistance = pullDistance;

    // Check for pull-to-refresh
    if (currentPullDistance >= minPullDistance && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    // Reset states
    setTouchStartY(null);
    setPullDistance(0);
  }, [touchStartY, pullDistance, minPullDistance, isRefreshing, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

import { useState, useCallback } from 'react';
import { ATTENDANCE } from '@/config/constants';

export interface SwipeGestureConfig {
  minSwipeDistance?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  enabled?: boolean;
}

export interface SwipeGestureReturn {
  swipeOffset: number;
  isAnimating: boolean;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

/**
 * Hook to handle swipe gestures (left/right)
 *
 * @param config Configuration object
 * @returns Swipe handlers and state
 */
export function useSwipeGesture({
  minSwipeDistance = ATTENDANCE.MIN_SWIPE_DISTANCE,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
}: SwipeGestureConfig): SwipeGestureReturn {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;

    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setSwipeOffset(0);
    setIsAnimating(false); // Cancel any ongoing animation
  }, [enabled]);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        !enabled ||
        touchStartX === null ||
        touchStartY === null
      )
        return;

      const currentTouchX = e.touches[0].clientX;
      const currentTouchY = e.touches[0].clientY;
      const distanceX = currentTouchX - touchStartX;
      const distanceY = currentTouchY - touchStartY;

      // Determine if gesture is more horizontal or vertical
      const isHorizontal = Math.abs(distanceX) > Math.abs(distanceY);

      if (isHorizontal) {
        // Allow swipe in both directions for visual feedback
        if (distanceX < 0 && onSwipeLeft) {
          setSwipeOffset(Math.max(-ATTENDANCE.MAX_SWIPE_OFFSET, distanceX));
        } else if (distanceX > 0 && onSwipeRight) {
          setSwipeOffset(Math.min(ATTENDANCE.MAX_SWIPE_OFFSET, distanceX));
        }
      }
    },
    [enabled, touchStartX, touchStartY, onSwipeLeft, onSwipeRight]
  );

  const handleTouchEnd = useCallback(() => {
    if (!enabled || touchStartX === null || touchStartY === null) return;

    const currentSwipeOffset = swipeOffset;

    // Check for swipe left gesture
    if (
      currentSwipeOffset < -minSwipeDistance &&
      onSwipeLeft
    ) {
      onSwipeLeft();
      setTouchStartX(null);
      setTouchStartY(null);
      setSwipeOffset(0);
      return;
    }

    // Check for swipe right gesture
    if (
      currentSwipeOffset > minSwipeDistance &&
      onSwipeRight
    ) {
      onSwipeRight();
      setTouchStartX(null);
      setTouchStartY(null);
      setSwipeOffset(0);
      return;
    }

    // Reset if didn't meet threshold
    setTouchStartX(null);
    setTouchStartY(null);
    setSwipeOffset(0);
  }, [
    enabled,
    touchStartX,
    touchStartY,
    swipeOffset,
    minSwipeDistance,
    onSwipeLeft,
    onSwipeRight,
  ]);

  return {
    swipeOffset,
    isAnimating,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

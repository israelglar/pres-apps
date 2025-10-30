import { useBlocker } from '@tanstack/react-router';

export interface NavigationBlockReturn {
  isBlocked: boolean;
  proceed: (() => void) | undefined;
  reset: (() => void) | undefined;
  status: 'blocked' | 'proceeding' | 'idle';
}

/**
 * Hook to block navigation when there's unsaved data
 * Wraps TanStack Router's useBlocker with a simpler API
 *
 * @param hasUnsavedData Whether there's unsaved data
 * @returns Navigation blocker state and handlers
 */
export function useNavigationBlock(
  hasUnsavedData: boolean
): NavigationBlockReturn {
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => hasUnsavedData,
    withResolver: true,
  });

  return {
    isBlocked: status === 'blocked',
    proceed,
    reset,
    status,
  };
}

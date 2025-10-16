const CACHE_KEY = "attendance_data_cache";
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes in milliseconds

interface CachedData {
  data: any;
  timestamp: number;
}

/**
 * Get cached data from localStorage if it exists and is still valid
 */
export function getCachedData(): any | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CachedData = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid (within CACHE_DURATION)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }

    // Cache is stale, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    // Silently fail if cache read fails
    return null;
  }
}

/**
 * Save data to localStorage cache with current timestamp
 */
export function setCachedData(data: any): void {
  try {
    const cacheData: CachedData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    // If localStorage is full or unavailable, fail silently
  }
}

/**
 * Clear the cached data
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    // Silently fail if cache clear fails
  }
}

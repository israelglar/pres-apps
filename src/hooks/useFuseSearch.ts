/**
 * Shared Fuse.js Search Hook
 * Provides fuzzy search functionality with configurable options
 */

import Fuse from 'fuse.js';
import { useMemo } from 'react';

export interface UseFuseSearchOptions<T> {
  /**
   * The array of items to search
   */
  items: T[];

  /**
   * The search query string
   */
  searchQuery: string;

  /**
   * Keys to search in (e.g., ["name", "title"])
   * Default: ["name"]
   */
  keys?: string[];

  /**
   * Fuse.js threshold (0 = perfect match, 1 = match anything)
   * Default: 0.3
   */
  threshold?: number;

  /**
   * Whether to ignore diacritics (accents)
   * Default: true
   */
  ignoreDiacritics?: boolean;

  /**
   * Whether to include Fuse.js score in results
   * Default: true
   */
  includeScore?: boolean;
}

export interface UseFuseSearchReturn<T> {
  /**
   * Filtered results based on search query
   * If search query is empty, returns original items array
   */
  results: T[];

  /**
   * Whether a search is currently active (query is not empty)
   */
  isSearching: boolean;
}

/**
 * Custom hook for fuzzy search using Fuse.js
 *
 * @example
 * ```tsx
 * const { results, isSearching } = useFuseSearch({
 *   items: students,
 *   searchQuery: query,
 *   keys: ['name'],
 * });
 * ```
 */
export function useFuseSearch<T>({
  items,
  searchQuery,
  keys = ['name'],
  threshold = 0.3,
  ignoreDiacritics = true,
  includeScore = true,
}: UseFuseSearchOptions<T>): UseFuseSearchReturn<T> {
  // Create Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys,
      threshold,
      includeScore,
      ignoreDiacritics,
    });
  }, [items, keys, threshold, includeScore, ignoreDiacritics]);

  // Perform search
  const results = useMemo(() => {
    const trimmedQuery = searchQuery.trim();

    // If no search query, return all items
    if (!trimmedQuery) {
      return items;
    }

    // Perform fuzzy search
    const searchResults = fuse.search(trimmedQuery);
    return searchResults.map((result) => result.item);
  }, [fuse, searchQuery, items]);

  const isSearching = searchQuery.trim().length > 0;

  return {
    results,
    isSearching,
  };
}

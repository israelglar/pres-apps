/**
 * Date Search Helpers
 * Utilities for formatting dates to make them searchable in various formats
 */

/**
 * Full Portuguese month names
 */
const PORTUGUESE_MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Short Portuguese month names
 */
const PORTUGUESE_MONTHS_SHORT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

/**
 * Format a date string for searching
 * Takes a date in "YYYY-MM-DD" format and returns a searchable string
 * with multiple date representations
 *
 * @param dateStr - Date in "YYYY-MM-DD" format (e.g., "2025-01-15")
 * @returns Searchable string with multiple date formats
 *
 * @example
 * formatDateForSearch("2025-01-15")
 * // Returns: "2025-01-15 15 Janeiro 2025 15 de Janeiro 2025 15 jan 2025 15 de jan 2025 Janeiro 2025 jan 2025 2025-01"
 */
export function formatDateForSearch(dateStr: string): string {
  // Parse date components
  const [year, monthNum, day] = dateStr.split('-');
  const monthIndex = parseInt(monthNum) - 1;

  // Get month names
  const fullMonth = PORTUGUESE_MONTHS[monthIndex];
  const shortMonth = PORTUGUESE_MONTHS_SHORT[monthIndex];

  // Build searchable string with all variations
  const searchableParts = [
    dateStr,                                      // "2025-01-15"
    `${parseInt(day)} ${fullMonth} ${year}`,      // "15 Janeiro 2025"
    `${parseInt(day)} de ${fullMonth} ${year}`,   // "15 de Janeiro 2025"
    `${parseInt(day)} ${shortMonth} ${year}`,     // "15 jan 2025"
    `${parseInt(day)} de ${shortMonth} ${year}`,  // "15 de jan 2025"
    `${fullMonth} ${year}`,                       // "Janeiro 2025"
    `${shortMonth} ${year}`,                      // "jan 2025"
    `${year}-${monthNum}`,                        // "2025-01"
    fullMonth.toLowerCase(),                      // "janeiro"
    shortMonth.toLowerCase(),                     // "jan"
  ];

  return searchableParts.join(' ');
}

/**
 * Format multiple dates for searching
 * Takes an array of date strings and combines them into a single searchable string
 *
 * @param dates - Array of dates in "YYYY-MM-DD" format
 * @returns Combined searchable string
 *
 * @example
 * formatDatesForSearch(["2025-01-15", "2025-02-20"])
 * // Returns: "2025-01-15 15 Janeiro 2025 ... 2025-02-20 20 Fevereiro 2025 ..."
 */
export function formatDatesForSearch(dates: string[]): string {
  return dates.map(formatDateForSearch).join(' ');
}

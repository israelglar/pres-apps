/**
 * Shared utilities for lesson date formatting and parsing
 * Used by DateGroupCard and AttendanceRecordCard
 */

/**
 * Parse date string as local date (avoid timezone issues)
 * @param dateStr - Date in "YYYY-MM-DD" format
 * @returns Date object representing local date
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format date in short format: "10 nov 2025"
 * @param dateStr - Date in "YYYY-MM-DD" or "DD MMM YYYY" format
 * @returns Formatted date string
 */
export function formatShortDate(dateStr: string): string {
  // Month abbreviations in Portuguese
  const monthNames = [
    "jan",
    "fev",
    "mar",
    "abr",
    "mai",
    "jun",
    "jul",
    "ago",
    "set",
    "out",
    "nov",
    "dez",
  ];

  // Check if input is already formatted (e.g., "10 nov 2025")
  if (dateStr.includes(" ")) {
    const [day, month, year] = dateStr.split(" ");
    return `${parseInt(day)} ${month.toLowerCase()} ${year}`;
  }

  // Parse YYYY-MM-DD format
  const date = parseLocalDate(dateStr);
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Check if date is today
 * @param dateStr - Date in "YYYY-MM-DD" format
 * @returns True if date is today
 */
function isToday(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = parseLocalDate(dateStr);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() === today.getTime();
}

/**
 * Check if date is the most recent past Sunday (Domingo Passado)
 * @param dateStr - Date in "YYYY-MM-DD" format
 * @returns True if date is the previous Sunday
 */
function isPreviousSunday(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = parseLocalDate(dateStr);
  checkDate.setHours(0, 0, 0, 0);

  // Must be in the past (not today)
  if (checkDate.getTime() >= today.getTime()) return false;

  // Check if it's a Sunday
  if (checkDate.getDay() !== 0) return false;

  // Find the most recent past Sunday
  const daysToSubtract = today.getDay() === 0 ? 7 : today.getDay();
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - daysToSubtract);
  lastSunday.setHours(0, 0, 0, 0);

  return checkDate.getTime() === lastSunday.getTime();
}

/**
 * Get date label (Hoje or Domingo Passado)
 * @param dateStr - Date in "YYYY-MM-DD" format
 * @returns "Hoje" if today, "Domingo Passado" if previous Sunday, null otherwise
 */
export function getDateLabel(
  dateStr: string,
): "Hoje" | "Domingo Passado" | null {
  if (isToday(dateStr)) return "Hoje";
  if (isPreviousSunday(dateStr)) return "Domingo Passado";
  return null;
}

import {
  format,
  formatDistanceToNow,
  isValid,
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addDays,
  addHours,
  startOfDay,
  endOfDay,
} from 'date-fns';

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string, formatStr = 'PPP'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) {
    return 'Invalid date';
  }
  return format(parsedDate, formatStr);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(parsedDate)) {
    return 'Invalid date';
  }
  return formatDistanceToNow(parsedDate, { addSuffix: true });
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: unknown): boolean {
  if (date instanceof Date) {
    return isValid(date);
  }
  if (typeof date === 'string') {
    return isValid(parseISO(date));
  }
  return false;
}

/**
 * Get the difference between two dates in days
 */
export function getDaysDifference(startDate: Date, endDate: Date): number {
  return differenceInDays(endDate, startDate);
}

/**
 * Get the difference between two dates in hours
 */
export function getHoursDifference(startDate: Date, endDate: Date): number {
  return differenceInHours(endDate, startDate);
}

/**
 * Get the difference between two dates in minutes
 */
export function getMinutesDifference(startDate: Date, endDate: Date): number {
  return differenceInMinutes(endDate, startDate);
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

/**
 * Add hours to a date
 */
export function addHoursToDate(date: Date, hours: number): Date {
  return addHours(date, hours);
}

/**
 * Get start of day
 */
export function getStartOfDay(date: Date): Date {
  return startOfDay(date);
}

/**
 * Get end of day
 */
export function getEndOfDay(date: Date): Date {
  return endOfDay(date);
}

import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { parseISO } from 'date-fns';
import { TimeString } from '../types';

/**
 * Converts a UTC date to the user's time zone
 * @param utcDate - The UTC date to convert
 * @param userTimeZone - The user's time zone
 * @returns Date object in the user's time zone
 * @throws Error if the provided time zone is invalid
 */
export function convertToUserTimeZone(utcDate: Date | string, userTimeZone: string): Date {
  if (!isValidTimeZone(userTimeZone)) {
    throw new Error(`Invalid time zone: ${userTimeZone}`);
  }
  const parsedDate = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
  return utcToZonedTime(parsedDate, userTimeZone);
}

/**
 * Converts a date from the user's time zone to UTC
 * @param zonedDate - The date in the user's time zone
 * @param userTimeZone - The user's time zone
 * @returns UTC Date object
 * @throws Error if the provided time zone is invalid
 */
export function convertToUTC(zonedDate: Date | string, userTimeZone: string): Date {
  if (!isValidTimeZone(userTimeZone)) {
    throw new Error(`Invalid time zone: ${userTimeZone}`);
  }
  const parsedDate = typeof zonedDate === 'string' ? parseISO(zonedDate) : zonedDate;
  return zonedTimeToUtc(parsedDate, userTimeZone);
}

/**
 * Formats a date object to a time string in HH:mm format
 * @param date - The date to format
 * @returns Formatted time string
 */
export function formatTimeForDisplay(date: Date): TimeString {
  return format(date, 'HH:mm') as TimeString;
}

/**
 * Gets the user's time zone from the browser
 * @returns User's time zone
 */
export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Checks if a given time zone string is valid
 * @param timeZone - The time zone string to validate
 * @returns True if the time zone is valid, false otherwise
 */
export function isValidTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Parses a time string in HH:mm format and returns a Date object
 * @param timeString - The time string to parse
 * @param referenceDate - The reference date to use (defaults to current date)
 * @returns Date object representing the parsed time
 * @throws Error if the time string is invalid
 */
export function parseTimeString(timeString: TimeString, referenceDate: Date = new Date()): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time string: ${timeString}`);
  }
  const result = new Date(referenceDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Calculates the time difference between two time zones
 * @param timeZone1 - The first time zone
 * @param timeZone2 - The second time zone
 * @returns The time difference in minutes
 * @throws Error if either time zone is invalid
 */
export function getTimeZoneDifference(timeZone1: string, timeZone2: string): number {
  if (!isValidTimeZone(timeZone1) || !isValidTimeZone(timeZone2)) {
    throw new Error('Invalid time zone provided');
  }
  const now = new Date();
  const time1 = new Date(now.toLocaleString('en-US', { timeZone: timeZone1 }));
  const time2 = new Date(now.toLocaleString('en-US', { timeZone: timeZone2 }));
  return (time1.getTime() - time2.getTime()) / (1000 * 60);
}

/**
 * This utility file provides functions for handling time zone conversions and formatting
 * for the supplement reminder website. It ensures consistent time handling across the
 * application, considering user time zones and server UTC time.
 * 
 * Requirements addressed:
 * 1. Time Zone Handling (Technical Requirements/System Design/Time Zone Handling)
 *    - Implement robust time zone handling to ensure accurate reminder delivery across different time zones
 * 2. User Experience (Technical Requirements/User Interface Design)
 *    - Provide a seamless experience for users in different time zones
 * 3. Error Handling (Technical Requirements/System Design)
 *    - Implement proper error handling for invalid inputs and edge cases
 * 4. Performance Optimization (Technical Requirements/System Design)
 *    - Utilize efficient date and time manipulation libraries (date-fns and date-fns-tz)
 */
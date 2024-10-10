/**
 * This file contains TypeScript type definitions and interfaces used throughout the frontend application
 * for the supplement reminder website. It provides a centralized location for defining data structures,
 * ensuring type safety and consistency across the application.
 * 
 * Requirements addressed:
 * - Type Safety (Technical Requirements/Programming Languages): Utilize TypeScript for enhanced type checking and improved code quality
 * - Data Structure Consistency (Technical Requirements/System Design): Define consistent data structures for use across the frontend application
 */

/**
 * Represents a user of the supplement reminder system
 */
export interface User {
  id: string;
  phoneNumber: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a reminder set by a user
 */
export interface Reminder {
  id: string;
  userId: string;
  supplementName: string; // Added field for supplement name
  scheduledAt: Date;
  status: ReminderStatus;
  sentAt: Date | null;
  createdAt: Date; // Added creation date
  updatedAt: Date; // Added last update date
}

/**
 * Enum representing possible statuses of a reminder
 */
export enum ReminderStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  CANCELLED = 'cancelled' // Added cancelled status
}

/**
 * Represents an analytics event
 */
export interface AnalyticsEvent {
  id: string;
  userId: string | null;
  eventType: AnalyticsEventType; // Changed to use enum
  eventData: Record<string, unknown>; // Changed 'any' to 'unknown' for better type safety
  createdAt: Date;
}

/**
 * Enum representing possible analytics event types
 */
export enum AnalyticsEventType {
  REMINDER_CREATED = 'reminder_created',
  REMINDER_SENT = 'reminder_sent',
  REMINDER_CANCELLED = 'reminder_cancelled',
  USER_REGISTERED = 'user_registered',
  USER_LOGGED_IN = 'user_logged_in'
}

/**
 * Generic interface for API responses
 */
export interface ApiResponse<T> {
  data: T;
  message: string;
  status: 'success' | 'error'; // Added status field
}

/**
 * Represents form validation errors
 */
export interface FormErrors {
  [key: string]: string;
}

/**
 * Type alias for time string in HH:mm format
 */
export type TimeString = string;

/**
 * Represents the shape of the reminder form data
 */
export interface ReminderFormData {
  supplementName: string;
  time: TimeString;
  timezone: string;
}

/**
 * Represents the configuration for the time picker component
 */
export interface TimePickerConfig {
  minTime?: TimeString;
  maxTime?: TimeString;
  step?: number; // in minutes
}

/**
 * Represents the state of an API request
 */
export interface ApiRequestState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Utility type to make all properties of a type optional
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Utility type to make all properties of a type required
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Utility type to pick a set of properties from a type
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Utility type to omit a set of properties from a type
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
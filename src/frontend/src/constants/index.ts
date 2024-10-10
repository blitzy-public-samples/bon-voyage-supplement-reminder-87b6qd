import { ReminderStatus, AnalyticsEventType } from '../types';

/**
 * This file contains constant values used throughout the frontend application for the supplement reminder website.
 * It provides a centralized location for defining application-wide constants, ensuring consistency and easy maintenance.
 * 
 * Requirements addressed:
 * 1. Consistent Application Configuration (Technical Requirements/System Design)
 *    - Define application-wide constants for consistent configuration across the frontend
 * 2. Mobile-Friendly Design (Technical Requirements/User Interface Design)
 *    - Define constants related to responsive design and mobile optimization
 * 3. API Integration (Technical Requirements/System Integration)
 *    - Define API base URL for consistent endpoint access
 * 4. Data Validation (Technical Requirements/Data Management)
 *    - Define regular expressions for input validation
 * 5. User Experience (Technical Requirements/User Interface Design)
 *    - Define color scheme and breakpoints for consistent UI design
 * 6. Analytics Tracking (Technical Requirements/Analytics and Reporting)
 *    - Define analytics event types for consistent event tracking
 */

// Base URL for API endpoints
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api/v1';

// Regular expression for validating phone numbers (E.164 format)
export const PHONE_REGEX = /^\+[1-9]\d{1,14}$/;

// Regular expression for validating time input in HH:mm format
export const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Maximum number of reminders a user can set
export const MAX_REMINDERS_PER_USER = 5;

// Human-readable labels for reminder statuses
export const REMINDER_STATUSES: Record<ReminderStatus, string> = {
  [ReminderStatus.PENDING]: 'Pending',
  [ReminderStatus.SENT]: 'Sent',
  [ReminderStatus.FAILED]: 'Failed',
  [ReminderStatus.CANCELLED]: 'Cancelled'
};

// Event types for analytics tracking
export const ANALYTICS_EVENTS = {
  FORM_SUBMIT: AnalyticsEventType.REMINDER_CREATED,
  REMINDER_SET: AnalyticsEventType.REMINDER_CREATED,
  REMINDER_MODIFIED: 'reminder_modified', // Consider adding this to AnalyticsEventType enum
  REMINDER_CANCELLED: AnalyticsEventType.REMINDER_CANCELLED,
  USER_REGISTERED: AnalyticsEventType.USER_REGISTERED,
  USER_LOGGED_IN: AnalyticsEventType.USER_LOGGED_IN
};

// Color scheme for the application, as specified in the technical requirements
export const COLOR_SCHEME = {
  primary: '#FFA500', // Orange
  secondary: '#000080', // Navy Blue
  tertiary: '#89CFF0', // Baby Blue
  background: '#FFFFFF', // White
  text: '#333333', // Dark Gray
  error: '#FF0000' // Red
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px'
};

// Default timezone if user's timezone is not available
export const DEFAULT_TIMEZONE = 'UTC';

// Maximum length for supplement name input
export const MAX_SUPPLEMENT_NAME_LENGTH = 50;

// Minimum and maximum time for scheduling reminders
export const REMINDER_TIME_RANGE = {
  min: '00:00',
  max: '23:59'
};

// Time step for time picker (in minutes)
export const TIME_PICKER_STEP = 15;

// Duration for showing success/error messages (in milliseconds)
export const MESSAGE_DURATION = 5000;

// Maximum number of retries for failed API requests
export const MAX_API_RETRIES = 3;

// Debounce delay for search inputs (in milliseconds)
export const SEARCH_DEBOUNCE_DELAY = 300;

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  USER_ID: 'userId',
  AUTH_TOKEN: 'authToken',
  PREFERENCES: 'userPreferences'
};

// Session storage keys
export const SESSION_STORAGE_KEYS = {
  CURRENT_REMINDER: 'currentReminder',
  FORM_DATA: 'reminderFormData'
};
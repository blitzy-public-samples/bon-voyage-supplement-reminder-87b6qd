import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL } from '../constants';
import {
  ApiResponse,
  User,
  Reminder,
  AnalyticsEvent,
  ReminderFormData,
  Partial
} from '../types';

/**
 * Create an axios instance with the base URL and default configurations
 * @requirements_addressed Technical Requirements/API Design - Implement utility functions for making API calls to the backend server
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Creates a new reminder for a user
 * @param reminderData - The data for creating a new reminder
 * @returns A promise that resolves to the API response containing the created reminder
 * @requirements_addressed Technical Requirements/API Design - Implement utility functions for making API calls to the backend server
 */
export const createReminder = async (reminderData: ReminderFormData): Promise<ApiResponse<Reminder>> => {
  try {
    const response = await api.post<ApiResponse<Reminder>>('/reminders', reminderData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Updates an existing reminder
 * @param reminderId - The ID of the reminder to update
 * @param reminderData - The updated reminder data
 * @returns A promise that resolves to the API response containing the updated reminder
 * @requirements_addressed Technical Requirements/API Design - Implement utility functions for making API calls to the backend server
 */
export const updateReminder = async (reminderId: string, reminderData: Partial<ReminderFormData>): Promise<ApiResponse<Reminder>> => {
  try {
    const response = await api.put<ApiResponse<Reminder>>(`/reminders/${reminderId}`, reminderData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Deletes an existing reminder
 * @param reminderId - The ID of the reminder to delete
 * @returns A promise that resolves to the API response confirming deletion
 * @requirements_addressed Technical Requirements/API Design - Implement utility functions for making API calls to the backend server
 */
export const deleteReminder = async (reminderId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete<ApiResponse<void>>(`/reminders/${reminderId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Registers a new user
 * @param userData - The data for registering a new user
 * @returns A promise that resolves to the API response containing the registered user
 * @requirements_addressed Technical Requirements/API Design - Implement utility functions for making API calls to the backend server
 */
export const registerUser = async (userData: Partial<User>): Promise<ApiResponse<User>> => {
  try {
    const response = await api.post<ApiResponse<User>>('/users/register', userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Updates an existing user's information
 * @param userId - The ID of the user to update
 * @param userData - The updated user data
 * @returns A promise that resolves to the API response containing the updated user
 * @requirements_addressed Technical Requirements/API Design - Implement utility functions for making API calls to the backend server
 */
export const updateUser = async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
  try {
    const response = await api.put<ApiResponse<User>>(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Logs an analytics event
 * @param eventData - The data for the analytics event
 * @returns A promise that resolves to the API response confirming the event was logged
 * @requirements_addressed Technical Requirements/API Design - Implement utility functions for making API calls to the backend server
 */
export const logAnalyticsEvent = async (eventData: AnalyticsEvent): Promise<ApiResponse<void>> => {
  try {
    const response = await api.post<ApiResponse<void>>('/analytics/event', eventData);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Handles API errors and returns a formatted error message
 * @param error - The error object from the API call
 * @returns A formatted error message
 * @requirements_addressed Technical Requirements/Security and Compliance - Implement error handling for API calls
 */
export const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<unknown>>;
    if (axiosError.response?.data?.message) {
      return new Error(axiosError.response.data.message);
    }
    if (axiosError.message) {
      return new Error(`Network error: ${axiosError.message}`);
    }
  }
  return new Error('An unexpected error occurred. Please try again later.');
};

/**
 * Sets the authentication token for API requests
 * @param token - The authentication token
 * @requirements_addressed Technical Requirements/Security and Compliance - Implement secure authentication for API calls
 */
export const setAuthToken = (token: string): void => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

/**
 * Clears the authentication token from API requests
 * @requirements_addressed Technical Requirements/Security and Compliance - Implement secure authentication for API calls
 */
export const clearAuthToken = (): void => {
  delete api.defaults.headers.common['Authorization'];
};
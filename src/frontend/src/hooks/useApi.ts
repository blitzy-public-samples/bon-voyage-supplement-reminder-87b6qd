import { useState, useCallback } from 'react';
import * as api from '../utils/api';
import { ApiResponse, User, Reminder, ReminderFormData, AnalyticsEvent } from '../types';

// Generic type for API functions
type ApiFunction<T, U> = (...args: T) => Promise<ApiResponse<U>>;

// Generic type for wrapped API functions with error handling
type WrappedApiFunction<T, U> = (...args: T) => Promise<U | null>;

// Interface for the object returned by the useApi hook
interface UseApiReturn {
  createReminder: WrappedApiFunction<[ReminderFormData], Reminder>;
  updateReminder: WrappedApiFunction<[string, Partial<ReminderFormData>], Reminder>;
  deleteReminder: WrappedApiFunction<[string], void>;
  registerUser: WrappedApiFunction<[Partial<User>], User>;
  updateUser: WrappedApiFunction<[string, Partial<User>], User>;
  logAnalyticsEvent: WrappedApiFunction<[AnalyticsEvent], void>;
  setAuthToken: (token: string) => void;
  clearAuthToken: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Custom hook for making API calls with loading and error state management
 * @returns {UseApiReturn} An object containing API functions, loading state, error state, and utility functions
 */
const useApi = (): UseApiReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clears the error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wraps an API function with loading and error handling
   * @param {ApiFunction<T, U>} apiFunc - The API function to wrap
   * @returns {WrappedApiFunction<T, U>} A wrapped version of the API function
   */
  const wrapApiCall = useCallback(<T extends any[], U>(apiFunc: ApiFunction<T, U>): WrappedApiFunction<T, U> => {
    return async (...args: T): Promise<U | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunc(...args);
        return response.data;
      } catch (err) {
        const errorMessage = api.handleApiError(err);
        setError(errorMessage.message);
        return null;
      } finally {
        setLoading(false);
      }
    };
  }, []);

  return {
    createReminder: wrapApiCall(api.createReminder),
    updateReminder: wrapApiCall(api.updateReminder),
    deleteReminder: wrapApiCall(api.deleteReminder),
    registerUser: wrapApiCall(api.registerUser),
    updateUser: wrapApiCall(api.updateUser),
    logAnalyticsEvent: wrapApiCall(api.logAnalyticsEvent),
    setAuthToken: api.setAuthToken,
    clearAuthToken: api.clearAuthToken,
    loading,
    error,
    clearError,
  };
};

export default useApi;
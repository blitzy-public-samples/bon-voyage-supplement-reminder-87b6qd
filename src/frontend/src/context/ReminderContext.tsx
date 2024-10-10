import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { User, Reminder, ApiResponse, ReminderStatus } from '../types';

/**
 * Interface defining the shape of the ReminderContext
 */
interface ReminderContextType {
  user: User | null;
  reminders: Reminder[];
  setUser: (user: User | null) => void;
  addReminder: (reminder: Reminder) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  getReminderById: (id: string) => Reminder | undefined;
  getActiveReminders: () => Reminder[];
}

/**
 * Create the context with an initial undefined value
 */
const ReminderContext = createContext<ReminderContextType | undefined>(undefined);

/**
 * Props interface for the ReminderProvider component
 */
interface ReminderProviderProps {
  children: ReactNode;
}

/**
 * ReminderProvider component
 */
export const ReminderProvider: React.FC<ReminderProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  /**
   * Function to add a new reminder
   */
  const addReminder = useCallback((reminder: Reminder) => {
    setReminders((prevReminders) => [...prevReminders, reminder]);
  }, []);

  /**
   * Function to update an existing reminder
   */
  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders((prevReminders) =>
      prevReminders.map((reminder) =>
        reminder.id === id ? { ...reminder, ...updates, updatedAt: new Date() } : reminder
      )
    );
  }, []);

  /**
   * Function to delete a reminder
   */
  const deleteReminder = useCallback((id: string) => {
    setReminders((prevReminders) => prevReminders.filter((reminder) => reminder.id !== id));
  }, []);

  /**
   * Function to get a reminder by its ID
   */
  const getReminderById = useCallback((id: string) => {
    return reminders.find((reminder) => reminder.id === id);
  }, [reminders]);

  /**
   * Function to get all active reminders (pending or sent)
   */
  const getActiveReminders = useCallback(() => {
    return reminders.filter((reminder) => 
      reminder.status === ReminderStatus.PENDING || reminder.status === ReminderStatus.SENT
    );
  }, [reminders]);

  /**
   * Memoized context value object
   */
  const contextValue = useMemo<ReminderContextType>(() => ({
    user,
    reminders,
    setUser,
    addReminder,
    updateReminder,
    deleteReminder,
    getReminderById,
    getActiveReminders,
  }), [user, reminders, addReminder, updateReminder, deleteReminder, getReminderById, getActiveReminders]);

  return (
    <ReminderContext.Provider value={contextValue}>
      {children}
    </ReminderContext.Provider>
  );
};

/**
 * Custom hook to access the ReminderContext
 * @throws {Error} If used outside of a ReminderProvider
 */
export const useReminderContext = (): ReminderContextType => {
  const context = useContext(ReminderContext);
  if (context === undefined) {
    throw new Error('useReminderContext must be used within a ReminderProvider');
  }
  return context;
};

/**
 * Export the ReminderContext for potential direct usage
 */
export default ReminderContext;
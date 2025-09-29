import { useState, useEffect, useCallback } from 'react';

interface NotificationState {
  [key: string]: {
    dismissed: boolean;
    dismissedAt: number;
    snoozeUntil?: number;
  };
}

interface NotificationHistoryItem {
  id: string;
  type: 'maintenance' | 'payment' | 'info' | 'warning' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  dismissedAt?: number;
  snoozeCount?: number;
  lastSnoozedAt?: number;
  actionTaken?: string; // 'dismissed' | 'snoozed' | 'action_clicked'
  relatedData?: any; // Store original reminder data
}

interface NotificationHistory {
  [key: string]: NotificationHistoryItem;
}

interface UseNotificationStateOptions {
  storageKey?: string;
  snoozeTimeout?: number; // in milliseconds
  enableHistory?: boolean;
}

export const useNotificationState = (options: UseNotificationStateOptions = {}) => {
  const {
    storageKey = 'notification_state',
    snoozeTimeout = 24 * 60 * 60 * 1000, // 24 hours
    enableHistory = true
  } = options;

  const [notificationState, setNotificationState] = useState<NotificationState>({});
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory>({});
  
  const historyStorageKey = `${storageKey}_history`;

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Clean up expired entries
        const now = Date.now();
        const cleaned: NotificationState = {};
        
        Object.entries(parsed).forEach(([key, value]) => {
          const state = value as NotificationState[string];
          // Keep if not snoozed or snooze hasn't expired
          if (!state.snoozeUntil || state.snoozeUntil > now) {
            cleaned[key] = state;
          }
        });
        
        setNotificationState(cleaned);
      }

      // Load notification history
      if (enableHistory) {
        const savedHistory = localStorage.getItem(historyStorageKey);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory);
          setNotificationHistory(parsedHistory);
        }
      }
    } catch (error) {
      console.warn('Failed to load notification state from localStorage:', error);
    }
  }, [storageKey, historyStorageKey, enableHistory]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notificationState));
    } catch (error) {
      console.warn('Failed to save notification state to localStorage:', error);
    }
  }, [notificationState, storageKey]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (enableHistory) {
      try {
        localStorage.setItem(historyStorageKey, JSON.stringify(notificationHistory));
      } catch (error) {
        console.warn('Failed to save notification history to localStorage:', error);
      }
    }
  }, [notificationHistory, historyStorageKey, enableHistory]);

  const isDismissed = useCallback((notificationId: string): boolean => {
    const state = notificationState[notificationId];
    if (!state) return false;
    
    const now = Date.now();
    
    // Check if snoozed and snooze period hasn't expired
    if (state.snoozeUntil && state.snoozeUntil > now) {
      return true;
    }
    
    // Check if permanently dismissed
    return state.dismissed;
  }, [notificationState]);

  const dismissNotification = useCallback((notificationId: string, permanent: boolean = true) => {
    setNotificationState(prev => ({
      ...prev,
      [notificationId]: {
        ...prev[notificationId],
        dismissed: permanent,
        dismissedAt: Date.now(),
        snoozeUntil: undefined // Clear any snooze when permanently dismissed
      }
    }));
  }, []);

  const snoozeNotification = useCallback((notificationId: string, duration?: number) => {
    const snoozeDuration = duration || snoozeTimeout;
    const snoozeUntil = Date.now() + snoozeDuration;
    
    setNotificationState(prev => ({
      ...prev,
      [notificationId]: {
        ...prev[notificationId],
        dismissed: false,
        dismissedAt: Date.now(),
        snoozeUntil
      }
    }));
  }, [snoozeTimeout]);

  const resetNotification = useCallback((notificationId: string) => {
    setNotificationState(prev => {
      const newState = { ...prev };
      delete newState[notificationId];
      return newState;
    });
  }, []);

  const resetAllNotifications = useCallback(() => {
    setNotificationState({});
  }, []);

  const getNotificationState = useCallback((notificationId: string) => {
    return notificationState[notificationId] || null;
  }, [notificationState]);

  const isSnoozing = useCallback((notificationId: string): boolean => {
    const state = notificationState[notificationId];
    if (!state || !state.snoozeUntil) return false;
    
    return state.snoozeUntil > Date.now();
  }, [notificationState]);

  const getSnoozeTimeRemaining = useCallback((notificationId: string): number | null => {
    const state = notificationState[notificationId];
    if (!state || !state.snoozeUntil) return null;
    
    const remaining = state.snoozeUntil - Date.now();
    return remaining > 0 ? remaining : null;
  }, [notificationState]);

  // History management functions
  const addToHistory = useCallback((item: Omit<NotificationHistoryItem, 'createdAt'>) => {
    if (!enableHistory) return;
    
    const historyItem: NotificationHistoryItem = {
      ...item,
      createdAt: Date.now()
    };
    
    setNotificationHistory(prev => ({
      ...prev,
      [item.id]: historyItem
    }));
  }, [enableHistory]);

  const updateHistoryItem = useCallback((notificationId: string, updates: Partial<NotificationHistoryItem>) => {
    if (!enableHistory) return;
    
    setNotificationHistory(prev => ({
      ...prev,
      [notificationId]: {
        ...prev[notificationId],
        ...updates
      }
    }));
  }, [enableHistory]);

  const getNotificationHistory = useCallback((filters?: {
    type?: NotificationHistoryItem['type'];
    dateFrom?: number;
    dateTo?: number;
    actionTaken?: string;
  }) => {
    let history = Object.values(notificationHistory);
    
    if (filters) {
      if (filters.type) {
        history = history.filter(item => item.type === filters.type);
      }
      if (filters.dateFrom) {
        history = history.filter(item => item.createdAt >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        history = history.filter(item => item.createdAt <= filters.dateTo!);
      }
      if (filters.actionTaken) {
        history = history.filter(item => item.actionTaken === filters.actionTaken);
      }
    }
    
    // Sort by creation date (newest first)
    return history.sort((a, b) => b.createdAt - a.createdAt);
  }, [notificationHistory]);

  const clearHistory = useCallback((olderThan?: number) => {
    if (!enableHistory) return;
    
    if (olderThan) {
      setNotificationHistory(prev => {
        const filtered: NotificationHistory = {};
        Object.entries(prev).forEach(([key, item]) => {
          if (item.createdAt >= olderThan) {
            filtered[key] = item;
          }
        });
        return filtered;
      });
    } else {
      setNotificationHistory({});
    }
  }, [enableHistory]);

  // Enhanced dismiss and snooze functions to update history
  const dismissNotificationWithHistory = useCallback((notificationId: string, permanent: boolean = true, notificationData?: Partial<NotificationHistoryItem>) => {
    dismissNotification(notificationId, permanent);
    
    if (enableHistory && notificationData) {
      const existingItem = notificationHistory[notificationId];
      if (existingItem) {
        updateHistoryItem(notificationId, {
          dismissedAt: Date.now(),
          actionTaken: 'dismissed'
        });
      } else {
        addToHistory({
          id: notificationId,
          type: notificationData.type || 'info',
          title: notificationData.title || 'Thông báo',
          message: notificationData.message || '',
          priority: notificationData.priority || 'medium',
          dismissedAt: Date.now(),
          actionTaken: 'dismissed',
          relatedData: notificationData.relatedData
        });
      }
    }
  }, [dismissNotification, enableHistory, notificationHistory, updateHistoryItem, addToHistory]);

  const snoozeNotificationWithHistory = useCallback((notificationId: string, duration?: number, notificationData?: Partial<NotificationHistoryItem>) => {
    snoozeNotification(notificationId, duration);
    
    if (enableHistory && notificationData) {
      const existingItem = notificationHistory[notificationId];
      if (existingItem) {
        updateHistoryItem(notificationId, {
          snoozeCount: (existingItem.snoozeCount || 0) + 1,
          lastSnoozedAt: Date.now(),
          actionTaken: 'snoozed'
        });
      } else {
        addToHistory({
          id: notificationId,
          type: notificationData.type || 'info',
          title: notificationData.title || 'Thông báo',
          message: notificationData.message || '',
          priority: notificationData.priority || 'medium',
          snoozeCount: 1,
          lastSnoozedAt: Date.now(),
          actionTaken: 'snoozed',
          relatedData: notificationData.relatedData
        });
      }
    }
  }, [snoozeNotification, enableHistory, notificationHistory, updateHistoryItem, addToHistory]);

  return {
    // Original functions
    isDismissed,
    dismissNotification,
    snoozeNotification,
    resetNotification,
    resetAllNotifications,
    getNotificationState,
    isSnoozing,
    getSnoozeTimeRemaining,
    // History functions
    addToHistory,
    updateHistoryItem,
    getNotificationHistory,
    clearHistory,
    dismissNotificationWithHistory,
    snoozeNotificationWithHistory
  };
};
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from './AuthContext';
import { Alert } from 'react-native';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const refreshInterval = useRef<any>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!user) return;
    
    try {
      if (!silent) setLoading(true);
      const [list, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount()
      ]);
      
      setNotifications(list);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
      // Start polling for "real-time" feel without sockets
      refreshInterval.current = setInterval(() => fetchData(true), 15000);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    }
    return () => {
      if (refreshInterval.current) clearInterval(refreshInterval.current);
    };
  }, [user, fetchData]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await fetchData(true);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await fetchData(true);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      await fetchData(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading, 
      refresh: () => fetchData(),
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

import api from './api';

export interface Notification {
  _id: string;
  type: 'order' | 'request' | 'payment' | 'wallet' | 'alert' | 'vendor' | 'system' | 'udhar' | 'order_assigned';
  title: string;
  message: string;
  isRead: boolean;
  data: any;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data.notifications || [];
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread-count');
    return response.data.unreadCount || 0;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: string) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

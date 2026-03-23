import API from './api';

export const vendorService = {
  async getDashboardStats() {
    try {
      const response = await API.get('/vendor/dashboard-stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  },

  async getOrders() {
    try {
      const response = await API.get('/vendor/orders');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  async getOrderById(id: string) {
    try {
      const response = await API.get(`/vendor/orders/${id}`); // Note: backend might not have this exact endpoint, I'll check first
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  async updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await API.put(`/vendor/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  async getAnalytics() {
    try {
      const response = await API.get('/vendor/analytics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },

  async getPulse() {
    try {
      const response = await API.get('/vendor/pulse');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch pulse');
    }
  },

  async getPredictions() {
    try {
      const response = await API.get('/vendor/predictions');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch predictions');
    }
  },

  async getUdharList() {
    try {
      const response = await API.get('/vendor/udhar');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch udhar list');
    }
  },

  async settleUdhar(id: string) {
    try {
      const response = await API.put(`/vendor/udhar/${id}/settle`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to settle udhar');
    }
  },

  async getStaff() {
    try {
      const response = await API.get('/delivery-boys');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch staff');
    }
  },

  async createStaff(data: { name: string; email: string; phone: string; password: string }) {
    try {
      const response = await API.post('/delivery-boys', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create staff');
    }
  },

  async updateStaff(id: string, data: any) {
    try {
      // Backend uses PUT not PATCH
      const response = await API.put(`/delivery-boys/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update staff');
    }
  },

  async deleteStaff(id: string) {
    try {
      const response = await API.delete(`/delivery-boys/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete staff');
    }
  },

  async getRequests() {
    try {
      // Correct backend route: /vendor-requests/vendor
      const response = await API.get('/vendor-requests/vendor');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor requests');
    }
  },

  async handleRequestAction(requestId: string, action: 'approve' | 'reject') {
    try {
      // Correct backend route: /vendor-requests/vendor/:id/approve or /reject
      const response = await API.post(`/vendor-requests/vendor/${requestId}/${action}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || `Failed to ${action} request`);
    }
  },

  async getUdharConsumers() {
    try {
      const response = await API.get('/vendor/udhar/consumers');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch udhar consumers');
    }
  },

  async getUdharHistory() {
    try {
      const response = await API.get('/vendor/udhar/history');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch udhar history');
    }
  },

  async createUdhar(data: { consumerId: string; amount: number; notes?: string }) {
    try {
      const response = await API.post('/vendor/udhar', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create udhar');
    }
  },

  async updateUdhar(id: string, data: { amount?: number; notes?: string }) {
    try {
      const response = await API.put(`/vendor/udhar/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update udhar');
    }
  },

  async deleteUdhar(id: string) {
    try {
      const response = await API.delete(`/vendor/udhar/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete udhar');
    }
  },

  async updateOrderPayment(orderId: string) {
    try {
      const response = await API.put(`/vendor/orders/${orderId}/payment`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update payment');
    }
  },

  async getLiveEvents() {
    try {
      const response = await API.get('/vendor/events');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch live events');
    }
  },
  
  async updateSettings(data: { pricePerCan?: number; deliveryBaseFee?: number; deliveryPerKmFee?: number; businessName?: string; description?: string }) {
    try {
      const response = await API.put('/vendor/profile/settings', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update settings');
    }
  }
};

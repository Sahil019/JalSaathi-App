import API from './api';

export const consumerService = {
  async getHomeStats() {
    try {
      const response = await API.get('/consumer/home-stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch home stats');
    }
  },

  async getNearbyVendors() {
    try {
      const response = await API.get('/vendors/nearby');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendors');
    }
  },

  async getVendorById(id: string) {
    try {
      const response = await API.get(`/vendors/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendor details');
    }
  },

  async createVendorRequest(vendorId: string) {
    try {
      const response = await API.post('/vendor-requests/create', { vendorId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send request');
    }
  },

  async getMyVendorRequests() {
    try {
      const response = await API.get('/vendor-requests/my');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch requests');
    }
  },

  async getLatestOrder() {
    try {
      const response = await API.get('/orders/latest');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch latest order');
    }
  },

  async getOrders() {
    try {
      const response = await API.get('/orders');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch orders');
    }
  },

  async getWalletTransactions() {
    try {
      const response = await API.get('/wallet');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  },

  async getOrderById(id: string) {
    try {
      const response = await API.get(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  },

  async addMoney(amount: number) {
    try {
      const response = await API.post('/wallet/add', { amount });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add money');
    }
  },

  async createOrder(data: { vendorId: string; quantity: number; address: string; notes?: string }) {
    try {
      const response = await API.post('/orders', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  async getActiveSubscription() {
    try {
      const response = await API.get('/subscriptions/active');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subscription');
    }
  },

  async createSubscription(data: { vendorId: string; type: string; quantity: number; frequency: string; startDate: string }) {
    try {
      const response = await API.post('/subscriptions', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create subscription');
    }
  }
};

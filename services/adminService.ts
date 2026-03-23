import API from './api';

export const adminService = {
  async getDashboardStats() {
    try {
      const response = await API.get('/admin/dashboard-stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
    }
  },

  async getRecentActivities() {
    try {
      const response = await API.get('/admin/recent-activities');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch activities');
    }
  },

  async getVendors() {
    try {
      const response = await API.get('/admin/vendors');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vendors');
    }
  },

  async getConsumers() {
    try {
      const response = await API.get('/admin/consumers');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch consumers');
    }
  },

  async updateVendor(id: string, data: any) {
    try {
      const response = await API.put(`/admin/vendors/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update vendor');
    }
  },

  async deleteVendor(id: string) {
    try {
      const response = await API.delete(`/admin/vendors/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete vendor');
    }
  },

  async updateConsumer(id: string, data: any) {
    try {
      const response = await API.put(`/admin/consumers/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update consumer');
    }
  },

  async deleteConsumer(id: string) {
    try {
      const response = await API.delete(`/admin/consumers/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete consumer');
    }
  },

  async getAllOrders() {
    try {
      const response = await API.get('/admin/orders');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all orders');
    }
  },

  async getReports(range: string = '30days') {
    try {
      const response = await API.get(`/admin/reports?range=${range}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reports');
    }
  },

  async getReportsExport(range: string = '30days', type: string = 'full') {
    try {
      const response = await API.get(`/admin/reports/export?range=${range}&type=${type}`, { responseType: 'blob' });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export reports');
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

  async updateOrderStatus(id: string, status: string) {
    try {
      const response = await API.put(`/vendor/orders/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
  },

  async getAllDeliveryBoys() {
    try {
      const response = await API.get('/admin/delivery-boys');
      return response.data;
    } catch (error: any) {
      // Fallback to generic delivery-boys endpoint
      try {
        const fallback = await API.get('/delivery-boys');
        return fallback.data;
      } catch (e2: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch delivery boys');
      }
    }
  },

  async getVehicleStats() {
    try {
      const response = await API.get('/admin/vehicle-stats');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch vehicle stats');
    }
  },

  async updateDeliveryBoy(id: string, data: any) {
    try {
      const response = await API.put(`/delivery-boys/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update partner');
    }
  }
};

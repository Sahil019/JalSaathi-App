import API from './api';

export const deliveryService = {
  async getAssignedOrders() {
    try {
      // Try role-specific endpoint first, fallback to generic
      try {
        const response = await API.get('/delivery/orders');
        return response.data;
      } catch {
        const response = await API.get('/orders');
        return Array.isArray(response.data) ? response.data : (response.data?.orders || []);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch assigned orders');
    }
  },

  // Get a single order by ID (for delivery boy)
  async getOrderById(id: string) {
    try {
      const response = await API.get(`/orders/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  },

  async getProfile() {
    try {
      // Backend filters by user ID automatically for delivery_boy role
      const response = await API.get('/delivery-boys');
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  async updateStatus(status: 'AVAILABLE' | 'BUSY' | 'OFFLINE') {
    try {
      const response = await API.patch('/delivery-boys/status', { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update status');
    }
  },

  async getInsights(id: string) {
    try {
      const response = await API.get(`/delivery-boys/${id}/insights`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch insights');
    }
  },

  async updateOrderStatus(id: string, status: string) {
    try {
      const response = await API.put(`/vendor/orders/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update order');
    }
  },

  // Get delivery boy earnings summary (derived from profile insights)
  async getEarningsSummary() {
    try {
      const profileResponse = await API.get('/delivery-boys/me');
      const profile = profileResponse.data;
      const totalDeliveries = profile?.insights?.totalDeliveries || 0;

      let insights = profile?.insights || {};
      if (profile?._id) {
        try {
          const insightsRes = await API.get(`/delivery-boys/${profile._id}/insights`);
          insights = insightsRes.data;
        } catch (_) {
          // fallback
        }
      }

      return {
        profile,
        insights,
        totalDeliveries,
        estimatedEarnings: totalDeliveries * 10,
        performanceScore: profile?.insights?.performanceScore || 5.0,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch earnings');
    }
  },

  async getVehicleDetails() {
    try {
      const response = await API.get('/delivery-boys/me');
      return response.data;
    } catch (error: any) {
      // Fallback to list endpoint
      try {
        const fallback = await API.get('/delivery-boys');
        return Array.isArray(fallback.data) ? fallback.data[0] : fallback.data;
      } catch (e2: any) {
        throw new Error(error.response?.data?.message || 'Failed to fetch vehicle details');
      }
    }
  },

  async updateVehicleInfo(data: { vehicleNumber?: string; vehicleModel?: string; vehicleType?: string }) {
    try {
      // Assuming backend has a PATCH /delivery-boys/me or similar
      const response = await API.put('/delivery-boys/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update vehicle info');
    }
  }
};


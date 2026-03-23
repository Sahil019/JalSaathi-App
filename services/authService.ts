import API from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await API.post('/auth/login', { email, password });
      const { accessToken, user } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { user, token: accessToken };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  async demoLogin(role: string) {
    try {
      const response = await API.post('/auth/demo-login', { role });
      const { accessToken, user } = response.data;
      
      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { user, token: accessToken };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Demo login failed');
    }
  },

  async register(userData: any) {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  async getMe() {
    try {
      const response = await API.get('/auth/me');
      return response.data;
    } catch (error: any) {
      return null;
    }
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  async updateProfile(data: any) {
    try {
      const response = await API.put('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Update failed');
    }
  }
};

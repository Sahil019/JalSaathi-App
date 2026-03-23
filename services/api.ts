import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// For physical devices, use your computer's local IP address (e.g., 192.168.x.x)
const CONFIG = {
  BASE_URL: 'http://192.168.1.11:5000/api', // <-- UPDATE THIS IP FOR PHYSICAL DEVICES
  TIMEOUT: 10000,
};

const API = axios.create({
  baseURL: CONFIG.BASE_URL,
  timeout: CONFIG.TIMEOUT,
});

// Add a request interceptor to include the JWT token
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refreshes etc.
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Logic for refreshing token could go here if the backend supports it via headers
    }
    return Promise.reject(error);
  }
);

export default API;

// src/api/authApi.js
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const authApi = {
  // Student login
  loginStudent: async (credentials) => {
    try {
      const response = await api.post('/grabtutor/auth/login', {
        email: credentials.email,
        password: credentials.password,
        role: 'USER'  // Student role is USER
      });

      const { token, user } = response.data.data || {};

      if (token) {
        localStorage.setItem('token', token);
      }

      if (user && typeof user === 'object' && Object.keys(user).length > 0) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tutor login
  loginTutor: async (credentials) => {
    try {
      const response = await api.post('/grabtutor/auth/login', {
        email: credentials.email,
        password: credentials.password,
        // role: 'TUTOR'
      });

      const { token, user } = response.data.data || {};

      if (token) {
        localStorage.setItem('token', token);
      }

      if (user && typeof user === 'object' && Object.keys(user).length > 0) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin login with username/password
  loginAdmin: async (credentials) => {
    try {
      const response = await api.post('/grabtutor/auth/login', {
        email: 'admin', // Using email as 'admin'
        password: 'admin',
        role: 'ADMIN'
      });

      const { token, user } = response.data.data || {};

      if (token) {
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify({
            ...user,
            role: 'ADMIN'
          }));
        }
      }

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Sai tên đăng nhập hoặc mật khẩu');
      }
      throw error;
    }
  },

  // Registration APIs remain the same
  sendRegisterOtp: async (email) => {
    try {
      const response = await axios.post(`${BASE_URL}/grabtutor/auth/send-register-otp`, { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  verifyOtp: async (otpData) => {
    try {
      const response = await axios.post(`${BASE_URL}/grabtutor/auth/verify-otp`, {
        email: otpData.email,
        otp: otpData.otp,
        type: 'REGISTER'
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/grabtutor/users`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default authApi;
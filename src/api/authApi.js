// src/api/authApi.js
import axios from 'axios';


const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    // Không thêm Authorization cho login/register/users
    if (
      config.url.includes('/auth/login') ||
      config.url.includes('/auth/register') ||
      config.url.includes('/grabtutor/users')
    ) {
      return config;
    }
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const authApi = {
  login: async (credentials) => {
    try {
      const response = await api.post('/grabtutor/auth/login', {
        email: credentials.email,
        password: credentials.password,
        role: credentials.role
      });

      // Log để kiểm tra dữ liệu trả về từ API
      console.log('authApi.login response:', response.data);

      const { token, user } = response.data.data || {};

      if (token) {
        localStorage.setItem('token', token);
      } else {
        console.warn('authApi: Không nhận được token từ API');
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        console.warn('authApi: Không nhận được user từ API');
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Đăng ký student - gọi /grabtutor/users
  registerStudent: async (userData) => {
    try {
      const response = await api.post('/grabtutor/users', {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        dob: userData.dob,
        phoneNumber: userData.phoneNumber,
        role: 'USER'  // ← Thay 'ROLE_USER' thành 'USER'
      });

      console.log('registerStudent response:', response.data);
      return response.data;
    } catch (error) {
      console.error('registerStudent error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đăng ký Tutor - gọi /grabtutor/users/addTutor
  registerTutor: async (userData) => {
    try {
      const response = await api.post('/grabtutor/users/addTutor', {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        dob: userData.dob,
        phoneNumber: userData.phoneNumber,
        nationalId: userData.nationalId,
        university: userData.university,
        highestAcademicDegree: userData.highestAcademicDegree,
        major: userData.major,
        role: 'TUTOR'  // ← Thay 'ROLE_TUTOR' thành 'TUTOR'
      });

      console.log('registerTutor response:', response.data);
      return response.data;
    } catch (error) {
      console.error('registerTutor error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Gửi OTP cho email đăng ký
  sendRegisterOtp: async (email) => {
    try {
      console.log('=== sendRegisterOtp START ===');
      console.log('Email:', email);
      console.log('Timestamp:', new Date().toISOString());
      
      const payload = {
        email: email.trim().toLowerCase()
      };
      
      console.log('Payload:', JSON.stringify(payload));
      
      const response = await api.post('/grabtutor/auth/send-register-otp', payload);
      
      console.log('=== sendRegisterOtp SUCCESS ===');
      console.log('Response:', response.data);
      console.log('Response timestamp:', new Date().toISOString());
      
      return response.data;
    } catch (error) {
      console.error('sendRegisterOtp error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Xác thực OTP
  verifyOtp: async (email, otp, delayMs = 0) => {
    try {
      if (delayMs > 0) {
        console.log(`Đợi ${delayMs}ms trước khi verify OTP mới...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      console.log('=== verifyOtp START ===');
      console.log('Email:', email);
      console.log('OTP/Code:', otp);
      console.log('Timestamp:', new Date().toISOString());
      
      // Kiểm tra dữ liệu input
      if (!email || !email.trim()) {
        throw new Error('Email không hợp lệ');
      }
      if (!otp || otp.trim().length === 0) {
        throw new Error('OTP không được để trống');
      }
      
      // Backend yêu cầu struct: { email, code } - KHÔNG phải otp!
      const payload = {
        email: email.trim().toLowerCase(),
        code: String(otp).trim()  // ← Thay otp thành code
      };
      
      console.log('=== Payload gửi ===');
      console.log('Email:', payload.email);
      console.log('Code:', payload.code);
      console.log('Code type:', typeof payload.code);
      console.log('Code length:', payload.code.length);
      console.log('Full payload:', JSON.stringify(payload));
      
      const response = await api.post('/grabtutor/auth/verify-otp', payload);
      
      console.log('=== verifyOtp SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('=== verifyOtp ERROR ===');
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Error message:', error.message);
      
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 'OTP xác thực thất bại';
        
        if (errorMsg.includes('OTP invalid') || errorMsg.includes('invalid')) {
          throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại OTP.');
        }
        throw new Error(errorMsg);
      }
      
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // ✅ POST - Đổi mật khẩu (require đăng nhập)
  changePassword: async (passwordData) => {
    try {
      console.log('=== changePassword START ===');
      console.log('Endpoint: POST /grabtutor/auth/change-password');
      
      const token = localStorage.getItem('token');
      
      // ✅ Backend yêu cầu: currentPassword, newPassword, confirmPassword
      const payload = {
        currentPassword: passwordData.oldPassword,  // ← Thay oldPassword thành currentPassword
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.newPassword
      };
      
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.post(
        '/grabtutor/auth/change-password',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('=== changePassword SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('=== changePassword ERROR ===');
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      throw error;
    }
  },

  // Gửi OTP cho forgot password
  sendForgotPasswordOtp: async (email) => {
    try {
      console.log('=== sendForgotPasswordOtp START ===');
      console.log('Email:', email);
      
      const payload = {
        email: email.trim().toLowerCase()
      };
      
      const response = await api.post('/grabtutor/auth/send-forgot-password-otp', payload);
      
      console.log('=== sendForgotPasswordOtp SUCCESS ===');
      return response.data;
    } catch (error) {
      console.error('sendForgotPasswordOtp error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Đổi mật khẩu quên
  changeForgotPassword: async (forgotPasswordData) => {
    try {
      console.log('=== changeForgotPassword START ===');
      
      const payload = {
        email: forgotPasswordData.email.trim().toLowerCase(),
        newPassword: forgotPasswordData.newPassword.trim(),
        confirmPassword: forgotPasswordData.confirmPassword.trim()
      };
      
      console.log('Payload:', JSON.stringify(payload, null, 2));
      
      const response = await api.post(
        '/grabtutor/auth/change-forgot-password',
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('=== changeForgotPassword SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('=== changeForgotPassword ERROR ===');
      console.error('Status:', error.response?.status);
      console.error('Error:', error.response?.data);
      throw error;
    }
  },
};

export default authApi;
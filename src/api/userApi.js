import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const userApi = {
  // Lấy thông tin người dùng hiện tại
  getMyInfo: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/grabtutor/users/myInfo`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin người dùng theo ID
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${BASE_URL}/grabtutor/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo người dùng mới (đăng ký)
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${BASE_URL}/grabtutor/users`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Gửi thông tin gia sư để xác thực
  addTutor: async (tutorData) => {
    try {
      const response = await axios.post(`${BASE_URL}/grabtutor/users/addTutor`, tutorData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách yêu cầu gia sư cho quản trị viên
  getTutorRequests: async (pageNo = 0, pageSize = 10, sorts = []) => {
    try {
      const response = await axios.get(`${BASE_URL}/grabtutor/users/requests`, {
        params: { pageNo, pageSize, sorts },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userApi;
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

  // ✅ NEW - Lấy số dư ví của user
  getMyBalance: async () => {
    try {
      console.log('=== getMyBalance START ===');
      
      const response = await axios.get(
        `${BASE_URL}/grabtutor/users/myBalance`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getMyBalance SUCCESS ===');
      console.log('Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ getMyBalance error:', error.response?.data || error.message);
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
  getTutorRequests: async (pageNo = 0, pageSize = 10) => {
    try {
      const url = `${BASE_URL}/grabtutor/users/requests?pageNo=${pageNo}&pageSize=${pageSize}&sorts=createdAt,desc`;
      console.log('=== getTutorRequests START ===');
      console.log('URL:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('=== getTutorRequests SUCCESS ===');
      console.log('Response data:', response.data);
      return response.data;
    } catch (error) {
      console.log('=== getTutorRequests ERROR ===');
      console.log('Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Lấy danh sách tất cả người dùng - SINGLE ENDPOINT
  getAllUsers: async (pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getAllUsers START ===');
      
      // ✅ Backend trả về: ApiResponse { message, data: { items: [...], totalPages } }
      const url = `${BASE_URL}/grabtutor/users/all?pageNo=${pageNo}&pageSize=${pageSize}&sorts=email:desc`;
      console.log('URL:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('=== getAllUsers SUCCESS ===');
      console.log('Response data:', response.data);
      
      // ✅ Backend structure: { message, data: { items, totalPages } }
      const responseData = response.data?.data || response.data;
      
      // Extract items và totalPages
      let items = [];
      let totalPages = 0;
      
      if (responseData?.items && Array.isArray(responseData.items)) {
        items = responseData.items;
        totalPages = responseData.totalPages || 0;
      } else if (Array.isArray(responseData)) {
        items = responseData;
      }
      
      console.log('Extracted items:', items.length);
      console.log('Total pages:', totalPages);
      
      // ✅ Filter users với role null/undefined
      const filteredItems = items.filter(user => {
        if (!user.role) {
          console.warn('⚠️ User without role:', user.id, user.email);
          return false;
        }
        return true;
      });
      
      console.log('After filtering:', filteredItems.length);
      
      // ✅ Return consistent format
      return {
        data: {
          items: filteredItems,
          totalPages: totalPages
        }
      };
      
    } catch (error) {
      console.log('=== getAllUsers ERROR ===');
      console.log('Error status:', error.response?.status);
      console.log('Error message:', error.response?.data?.message || error.message);
      console.log('Error data:', error.response?.data);
      
      // ✅ Graceful fallback
      console.log('⚠️ Returning empty users array');
      return {
        data: {
          items: [],
          totalPages: 0
        }
      };
    }
  },

  // Thay đổi trạng thái kích hoạt của người dùng
  changeActive: async (userId, active) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/grabtutor/users/active/${userId}?active=${active}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa người dùng
  deleteUser: async (userId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/grabtutor/users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Phê duyệt yêu cầu gia sư - sử dụng requestId
  approveTutorRequest: async (requestId) => {
    try {
      const payload = {
        requestId: requestId
      };
      
      const token = localStorage.getItem('token');
      console.log('=== approveTutorRequest START ===');
      console.log('Payload:', payload);
      
      const response = await axios.post(
        `${BASE_URL}/grabtutor/users/approve`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('=== approveTutorRequest SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('=== approveTutorRequest ERROR ===');
      console.log('Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Từ chối yêu cầu gia sư - sử dụng requestId
  rejectTutorRequest: async (requestId, reason = '') => {
    try {
      const payload = {
        requestId: requestId,
        reason: reason
      };
      
      const token = localStorage.getItem('token');
      console.log('=== rejectTutorRequest START ===');
      console.log('Payload:', payload);
      
      const response = await axios.post(
        `${BASE_URL}/grabtutor/users/reject`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('=== rejectTutorRequest SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('=== rejectTutorRequest ERROR ===');
      console.log('Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ UPDATE - Cập nhật profile user
  updateProfile: async (profileData) => {
    try {
      console.log('=== updateProfile START ===');
      
      const token = localStorage.getItem('token');
      
      const payload = {
        fullName: profileData.fullName || '',
        phoneNumber: profileData.phoneNumber || '',
        dob: profileData.dob || '',
        password: ''
      };
      
      console.log('Payload:', payload);
      
      // ✅ Thử endpoint 1: PUT /grabtutor/users/profile
      try {
        console.log('1️⃣ Trying: PUT /grabtutor/users/profile');
        const response = await axios.put(
          `${BASE_URL}/grabtutor/users/profile`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log('✅ SUCCESS with PUT /grabtutor/users/profile');
        return response.data;
      } catch (err1) {
        console.error('❌ Failed:', err1.response?.status);
        
        // ✅ Thử endpoint 2: PUT /grabtutor/users/me
        try {
          console.log('2️⃣ Trying: PUT /grabtutor/users/me');
          const response = await axios.put(
            `${BASE_URL}/grabtutor/users/me`,
            payload,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('✅ SUCCESS with PUT /grabtutor/users/me');
          return response.data;
        } catch (err2) {
          console.error('❌ Failed:', err2.response?.status);
          
          // ✅ Thử endpoint 3: PATCH /grabtutor/users/profile
          try {
            console.log('3️⃣ Trying: PATCH /grabtutor/users/profile');
            const response = await axios.patch(
              `${BASE_URL}/grabtutor/users/profile`,
              payload,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log('✅ SUCCESS with PATCH /grabtutor/users/profile');
            return response.data;
          } catch (err3) {
            console.error('❌ All endpoints failed!');
            throw err1;
          }
        }
      }
    } catch (error) {
      console.error('=== updateProfile ERROR ===');
      console.error('Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - Get tutor info by tutorId (TutorInfoResponse)
  getTutorInfo: async (tutorId) => {
    try {
      console.log('=== getTutorInfo START ===');
      console.log('tutorId:', tutorId);
      
      const response = await axios.get(
        `${BASE_URL}/grabtutor/users/tutorInfo/${tutorId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getTutorInfo SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getTutorInfo error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - Update tutor info (TutorInfoResponse fields only)
  updateTutorInfo: async (tutorData) => {
    try {
      console.log('=== updateTutorInfo START ===');
      console.log('tutorData:', tutorData);
      
      // ✅ Get userId from user context or localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const userId = user?.userId;
      
      console.log('userId from localStorage:', userId);
      
      if (!userId) {
        throw new Error('❌ userId is missing - User not found');
      }
      
      // ✅ Include userId in payload
      const payload = {
        userId: userId,  // ✅ ADD THIS - Backend requires userId
        nationalId: tutorData.nationalId || '',
        university: tutorData.university || '',
        highestAcademicDegree: tutorData.highestAcademicDegree || '',
        major: tutorData.major || ''
      };
      
      console.log('=== Payload (with userId) ===');
      console.log(JSON.stringify(payload, null, 2));
      
      const response = await axios.put(
        `${BASE_URL}/grabtutor/users/updateTutorInfo`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('=== updateTutorInfo SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('=== updateTutorInfo ERROR ===');
      console.error('Error:', error.response?.data || error.message);
      throw error;
    }
  },
};


export default userApi;
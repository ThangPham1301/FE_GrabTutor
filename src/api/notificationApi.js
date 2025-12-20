import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';
const DEBUG = true;

const notificationApi = {
  // ✅ GET - Lấy notifications của user
  getNotificationByUserId: async (userId, pageNo = 0, pageSize = 10) => {
    try {
      if (DEBUG) console.log('=== getNotificationByUserId START ===');
      if (DEBUG) console.log('userId:', userId, 'pageNo:', pageNo, 'pageSize:', pageSize);

      const response = await axios.get(
        `${BASE_URL}/notification`,
        {
          params: {
            userId: userId,
            pageNo: pageNo,
            pageSize: pageSize
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (DEBUG) console.log('=== getNotificationByUserId SUCCESS ===');
      if (DEBUG) console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getNotificationByUserId error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default notificationApi;
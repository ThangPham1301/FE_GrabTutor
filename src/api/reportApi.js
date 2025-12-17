import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';

const reportApi = {
  // CREATE - Tạo report
  createReport: async (postId, reportData) => {
    try {
      const payload = {
        detail: reportData.detail || reportData.description || ''
      };
      
      console.log('=== createReport START ===');
      console.log('postId:', postId);
      console.log('Payload:', payload);
      
      const response = await axios.post(
        `${BASE_URL}/reports/post/${postId}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== createReport SUCCESS ===');
      console.log('Response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('createReport error:', error.response?.data || error.message);
      throw error;
    }
  },

  // READ - Lấy report by ID
  getReportById: async (reportId) => {
    try {
      console.log('=== getReportById START ===');
      console.log('reportId:', reportId);
      
      const response = await axios.get(
        `${BASE_URL}/reports/${reportId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getReportById SUCCESS ===');
      console.log('Response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getReportById error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - GET ALL REPORTS (Admin)
  getAllReports: async (pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getAllReports START ===');
      console.log('pageNo:', pageNo, 'pageSize:', pageSize);
      
      const response = await axios.get(
        `${BASE_URL}/reports/all?pageNo=${pageNo}&pageSize=${pageSize}&sorts=createdAt:desc`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getAllReports SUCCESS ===');
      console.log('Response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getAllReports error:', error.response?.data || error.message);
      throw error;
    }
  },

  // READ - Lấy reports nhận được (Student/Tutor bị báo cáo)
  getReportByReceivedId: async (receiverId, pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getReportByReceivedId START ===');
      console.log('receiverId:', receiverId);  // ✅ Log này sẽ show user ID gửi đi
      
      const response = await axios.get(
        `${BASE_URL}/reports/user/receiver/${receiverId}`,
        {
          params: {
            pageNo,
            pageSize,
            sortBy: 'createdAt:desc'
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getReportByReceivedId SUCCESS ===');
      console.log('Response:', response.data);
      
      // ✅ Thêm log để kiểm tra items
      console.log('Items count:', response.data?.data?.items?.length || 0);
      
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getReportByReceivedId error:', error.response?.data || error.message);
      throw error;
    }
  },

  // READ - Lấy reports gửi đi (Student/Tutor gửi báo cáo)
  getReportBySenderId: async (senderId, pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getReportBySenderId START ===');
      console.log('senderId:', senderId);
      
      const response = await axios.get(
        `${BASE_URL}/reports/user/sender/${senderId}`,
        {
          params: {
            pageNo,
            pageSize,
            sortBy: 'createdAt:desc'
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getReportBySenderId SUCCESS ===');
      console.log('Response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getReportBySenderId error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - RESOLVE REPORT (Admin - PUT /grabtutor/room/resolve)
  resolveReport: async (roomId, isNormal = true) => {
    try {
      console.log('=== resolveReport START ===');
      console.log('roomId:', roomId);
      console.log('isNormal:', isNormal);
      
      const response = await axios.put(
        `${BASE_URL}/room/resolve?roomId=${roomId}&isNormal=${isNormal}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== resolveReport SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('resolveReport error:', error.response?.data || error.message);
      throw error;
    }
  },

  // DELETE - Xóa report
  deleteReport: async (reportId) => {
    try {
      console.log('=== deleteReport START ===');
      console.log('reportId:', reportId);
      
      const response = await axios.delete(
        `${BASE_URL}/reports/${reportId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== deleteReport SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('deleteReport error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default reportApi;
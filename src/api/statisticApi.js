import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';

const statisticApi = {
  // ✅ GET user totals
  getUserTotals: async () => {
    try {
      console.log('=== getUserTotals START ===');
      const response = await axios.get(
        `${BASE_URL}/statistic/user-totals`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('✅ getUserTotals SUCCESS:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getUserTotals error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ GET user status by role
  getUserStatus: async (role = 'user', pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getUserStatus START ===');
      console.log('role:', role);
      const response = await axios.get(
        `${BASE_URL}/statistic/user-status`,
        {
          params: {
            role: role,
            pageNo: pageNo,
            pageSize: pageSize
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('✅ getUserStatus SUCCESS:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getUserStatus error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ GET post status
  getPostStatus: async () => {
    try {
      console.log('=== getPostStatus START ===');
      const response = await axios.get(
        `${BASE_URL}/statistic/post-status`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('✅ getPostStatus SUCCESS:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getPostStatus error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ GET review stars by tutor
  getReviewStars: async (pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getReviewStars START ===');
      const response = await axios.get(
        `${BASE_URL}/statistic/review-stars`,
        {
          params: {
            pageNo: pageNo,
            pageSize: pageSize
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('✅ getReviewStars SUCCESS:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getReviewStars error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - GET revenue and profit statistics by year
  getRevenueProfit: async (year = new Date().getFullYear()) => {
    try {
      console.log('=== getRevenueProfit START ===');
      console.log('year:', year);
      
      const response = await axios.get(
        `${BASE_URL}/statistic/revenue-profit`,
        {
          params: {
            year: year
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('✅ getRevenueProfit SUCCESS:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ getRevenueProfit error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default statisticApi;
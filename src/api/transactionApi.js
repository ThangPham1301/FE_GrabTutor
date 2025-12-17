import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';
const DEBUG = true;

const transactionApi = {
  // ✅ Khởi tạo giao dịch nạp tiền - POST method
  startTransaction: async (amount) => {
    try {
      console.log('=== startTransaction START ===');
      console.log('Amount:', amount);
      
      const response = await axios.post(
        `${BASE_URL}/transaction?amount=${amount}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== startTransaction SUCCESS ===');
      console.log('Response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('startTransaction error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - Withdraw money from wallet
  withdrawBalance: async (withdrawAmount) => {
    try {
      if (DEBUG) console.log('=== withdrawBalance START ===');
      if (DEBUG) console.log('withdrawAmount:', withdrawAmount);

      const response = await axios.post(
        `${BASE_URL}/transaction/withdraw?withdrawAmount=${withdrawAmount}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (DEBUG) console.log('=== withdrawBalance SUCCESS ===');
      if (DEBUG) console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('withdrawBalance error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - Get my virtual transactions (User/Tutor)
  getMyVirtualTransactions: async (pageNo = 0, pageSize = 10, sorts = 'transactionDate:desc') => {
    try {
      if (DEBUG) console.log('=== getMyVirtualTransactions START ===');
      if (DEBUG) console.log('pageNo:', pageNo, 'pageSize:', pageSize);

      const response = await axios.get(
        `${BASE_URL}/transaction/myVirtualTransactions`,
        {
          params: {
            pageNo: pageNo,
            pageSize: pageSize,
            sorts: sorts
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (DEBUG) console.log('=== getMyVirtualTransactions SUCCESS ===');
      if (DEBUG) console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getMyVirtualTransactions error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - Get all virtual transactions (Admin only)
  getAllVirtualTransactions: async (pageNo = 0, pageSize = 10, sorts = 'transactionDate:desc') => {
    try {
      if (DEBUG) console.log('=== getAllVirtualTransactions START ===');
      if (DEBUG) console.log('pageNo:', pageNo, 'pageSize:', pageSize);

      const response = await axios.get(
        `${BASE_URL}/transaction/allVirtualTransactions`,
        {
          params: {
            pageNo: pageNo,
            pageSize: pageSize,
            sorts: sorts
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (DEBUG) console.log('=== getAllVirtualTransactions SUCCESS ===');
      if (DEBUG) console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getAllVirtualTransactions error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Legacy - Get all user transactions (Admin)
  getAllUserTransactions: async (pageNo = 0, pageSize = 10, sorts = 'createdAt:desc') => {
    try {
      if (DEBUG) console.log('=== getAllUserTransactions START (Admin) ===');
      if (DEBUG) console.log('pageNo:', pageNo, 'pageSize:', pageSize, 'sorts:', sorts);

      const response = await axios.get(
        `${BASE_URL}/transaction/userTransaction`,
        {
          params: {
            pageNo: pageNo,
            pageSize: pageSize,
            sorts: sorts
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (DEBUG) console.log('=== getAllUserTransactions SUCCESS ===');
      if (DEBUG) console.log('Response:', response.data);

      const data = response.data?.data || response.data;
      return {
        ...response.data,
        data: data
      };
    } catch (error) {
      console.error('getAllUserTransactions error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Legacy - Get my user transactions (Student/Tutor)
  getMyUserTransactions: async (pageNo = 0, pageSize = 10, sorts = 'createdAt:desc') => {
    try {
      if (DEBUG) console.log('=== getMyUserTransactions START (User) ===');
      if (DEBUG) console.log('pageNo:', pageNo, 'pageSize:', pageSize, 'sorts:', sorts);

      const response = await axios.get(
        `${BASE_URL}/transaction/myUserTransaction`,
        {
          params: {
            pageNo: pageNo,
            pageSize: pageSize,
            sorts: sorts
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (DEBUG) console.log('=== getMyUserTransactions SUCCESS ===');
      if (DEBUG) console.log('Response:', response.data);

      const data = response.data?.data || response.data;
      return {
        ...response.data,
        data: data
      };
    } catch (error) {
      console.error('getMyUserTransactions error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Legacy
  getMyTransactions: async (pageNo = 0, pageSize = 10) => {
    try {
      if (DEBUG) console.log('=== getMyTransactions START (Legacy) ===');
      return await transactionApi.getMyUserTransactions(pageNo, pageSize);
    } catch (error) {
      console.error('getMyTransactions error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default transactionApi;
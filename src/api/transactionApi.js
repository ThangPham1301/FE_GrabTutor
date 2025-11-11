import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';

const transactionApi = {
  // ✅ Khởi tạo giao dịch nạp tiền - POST method
  startTransaction: async (amount) => {
    try {
      console.log('=== startTransaction START ===');
      console.log('Amount:', amount);
      
      // ✅ Thay GET → POST
      const response = await axios.post(
        `${BASE_URL}/transaction?amount=${amount}`,
        {},  // ✅ Thêm empty body cho POST request
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
  }
};

export default transactionApi;
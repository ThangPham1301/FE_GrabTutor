import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';

const reviewApi = {
  // CREATE - Tạo review
  createReview: async (postId, reviewData) => {
    try {
      const payload = {
        stars: reviewData.stars,
        description: reviewData.description || ''
      };
      
      console.log('=== createReview START ===');
      console.log('postId:', postId);
      console.log('Payload:', payload);
      
      const response = await axios.post(
        `${BASE_URL}/reviews/post/${postId}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== createReview SUCCESS ===');
      console.log('Response:', response.data);
      // Backend trả về ApiResponse { message, data }
      return response.data?.data || response.data;
    } catch (error) {
      console.error('createReview error:', error.response?.data || error.message);
      throw error;
    }
  },

  // READ - Lấy review theo postId (Backend trả về Array, lấy phần tử đầu)
  getReviewByPostId: async (postId) => {
    try {
      console.log('=== getReviewByPostId START ===');
      console.log('postId:', postId);
      
      const response = await axios.get(
        `${BASE_URL}/reviews/post/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getReviewByPostId SUCCESS ===');
      console.log('Full Response:', response.data);
      
      let reviewData = response.data?.data || response.data;
      console.log('Review Data:', reviewData);
      console.log('Is Array?:', Array.isArray(reviewData));
      
      // ✅ Backend trả về Array, nhưng mỗi post chỉ có 1 review
      // → Lấy phần tử đầu tiên
      if (Array.isArray(reviewData)) {
        console.log('Array detected, length:', reviewData.length);
        if (reviewData.length > 0) {
          console.log('Returning first element:', reviewData[0]);
          return reviewData[0];  // ← Trả về object, không phải array
        } else {
          console.log('Array empty, returning null');
          return null;
        }
      }
      
      // Nếu đã là object
      console.log('Already an object, returning as is');
      return reviewData;
    } catch (error) {
      console.error('getReviewByPostId error:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      
      // Nếu không có review (404 hoặc 500), return null
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log('No review found for this post (404/500)');
        return null;
      }
      throw error;
    }
  },

  // READ - Lấy review theo userId
  getReviewByUserId: async (userId) => {
    try {
      console.log('=== getReviewByUserId START ===');
      console.log('userId:', userId);
      
      const response = await axios.get(
        `${BASE_URL}/reviews/user/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getReviewByUserId SUCCESS ===');
      console.log('Response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getReviewByUserId error:', error.response?.data || error.message);
      throw error;
    }
  },

  // READ - Lấy review theo reviewId
  getReviewById: async (reviewId) => {
    try {
      console.log('=== getReviewById START ===');
      console.log('reviewId:', reviewId);
      
      const response = await axios.get(
        `${BASE_URL}/reviews/${reviewId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getReviewById SUCCESS ===');
      console.log('Response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getReviewById error:', error.response?.data || error.message);
      throw error;
    }
  },

  // READ - Lấy review của user hiện tại
  getMyReview: async () => {
    try {
      console.log('=== getMyReview START ===');
      
      const response = await axios.get(
        `${BASE_URL}/reviews/me`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getMyReview SUCCESS ===');
      console.log('Response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getMyReview error:', error.response?.data || error.message);
      throw error;
    }
  },

  // UPDATE - Cập nhật review theo reviewId
  updateReview: async (reviewId, reviewData) => {
    try {
      const payload = {
        stars: reviewData.stars,
        description: reviewData.description || ''
      };
      
      console.log('=== updateReview START ===');
      console.log('reviewId:', reviewId);
      console.log('Payload:', payload);
      
      const response = await axios.put(
        `${BASE_URL}/reviews/${reviewId}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== updateReview SUCCESS ===');
      console.log('Response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('updateReview error:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // DELETE - Xóa review theo reviewId
  deleteReview: async (reviewId) => {
    try {
      console.log('=== deleteReview START ===');
      console.log('reviewId:', reviewId);
      
      const response = await axios.delete(
        `${BASE_URL}/reviews/${reviewId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== deleteReview SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('deleteReview error:', error.response?.data || error.message);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }
};

export default reviewApi;
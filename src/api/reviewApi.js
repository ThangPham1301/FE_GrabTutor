import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';

const reviewApi = {
  // ✅ CREATE - Tạo review
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
      return response.data?.data || response.data;
    } catch (error) {
      console.error('createReview error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ UPDATE - Cập nhật review theo reviewId
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
      throw error;
    }
  },

  // ✅ READ - Lấy review theo postId
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
      
      // Backend trả về Array, nhưng mỗi post chỉ có 1 review
      if (Array.isArray(reviewData)) {
        console.log('Array detected, length:', reviewData.length);
        if (reviewData.length > 0) {
          console.log('Returning first element:', reviewData[0]);
          return reviewData[0];
        } else {
          console.log('Array empty, returning null');
          return null;
        }
      }
      
      console.log('Already an object, returning as is');
      return reviewData;
    } catch (error) {
      console.error('getReviewByPostId error:', error.response?.data || error.message);
      
      // Nếu không có review (404 hoặc 500), return null
      if (error.response?.status === 404 || error.response?.status === 500) {
        console.log('No review found for this post (404/500)');
        return null;
      }
      throw error;
    }
  },

  // ✅ READ - Lấy review theo userId (sender - người review)
  getReviewByUserId: async (userId, pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getReviewByUserId START ===');
      
      const response = await axios.get(
        `${BASE_URL}/reviews/sender/${userId}`,
        {
          params: { pageNo, pageSize },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getReviewByUserId SUCCESS ===');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getReviewByUserId error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ READ - Lấy reviews nhận được (receiver - người bị review)
  getReviewsByReceiverId: async (receiverId, pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getReviewsByReceiverId START ===');
      
      const response = await axios.get(
        `${BASE_URL}/reviews/receiver/${receiverId}`,
        {
          params: { pageNo, pageSize },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getReviewsByReceiverId SUCCESS ===');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getReviewsByReceiverId error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ READ - Lấy review của user hiện tại
  getMyReview: async (pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getMyReview START ===');
      
      const response = await axios.get(
        `${BASE_URL}/reviews/me`,
        {
          params: { pageNo, pageSize },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('=== getMyReview SUCCESS ===');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('getMyReview error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ DELETE - Xóa review
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
      return response.data;
    } catch (error) {
      console.error('deleteReview error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default reviewApi;
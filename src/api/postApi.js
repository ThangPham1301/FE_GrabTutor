import axios from 'axios';
import adminApi from './adminApi';

const BASE_URL = 'http://localhost:8080/grabtutor';

const postApi = {
  // Tạo bài đăng mới
  createPost: async (postData) => {
    try {
      const formData = new FormData();
      
      // Gửi post data dưới dạng JSON string với key 'post' (backend cần 'post')
      formData.append('post', JSON.stringify({
        title: postData.title,
        description: postData.description
      }));
      
      // Gửi subjectId như một form field riêng
      if (postData.subjectId) {
        formData.append('subjectId', String(postData.subjectId));
      }
      
      if (postData.file) {
        formData.append('file', postData.file);
      }

      console.log('=== createPost START ===');
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (key === 'file') {
          console.log(key, ':', value.name, '(' + value.type + ')');
        } else {
          console.log(key, ':', value);
        }
      }

      const response = await axios.post(
        `${BASE_URL}/posts`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // <-- bỏ 'Content-Type' để axios/browser set boundary tự động
          }
        }
      );
      
      console.log('=== createPost SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('createPost error response data:', error.response?.data);
      console.error('createPost error message:', error.message);
      throw error;
    }
  },

  // Lấy danh sách bài đăng của user hiện tại
  getMyPosts: async (pageNo = 0, pageSize = 10) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.userId;
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const url = `${BASE_URL}/posts/user/${userId}?pageNo=${pageNo}&pageSize=${pageSize}&sorts=`;
      console.log('=== getMyPosts START ===');
      console.log('URL:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('=== getMyPosts SUCCESS ===');
      console.log('Response data:', response.data);
      
      // Thêm subject name vào mỗi post
      if (response.data?.data?.items) {
        response.data.data.items = response.data.data.items.map(post => ({
          ...post,
          subjectName: post.subject?.name || 'N/A'
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('getMyPosts error:', error);
      throw error;
    }
  },

  // ✅ FIXED: getAllPosts - NO auth needed
  getAllPosts: async (pageNo = 0, pageSize = 10, sorts = '') => {
    try {
      const url = `${BASE_URL}/posts/all?pageNo=${pageNo}&pageSize=${pageSize}&sorts=${sorts}`;
      
      // ✅ No Authorization header - endpoint is public
      const response = await axios.get(url);
      
      console.log('getAllPosts response:', response.data);
      
      if (response.data?.data?.items) {
        response.data.data.items = response.data.data.items.map(post => ({
          ...post,
          subjectName: post.subject?.name || 'N/A'
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('getAllPosts error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ FIXED: getPostById - NO auth needed for public posts
  getPostById: async (postId) => {
    try {
      console.log('=== getPostById START ===');
      console.log('postId:', postId);

      // ✅ Try without auth first
      const response = await axios.get(
        `${BASE_URL}/posts/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
      );

      console.log('=== getPostById SUCCESS ===');
      console.log('Response:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ getPostById error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ FIXED: searchPostsByName - NO auth needed
  searchPostsByName: async (keyword, pageNo = 0, pageSize = 10, sorts = '') => {
    try {
      console.log('=== searchPostsByName START ===');
      console.log('keyword:', keyword);

      // ✅ No Authorization header - endpoint is public
      const response = await axios.get(
        `${BASE_URL}/posts/search?keyword=${keyword}&pageNo=${pageNo}&pageSize=${pageSize}&sorts=${sorts}`
      );

      console.log('=== searchPostsByName SUCCESS ===');
      console.log('Response:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ searchPostsByName error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Cập nhật bài đăng
  updatePost: async (postId, postData) => {
    try {
      const formData = new FormData();
      
      // Gửi post data dưới dạng JSON string với key 'post'
      formData.append('post', JSON.stringify({
        title: postData.title,
        description: postData.description
      }));
      
      if (postData.subjectId) {
        formData.append('subjectId', String(postData.subjectId));
      }
      
      if (postData.file) {
        formData.append('file', postData.file);
      }

      console.log('=== updatePost START ===');
      for (let [key, value] of formData.entries()) {
        if (key === 'file') {
          console.log(key, ':', value.name);
        } else {
          console.log(key, ':', value);
        }
      }

      const response = await axios.put(
        `${BASE_URL}/posts/${postId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // <-- bỏ 'Content-Type' để axios/browser set boundary tự động
          }
        }
      );
      
      console.log('=== updatePost SUCCESS ===');
      return response.data;
    } catch (error) {
      console.error('updatePost error response data:', error.response?.data);
      console.error('updatePost error message:', error.message);
      throw error;
    }
  },

  // Xóa bài đăng
  deletePost: async (postId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/posts/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('deletePost error:', error);
      throw error;
    }
  },

  // Lấy danh sách môn học
  getSubjects: async () => {
    try {
      console.log('=== Fetching subjects ===');
      const response = await adminApi.getSubjects(0, 100);
      console.log('getSubjects response:', response);
      return response;
    } catch (error) {
      console.error('getSubjects error:', error);
      throw error;
    }
  },

  // ✅ NEW - TUTOR accepts a post (creates a bid)
  tutorBid: async (bidData) => {
    try {
      console.log('=== tutorBid START ===');
      console.log('Bid data:', bidData);

      const response = await axios.post(
        `${BASE_URL}/posts/tutorBid`,
        {
          proposedPrice: bidData.proposedPrice,
          questionLevel: bidData.questionLevel,
          description: bidData.description,
          postId: bidData.postId
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== tutorBid SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('tutorBid error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - Get all tutor bids
  getMyTutorBids: async (pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getMyTutorBids START ===');
      
      const response = await axios.get(
        `${BASE_URL}/posts/myTutorBids?pageNo=${pageNo}&pageSize=${pageSize}&sorts=`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== getMyTutorBids SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getMyTutorBids error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - Check if tutor already bid on this post
  checkTutorBidExists: async (postId) => {
    try {
      console.log('=== checkTutorBidExists START ===');
      console.log('postId:', postId);

      const response = await axios.get(
        `${BASE_URL}/posts/${postId}/tutorBid/check`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== checkTutorBidExists SUCCESS ===');
      console.log('Response:', response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('checkTutorBidExists error:', error.response?.data || error.message);
      // Return false if endpoint doesn't exist or error
      return false;
    }
  },

  // ✅ NEW - Get all tutor bids for a post
  getTutorBidsForPost: async (postId) => {
    try {
      console.log('=== getTutorBidsForPost START ===');
      console.log('postId:', postId);

      const response = await axios.get(
        `${BASE_URL}/posts/tutorBid/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== getTutorBidsForPost SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getTutorBidsForPost error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - Accept a tutor bid
  acceptTutorBid: async (tutorBidId) => {
    try {
      console.log('=== acceptTutorBid START ===');
      console.log('tutorBidId:', tutorBidId);

      const response = await axios.put(
        `${BASE_URL}/posts/acceptTutor/${tutorBidId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== acceptTutorBid SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('acceptTutorBid error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ NEW - Delete a tutor bid
  deleteTutorBid: async (tutorBidId) => {
    try {
      console.log('=== deleteTutorBid START ===');
      console.log('tutorBidId:', tutorBidId);

      const response = await axios.put(
        `${BASE_URL}/posts/tutorBid/${tutorBidId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== deleteTutorBid SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('deleteTutorBid error:', error.response?.data || error.message);
      throw error;
    }
  }

};

export default postApi;
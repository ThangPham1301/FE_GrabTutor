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
      
      const url = `${BASE_URL}/posts/user/${userId}?pageNo=${pageNo}&pageSize=${pageSize}`;
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

  // Lấy danh sách bài đăng
  getAllPosts: async (pageNo = 0, pageSize = 10) => {
    try {
      const url = `${BASE_URL}/posts/all?pageNo=${pageNo}&pageSize=${pageSize}&sorts=`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
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

  // Lấy bài đăng theo ID
  getPostById: async (postId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('=== getPostById START ===');
      console.log('postId:', postId);
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      console.log('Token preview:', token?.substring(0, 50) + '...');
      
      const response = await axios.get(
        `${BASE_URL}/posts/${postId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('=== getPostById SUCCESS ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data?.data) {
        response.data.data.subjectName = response.data.data.subject?.name || 'N/A';
      }
      
      return response.data;
    } catch (error) {
      console.log('=== getPostById ERROR ===');
      console.log('Error status:', error.response?.status);
      console.log('Error message:', error.response?.data?.message);
      console.log('Error data:', error.response?.data);
      console.log('Full error:', error);
      
      console.error('getPostById error:', error);
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
  }
};

export default postApi;
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const adminApi = {
 
  getSubjects: async (pageNo = 0, pageSize = 10) => {
    try {
      const url = `${BASE_URL}/grabtutor/subjects?pageNo=${pageNo}&pageSize=${pageSize}&sorts=`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('getSubjects response:', response.data);
      return response.data;
    } catch (error) {
      console.error('getSubjects error:', error);
      throw error;
    }
  },

 
  createSubject: async (subjectData) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/grabtutor/subjects`,
        {
          name: subjectData.name,
          description: subjectData.description
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('createSubject response:', response.data);
      return response.data;
    } catch (error) {
      console.error('createSubject error:', error.response?.data || error.message);
      throw error;
    }
  },


  deleteSubject: async (subjectId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/grabtutor/subjects/${subjectId}`,
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

  updateSubject: async (subjectId, subjectData) => {
    try {

      const response = await axios.post(
        `${BASE_URL}/grabtutor/subjects/${subjectId}`,
        {
          name: subjectData.name,
          description: subjectData.description
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('updateSubject response:', response.data);
      return response.data;
    } catch (error) {
      console.error('updateSubject error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default adminApi;
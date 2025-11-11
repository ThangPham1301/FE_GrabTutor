import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';

const courseApi = {
  createCourse: async (courseData) => {
    try {
      const formData = new FormData();

      formData.append('course', JSON.stringify({
        name: courseData.name,
        description: courseData.description,
        price: courseData.price || 0
      }));

      if (courseData.subjectIds && courseData.subjectIds.length > 0) {
        courseData.subjectIds.forEach(subjectId => {
          formData.append('subjectIds', subjectId);
        });
      }
      if (courseData.imageFile) {
        formData.append('image', courseData.imageFile);
      }

      console.log('=== createCourse START ===');
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (key === 'image') {
          console.log(key, ':', value.name, '(' + value.type + ')');
        } else {
          console.log(key, ':', value);
        }
      }

      const response = await axios.post(
        `${BASE_URL}/courses`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== createCourse SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ createCourse error response:', error.response?.data);
      console.error('❌ createCourse error message:', error.message);
      throw error;
    }
  },

  // ✅ FIXED: getCourseByCourseId - NO auth needed for published courses
  getCourseByCourseId: async (courseId) => {
    try {
      console.log('=== getCourseByCourseId START ===');
      console.log('courseId:', courseId);

      const response = await axios.get(
        `${BASE_URL}/courses/${courseId}`,
        {
          // ✅ Try without auth first
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
      );

      console.log('=== getCourseByCourseId SUCCESS ===');
      console.log('Response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ getCourseByCourseId error:', error.response?.data || error.message);
      throw error;
    }
  },
  updateCourse: async (courseId, courseData) => {
    try {
      const formData = new FormData();

      // ✅ Append course as JSON
      formData.append('course', JSON.stringify({
        name: courseData.name,
        description: courseData.description,
        price: courseData.price || 0
      }));

      // ✅ FIX: Append subjectIds correctly
      if (courseData.subjectIds && courseData.subjectIds.length > 0) {
        courseData.subjectIds.forEach(subjectId => {
          formData.append('subjectIds', subjectId);
        });
      }

      // ✅ Only append image if file exists
      if (courseData.imageFile) {
        formData.append('image', courseData.imageFile);
      }

      console.log('=== updateCourse START ===');
      console.log('courseId:', courseId);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        if (key === 'image') {
          console.log(key, ':', value.name);
        } else {
          console.log(key, ':', value);
        }
      }

      const response = await axios.put(
        `${BASE_URL}/courses/${courseId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            // ✅ Let browser set Content-Type with boundary
            // DO NOT set Content-Type here for FormData
          }
        }
      );

      console.log('=== updateCourse SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ updateCourse error:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteCourse: async (courseId) => {
    try {
      console.log('=== deleteCourse START ===');
      console.log('courseId:', courseId);

      const response = await axios.delete(
        `${BASE_URL}/courses/${courseId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== deleteCourse SUCCESS ===');
      return response.data;
    } catch (error) {
      console.error('❌ deleteCourse error:', error.response?.data || error.message);
      throw error;
    }
  },

  changePublishCourse: async (courseId, isPublished) => {
    try {
      console.log('=== changePublishCourse START ===');
      console.log('courseId:', courseId, 'isPublished:', isPublished);

      const response = await axios.put(
        `${BASE_URL}/courses/publish/${courseId}?isPublished=${isPublished}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== changePublishCourse SUCCESS ===');
      console.log('Full response.data:', response.data);
      
      // ✅ Response structure: { success, message, data: { ...course } }
      const courseData = response.data?.data;
      
      if (courseData && courseData.published !== undefined) {
        // ✅ Backend returns "published", map it to "isPublished"
        courseData.isPublished = courseData.published;
        console.log('✅ Mapped published -> isPublished:', courseData.isPublished);
      }

      // Return normalized response
      return {
        ...response.data,
        data: courseData
      };
    } catch (error) {
      console.error('❌ changePublishCourse error:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllCoursesByTutorId: async (tutorId, pageNo = 0, pageSize = 10, sorts = 'createdAt:desc') => {
    try {
      console.log('=== getAllCoursesByTutorId START ===');
      console.log('tutorId:', tutorId, 'pageNo:', pageNo, 'pageSize:', pageSize);

      const url = `${BASE_URL}/courses/tutor/${tutorId}?pageNo=${pageNo}&pageSize=${pageSize}&sorts=${sorts}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('=== getAllCoursesByTutorId SUCCESS ===');
      console.log('Response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ getAllCoursesByTutorId error:', error.response?.data || error.message);
      throw error;
    }
  },

  enrollCourse: async (courseId) => {
    try {
      console.log('=== enrollCourse START ===');
      console.log('courseId:', courseId);

      const response = await axios.post(
        `${BASE_URL}/courses/enroll/${courseId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== enrollCourse SUCCESS ===');
      console.log('Response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ enrollCourse error:', error.response?.data || error.message);
      throw error;
    }
  },

  getMyEnrolledCourses: async (pageNo = 0, pageSize = 10, sorts = 'createdAt:desc') => {
    try {
      console.log('=== getMyEnrolledCourses START ===');
      console.log('pageNo:', pageNo, 'pageSize:', pageSize);

      const url = `${BASE_URL}/courses/myEnrolledCourses?pageNo=${pageNo}&pageSize=${pageSize}&sorts=${sorts}`;

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('=== getMyEnrolledCourses SUCCESS ===');
      console.log('Response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ getMyEnrolledCourses error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ FIXED: getAllPublishedCourses - NO auth needed
  getAllPublishedCourses: async (pageNo = 0, pageSize = 10, sorts = 'createdAt:desc') => {
    try {
      console.log('=== getAllPublishedCourses START ===');
      console.log('pageNo:', pageNo, 'pageSize:', pageSize);

      const url = `${BASE_URL}/courses/all?pageNo=${pageNo}&pageSize=${pageSize}&sorts=${sorts}`;

      // ✅ No Authorization header - endpoint is public
      const response = await axios.get(url);

      console.log('=== getAllPublishedCourses SUCCESS ===');
      console.log('Response data:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ getAllPublishedCourses error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default courseApi;
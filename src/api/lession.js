import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';

const lessonApi = {
  // Create lesson
  createLesson: async (courseId, lessonData) => {
    try {
      const formData = new FormData();

      // Append lesson data as JSON string
      formData.append('courseId', courseId);
      formData.append('lesson', JSON.stringify({
        lessonNumber: lessonData.lessonNumber,
        title: lessonData.title,
        content: lessonData.content,
        isPreview: lessonData.isPreview || false
      }));

      // Append video file if provided
      if (lessonData.videoFile) {
        formData.append('video', lessonData.videoFile);
      }

      // Append image file if provided
      if (lessonData.imageFile) {
        formData.append('image', lessonData.imageFile);
      }

      console.log('=== createLesson START ===');
      console.log('courseId:', courseId);
      console.log('lessonData:', lessonData);

      const response = await axios.post(
        `${BASE_URL}/lessons`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('=== createLesson SUCCESS ===');
      console.log('Response:', response.data);
      
      // ✅ Normalize response - map backend fields to frontend fields
      const lessonData_ = response.data?.data;
      if (lessonData_) {
        lessonData_.isPublished = lessonData_.published;
        lessonData_.isPreview = lessonData_.preview;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ createLesson error:', error);
      throw error;
    }
  },

  // Get lesson by ID
  getLessonById: async (lessonId) => {
    try {
      console.log('=== getLessonById START ===');
      console.log('lessonId:', lessonId);

      const response = await axios.get(
        `${BASE_URL}/lessons/${lessonId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== getLessonById SUCCESS ===');
      console.log('Response:', response.data);
      
      // ✅ Normalize response
      const lessonData = response.data?.data;
      if (lessonData) {
        lessonData.isPublished = lessonData.published;
        lessonData.isPreview = lessonData.preview;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ getLessonById error:', error);
      throw error;
    }
  },

  // Get all lessons by course ID
  getAllLessonsByCourseId: async (courseId, pageNo = 0, pageSize = 10) => {
    try {
      console.log('=== getAllLessonsByCourseId START ===');
      console.log('courseId:', courseId, 'pageNo:', pageNo, 'pageSize:', pageSize);

      const response = await axios.get(
        `${BASE_URL}/lessons/course/${courseId}?pageNo=${pageNo}&pageSize=${pageSize}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== getAllLessonsByCourseId SUCCESS ===');
      console.log('Response:', response.data);

      // ✅ Normalize response - extract items and map fields
      let items = [];
      if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        items = response.data.data.items;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      }

      // ✅ Map backend fields to frontend fields for all items
      items = items.map(lesson => ({
        ...lesson,
        isPublished: lesson.published !== undefined ? lesson.published : lesson.isPublished,
        isPreview: lesson.preview !== undefined ? lesson.preview : lesson.isPreview
      }));

      console.log('✅ Normalized items:', items);

      return {
        ...response.data,
        data: {
          ...(response.data?.data || {}),
          items: items
        },
        items: items,
        totalPages: response.data?.data?.totalPages || response.data?.totalPages || 0
      };
    } catch (error) {
      console.error('❌ getAllLessonsByCourseId error:', error);
      throw error;
    }
  },

  // Update lesson
  updateLesson: async (lessonId, lessonData) => {
    try {
      const formData = new FormData();

      // Append lesson data as JSON string
      formData.append('lesson', JSON.stringify({
        lessonNumber: lessonData.lessonNumber,
        title: lessonData.title,
        content: lessonData.content,
        isPreview: lessonData.isPreview || false
      }));

      // Append video file if provided
      if (lessonData.videoFile) {
        formData.append('video', lessonData.videoFile);
      }

      // Append image file if provided
      if (lessonData.imageFile) {
        formData.append('image', lessonData.imageFile);
      }

      console.log('=== updateLesson START ===');
      console.log('lessonId:', lessonId);
      console.log('lessonData:', lessonData);

      const response = await axios.put(
        `${BASE_URL}/lessons/${lessonId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('=== updateLesson SUCCESS ===');
      console.log('Response:', response.data);
      
      // ✅ Normalize response
      const updatedLesson = response.data?.data;
      if (updatedLesson) {
        updatedLesson.isPublished = updatedLesson.published;
        updatedLesson.isPreview = updatedLesson.preview;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ updateLesson error:', error);
      throw error;
    }
  },

  // Delete lesson
  deleteLesson: async (lessonId) => {
    try {
      console.log('=== deleteLesson START ===');
      console.log('lessonId:', lessonId);

      const response = await axios.delete(
        `${BASE_URL}/lessons/${lessonId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('=== deleteLesson SUCCESS ===');
      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ deleteLesson error:', error);
      throw error;
    }
  }
};

export default lessonApi;
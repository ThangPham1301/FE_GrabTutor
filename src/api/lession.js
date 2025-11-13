import axios from 'axios';

const BASE_URL = 'http://localhost:8080/grabtutor';

// ✅ Fix: Remove Content-Type header, increase timeout

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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          timeout: 30000
        }
      );

      console.log('=== createLesson SUCCESS ===');
      console.log('Response:', response.data);
      
      // ✅ FIX: Normalize response - backend uses 'published' & 'preview'
      // but frontend expects 'isPublished' & 'isPreview'
      const lesson = response.data?.data;
      if (lesson) {
        lesson.isPublished = lesson.published;
        lesson.isPreview = lesson.preview;
        lesson.videoUrl = lesson.videoUrl || '';
        lesson.imageUrl = lesson.imageUrl || '';
      }
      
      console.log('✅ Normalized lesson:', lesson);
      
      return response.data;
    } catch (error) {
      console.error('❌ createLesson error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNRESET') {
        throw new Error('Network error - Server connection reset. Check if backend is running.');
      }
      
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
          },
          timeout: 30000 // ✅ Increase timeout
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
          },
          timeout: 30000 // ✅ Increase timeout
        }
      );
      
      console.log('=== getAllLessonsByCourseId SUCCESS ===');
      console.log('Response data:', response.data);

      let items = [];
      if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
        items = response.data.data.items;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      }

      // ✅ Normalize all lessons
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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            // ✅ REMOVE: Don't set Content-Type for FormData
          },
          timeout: 30000 // ✅ Increase timeout
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
          },
          timeout: 30000 // ✅ Increase timeout
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
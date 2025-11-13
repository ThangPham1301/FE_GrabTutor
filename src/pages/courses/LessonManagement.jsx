import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaVideo, FaImage, FaEye, FaEyeSlash, FaBook, FaPlay } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import lessonApi from '../../api/lession';
import courseApi from '../../api/course';

export default function LessonManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    lessonNumber: '',
    title: '',
    content: '',
    isPreview: false,
    videoFile: null,
    imageFile: null
  });

  const [videoPreview, setVideoPreview] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch course and lessons
  useEffect(() => {
    fetchCourse();
    fetchLessons();
  }, [courseId, pageNo]);

  const fetchCourse = async () => {
    try {
      const response = await courseApi.getCourseByCourseId(courseId);
      setCourse(response.data);
    } catch (err) {
      console.error('Error fetching course:', err);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await lessonApi.getAllLessonsByCourseId(courseId, pageNo, 10);
      
      console.log('=== fetchLessons DEBUG ===');
      console.log('Response:', response);
      console.log('Response.items:', response.items);
      console.log('Response.data.items:', response.data?.items);
      
      let items = [];
      // ✅ Try multiple locations for items
      if (response.items && Array.isArray(response.items)) {
        items = response.items;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      }

      console.log('Final items:', items);
      console.log('Items count:', items.length);
      
      // ✅ Verify normalization
      items.forEach((lesson, idx) => {
        console.log(`Lesson ${idx}: isPreview=${lesson.isPreview}, preview=${lesson.preview}`);
      });

      setLessons(items);
      setTotalPages(response.totalPages || response.data?.totalPages || 0);
    } catch (err) {
      console.error('Error fetching lessons:', err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, videoFile: file }));
      setVideoPreview(file.name);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      lessonNumber: '',
      title: '',
      content: '',
      isPreview: false,
      videoFile: null,
      imageFile: null
    });
    setVideoPreview(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('❌ Vui lòng nhập tiêu đề bài học');
      return;
    }

    if (!formData.content.trim()) {
      alert('❌ Vui lòng nhập nội dung bài học');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      console.log('=== handleSubmit START ===');
      console.log('Form data:', formData);
      console.log('Editing ID:', editingId);

      let response;
      if (editingId) {
        // Update existing lesson
        response = await lessonApi.updateLesson(editingId, formData);
      } else {
        // Create new lesson
        response = await lessonApi.createLesson(courseId, formData);
      }

      console.log('=== handleSubmit SUCCESS ===');
      console.log('Response:', response);

      // ✅ Check if operation was successful
      if (response?.success || response?.data?.id) {
        alert('✅ ' + (editingId ? 'Cập nhật' : 'Tạo') + ' bài học thành công!');
        resetForm();
        setShowForm(false);
        setEditingId(null);
        
        // ✅ Reload lessons
        await fetchLessons();
      } else {
        throw new Error(response?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('❌ Error details:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      
      let errorMsg = error.message;
      
      if (error.response?.status === 500) {
        errorMsg = 'Server error (500) - Check backend logs';
      } else if (error.response?.status === 400) {
        errorMsg = error.response.data?.message || 'Invalid input';
      } else if (error.response?.status === 401) {
        errorMsg = 'Unauthorized - Login required';
      } else if (error.message.includes('Network error')) {
        errorMsg = 'Network error - Check if backend is running on port 8080';
      }
      
      setError(errorMsg);
      alert('❌ Lỗi: ' + errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (lesson) => {
    setFormData({
      lessonNumber: lesson.lessonNumber,
      title: lesson.title,
      content: lesson.content,
      isPreview: lesson.isPreview || lesson.preview || false,
      videoFile: null,
      imageFile: null
    });
    setEditingId(lesson.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (lessonId) => {
    if (window.confirm('Bạn chắc chắn muốn xóa bài học này?')) {
      try {
        await lessonApi.deleteLesson(lessonId);
        alert('✅ Xóa bài học thành công!');
        fetchLessons();
      } catch (error) {
        alert('❌ Lỗi: ' + error.message);
      }
    }
  };

  if (loading && lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(`/courses/${courseId}`)}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft /> Quay lại
          </button>
          <h1 className="text-4xl font-bold mb-2">Quản lý bài học</h1>
          <p className="text-teal-100">{course?.name}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Add Lesson Button */}
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="mb-8 px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <FaPlus size={18} /> Thêm bài học mới
          </button>
        )}

        {/* Lesson Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-12 border-l-4 border-[#03ccba]">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? '✏️ Chỉnh sửa bài học' : '➕ Tạo bài học mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lesson Number */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Số thứ tự bài học</label>
                <input
                  type="number"
                  min="1"
                  value={formData.lessonNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, lessonNumber: parseInt(e.target.value) || '' }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
                  placeholder="Ví dụ: 1, 2, 3..."
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Tiêu đề bài học</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
                  placeholder="Ví dụ: Giới thiệu Spring Boot"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Nội dung bài học</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows="6"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all resize-vertical"
                  placeholder="Nhập nội dung bài học tại đây..."
                />
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Video bài học</label>
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#03ccba] hover:bg-blue-50 transition-all cursor-pointer group">
                  <div className="text-center">
                    <FaVideo className="mx-auto text-3xl text-gray-400 group-hover:text-[#03ccba] mb-2" />
                    <p className="text-gray-700 font-semibold">Tải lên video</p>
                    <p className="text-gray-600 text-sm">MP4, MOV, AVI (Max 100MB)</p>
                    {videoPreview && (
                      <p className="text-green-600 text-sm font-bold mt-2">✓ {videoPreview}</p>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Hình ảnh bài học</label>
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#03ccba] hover:bg-blue-50 transition-all cursor-pointer group">
                  <div className="text-center">
                    <FaImage className="mx-auto text-3xl text-gray-400 group-hover:text-[#03ccba] mb-2" />
                    <p className="text-gray-700 font-semibold">Tải lên hình ảnh</p>
                    <p className="text-gray-600 text-sm">PNG, JPG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-xs h-auto rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, imageFile: null }));
                      }}
                      className="mt-2 text-red-600 font-bold hover:underline"
                    >
                      ✕ Xóa hình ảnh
                    </button>
                  </div>
                )}
              </div>

              {/* Preview Toggle */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <input
                  type="checkbox"
                  id="isPreview"
                  checked={formData.isPreview}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPreview: e.target.checked }))}
                  className="w-5 h-5"
                />
                <label htmlFor="isPreview" className="text-gray-700 font-semibold">
                  {formData.isPreview ? (
                    <span className="flex items-center gap-2">
                      <FaEye /> Bài học mở rộng (học viên chưa đăng ký có thể xem)
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FaEyeSlash /> Bài học riêng tư (chỉ học viên đã đăng ký có thể xem)
                    </span>
                  )}
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '⏳ Đang xử lý...' : (editingId ? '💾 Cập nhật' : '➕ Tạo mới')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-all"
                >
                  ✕ Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            📚 Danh sách bài học ({lessons.length})
          </h2>

          {lessons.length === 0 ? (
            <div className="text-center bg-white rounded-lg p-12 border-2 border-dashed border-gray-300">
              <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Chưa có bài học nào. Hãy thêm bài học mới!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-t-4 border-[#03ccba] overflow-hidden"
                >
                  {/* Lesson Image */}
                  <div className="relative h-40 bg-gradient-to-br from-[#03ccba] to-[#02b5a5]">
                    {lesson.imageUrl ? (
                      <img
                        src={lesson.imageUrl}
                        alt={lesson.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <FaBook size={40} />
                      </div>
                    )}

                    {/* Lesson Number Badge */}
                    <div className="absolute top-3 left-3 bg-white text-[#03ccba] px-3 py-1 rounded-full font-bold text-sm">
                      Bài {lesson.lessonNumber}
                    </div>

                    {/* Preview Badge - ✅ Check both isPreview and preview */}
                    {(lesson.isPreview || lesson.preview) && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full font-bold text-xs flex items-center gap-1">
                        <FaEye size={12} /> Mở rộng
                      </div>
                    )}
                  </div>

                  {/* Lesson Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {lesson.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {lesson.content}
                    </p>

                    {/* Video/Image indicators */}
                    <div className="flex gap-2 mb-4 text-sm flex-wrap">
                      {lesson.videoUrl && (
                        <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded">
                          <FaVideo size={12} /> Video
                        </div>
                      )}
                      {lesson.imageUrl && (
                        <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          <FaImage size={12} /> Hình ảnh
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-1 text-sm"
                      >
                        <FaEdit size={14} /> Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(lesson.id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold flex items-center justify-center gap-1 text-sm"
                      >
                        <FaTrash size={14} /> Xóa
                      </button>
                      <button
                        onClick={() => navigate(`/courses/${courseId}/learn/${lesson.id}`)}
                        className="flex-1 px-3 py-2 border-2 border-[#03ccba] text-[#03ccba] rounded-lg hover:bg-[#03ccba] hover:text-white transition-all font-semibold flex items-center justify-center gap-1 text-sm"
                      >
                        <FaPlay size={14} /> Xem
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => setPageNo(Math.max(0, pageNo - 1))}
              disabled={pageNo === 0}
              className="px-6 py-2 bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
            >
              ← Trước
            </button>
            <span className="text-gray-600 font-bold">
              Trang {pageNo + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPageNo(Math.min(totalPages - 1, pageNo + 1))}
              disabled={pageNo >= totalPages - 1}
              className="px-6 py-2 bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
            >
              Tiếp →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
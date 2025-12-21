import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import courseApi from '../../api/course';
import adminApi from '../../api/adminApi';

export default function EditCourse() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    imageFile: null,
    currentImageUrl: null
  });

  useEffect(() => {
    if (!user || user.role !== 'TUTOR') {
      navigate('/login');
      return;
    }
    fetchCourseDetail();
    fetchSubjects();
  }, [courseId, user]);

  const fetchCourseDetail = async () => {
    try {
      const response = await courseApi.getCourseByCourseId(courseId);
      const course = response.data.data || response.data;
      
      console.log('=== fetchCourseDetail DEBUG ===');
      console.log('course:', course);
      console.log('course.tutorId:', course.tutorId);
      console.log('user.id:', user.id);
      console.log('user.userId:', user.userId);
      console.log('Match:', course.tutorId === user.userId);
      
      // ✅ FIX: Use user.userId instead of user.id
      if (course.tutorId !== user.userId) {
        alert('❌ Bạn không có quyền chỉnh sửa khóa học này');
        navigate('/courses/inventory');
        return;
      }

      setFormData({
        name: course.name,
        description: course.description,
        price: course.price,
        imageFile: null,
        currentImageUrl: course.imageUrl
      });

      if (course.imageUrl) {
        setImagePreview(course.imageUrl);
      }

      // ✅ FIX: Handle both subjectIds and subjects array
      const subjectIds = course.subjectIds || course.subjects?.map(s => s.id) || [];
      console.log('subjectIds:', subjectIds);
      setSelectedSubjects(subjectIds);
    } catch (error) {
      console.error('❌ Error fetching course:', error);
      alert('❌ Không thể tải thông tin khóa học');
      navigate('/courses/inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await adminApi.getSubjects(0, 100);
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      setSubjects(items);
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('❌ Please enter course name');
      return;
    }

    if (!formData.description.trim()) {
      alert('❌ Please enter course description');
      return;
    }

    if (selectedSubjects.length === 0) {
      alert('❌ Vui lòng chọn ít nhất 1 môn học');
      return;
    }

    try {
      setSaving(true);
      
      // ✅ Debug log
      console.log('=== handleSubmit DEBUG ===');
      console.log('courseId:', courseId);
      console.log('selectedSubjects:', selectedSubjects);
      console.log('selectedSubjects type:', typeof selectedSubjects);
      console.log('selectedSubjects length:', selectedSubjects.length);

      await courseApi.updateCourse(courseId, {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        imageFile: formData.imageFile,
        subjectIds: selectedSubjects
      });
      
      alert('✅ Cập nhật khóa học thành công!');
      navigate('/courses/inventory');
    } catch (err) {
      console.error('Error:', err);
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/courses/inventory')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft /> Back to My Courses
          </button>
          <h1 className="text-5xl font-bold">Edit Course</h1>
          <p className="text-teal-100 mt-2">Update your course information and details</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Name */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Course Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., JavaScript Basics for Beginners"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Description <span className="text-red-600">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what students will learn in this course..."
                rows="6"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Price (VNĐ)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="1000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
              />
            </div>

            {/* Course Image */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Course Thumbnail
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload Area */}
                <div>
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#03ccba] hover:bg-teal-50 transition-all block">
                    <FaUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-700 font-semibold mb-1">Change Image</p>
                    <p className="text-gray-600 text-sm">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    {formData.imageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(formData.currentImageUrl);
                          setFormData(prev => ({ ...prev, imageFile: null }));
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-4">
                Select Subjects <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjects.map(subject => (
                  <label key={subject.id} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#03ccba] hover:bg-teal-50 transition-all">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={() => handleSubjectToggle(subject.id)}
                      className="w-5 h-5 accent-[#03ccba] cursor-pointer"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{subject.name}</p>
                      <p className="text-sm text-gray-600">{subject.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {selectedSubjects.length > 0 && (
                <p className="text-gray-600 text-sm mt-4">
                  ✅ Đã chọn {selectedSubjects.length} môn học
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/courses/inventory')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">💡 Note</h3>
          <p className="text-blue-800 text-sm">
            Changes to course information will be applied immediately. Students will see updated details when they view your course.
          </p>
        </div>
      </div>
    </div>
  );
}
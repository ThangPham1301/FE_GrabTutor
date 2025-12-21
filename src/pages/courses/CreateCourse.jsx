import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import courseApi from '../../api/course';
import adminApi from '../../api/adminApi';

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    imageFile: null
  });

  useEffect(() => {
    if (!user || user.role !== 'TUTOR') {
      navigate('/login');
      return;
    }
    fetchSubjects();
  }, [user]);

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
      setLoading(true);
      await courseApi.createCourse({
        name: formData.name,
        description: formData.description,
        price: formData.price,
        imageFile: formData.imageFile,
        subjectIds: selectedSubjects
      });
      alert('✅ Khóa học tạo thành công!');
      navigate('/courses/inventory');
    } catch (error) {
      alert('❌ Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-5xl font-bold">Create New Course</h1>
          <p className="text-teal-100 mt-2">Start teaching and share your knowledge with students</p>
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
              <p className="text-gray-600 text-sm mt-1">Give your course a clear, descriptive name</p>
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
              <p className="text-gray-600 text-sm mt-1">Help students understand what they'll gain from your course</p>
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
              <p className="text-gray-600 text-sm mt-1">Leave as 0 for free course. Use increments of 1000 VNĐ</p>
            </div>

            {/* Course Image */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Course Thumbnail
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-[#03ccba] hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 transition-all">
                {imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-48 object-contain rounded-lg shadow-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, imageFile: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg transition-colors"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer text-center block">
                    <FaUpload className="text-5xl text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-semibold mb-1">Click to upload image</p>
                    <p className="text-gray-500 text-sm">or drag and drop</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
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
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-2">💡 Tips for Creating Great Courses</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>✓ Use a clear, descriptive course name that includes key topics</li>
            <li>✓ Write a detailed description highlighting learning outcomes</li>
            <li>✓ Set a competitive price based on content quality and market</li>
            <li>✓ Use a high-quality, professional thumbnail image</li>
            <li>✓ Select all relevant subjects to help students find your course</li>
            <li>✓ You can add lessons after creating the course</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
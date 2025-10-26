import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PostForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    level: '',
    location: '',
    description: '',
    requirements: '',
    schedule: '',
    fee: ''
  });

  useEffect(() => {
    if (isEditMode) {
      // Fetch post data by ID and set form data
      // This is where you'll add the API call later
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
    navigate('/posts');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Chỉnh sửa bài đăng' : 'Tạo bài đăng mới'}
            </h1>
            <button
              onClick={() => navigate('/posts')}
              className="text-gray-600 hover:text-gray-900"
            >
              &times;
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
              required
            />
          </div>

          {/* Subject and Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                required
              >
                <option value="">Chọn môn học</option>
                <option value="math">Toán</option>
                <option value="physics">Vật lý</option>
                {/* Add more subjects */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trình độ
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                required
              >
                <option value="">Chọn trình độ</option>
                <option value="grade10">Lớp 10</option>
                <option value="grade11">Lớp 11</option>
                <option value="grade12">Lớp 12</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
              required
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yêu cầu gia sư
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
              required
            />
          </div>

          {/* Schedule and Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lịch học dự kiến
              </label>
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Học phí dự kiến
              </label>
              <input
                type="text"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/posts')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5]"
            >
              {isEditMode ? 'Cập nhật' : 'Tạo bài đăng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
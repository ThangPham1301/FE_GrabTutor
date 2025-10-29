import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaUpload, FaTimes } from 'react-icons/fa';
import postApi from '../../api/postApi';

export default function PostForm() {
  const navigate = useNavigate();
  
  const [subjects, setSubjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    level: '',
    location: '',
    description: '',
    requirements: '',
    schedule: '',
    fee: '',
    file: null
  });

  // Lấy danh sách môn học và bài đăng
  useEffect(() => {
    fetchSubjects();
    fetchPosts();
  }, [pageNo]);

  const fetchSubjects = async () => {
    try {
      const response = await postApi.getSubjects();
      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      setSubjects(items);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await postApi.getAllPosts(pageNo, pageSize);
      
      console.log('=== POSTS RESPONSE ===');
      console.log(JSON.stringify(response, null, 2));
      
      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
        setTotalPages(response.data.totalPages || 0);
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      setPosts(items);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      file: null
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài đăng');
      return;
    }
    if (!formData.subjectId) {
      alert('Vui lòng chọn môn học');
      return;
    }
    if (!formData.level) {
      alert('Vui lòng chọn trình độ');
      return;
    }
    if (!formData.location.trim()) {
      alert('Vui lòng nhập địa điểm');
      return;
    }
    if (!formData.fee) {
      alert('Vui lòng nhập học phí');
      return;
    }

    setLoading(true);
    try {
      await postApi.createPost(formData);
      alert('Tạo bài đăng thành công!');
      setShowModal(false);
      
      // Reset form
      setFormData({
        title: '',
        subjectId: '',
        level: '',
        location: '',
        description: '',
        requirements: '',
        schedule: '',
        fee: '',
        file: null
      });
      setImagePreview(null);
      setPageNo(0);
      
      // Reload posts
      fetchPosts();
    } catch (err) {
      console.error('Error:', err);
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể tạo bài đăng'));
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Quản lý bài đăng</h1>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors"
            >
              <FaPlus /> Tạo bài đăng mới
            </button>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><strong>Môn:</strong> {post.subject?.name || 'N/A'}</p>
                    <p><strong>Trình độ:</strong> {post.level || 'N/A'}</p>
                    <p><strong>Địa điểm:</strong> {post.location}</p>
                    <p><strong>Học phí:</strong> {post.fee?.toLocaleString()} VND/giờ</p>
                    <p><strong>Lịch:</strong> {post.schedule || 'N/A'}</p>
                  </div>
                  
                  <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                    {post.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                      Chi tiết
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                      Sửa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">Không có bài đăng nào</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={pageNo === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
            >
              ← Trang trước
            </button>
            <span className="px-4 py-2 font-semibold">
              Trang {pageNo + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNo >= totalPages - 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600"
            >
              Trang sau →
            </button>
          </div>
        )}
      </div>

      {/* Modal tạo bài đăng */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">Tạo bài đăng mới</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setImagePreview(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                  placeholder="Nhập tiêu đề"
                  required
                />
              </div>

              {/* Subject and Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Môn học <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn môn --</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trình độ <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn trình độ --</option>
                    <option value="BEGINNER">Cơ bản</option>
                    <option value="INTERMEDIATE">Trung bình</option>
                    <option value="ADVANCED">Nâng cao</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa điểm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                  placeholder="Nhập địa điểm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                  placeholder="Mô tả chi tiết bài đăng"
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yêu cầu gia sư
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                  placeholder="Yêu cầu với gia sư"
                />
              </div>

              {/* Schedule and Fee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lịch học
                  </label>
                  <input
                    type="text"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                    placeholder="VD: Thứ 2, 4, 6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Học phí (VND/giờ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="fee"
                    value={formData.fee}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                    placeholder="Nhập học phí"
                    required
                  />
                </div>
              </div>

              {/* Upload Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-[#03ccba] transition-colors">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto rounded"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTimes size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer text-center block">
                      <FaUpload className="text-3xl text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">Nhấp để chọn ảnh</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setImagePreview(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] disabled:opacity-50"
                >
                  {loading ? 'Đang tạo...' : 'Tạo bài đăng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
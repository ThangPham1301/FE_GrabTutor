import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes } from 'react-icons/fa';
import postApi from '../api/postApi';

/**
 * ✅ Reusable Post Form Modal Component
 * - Được sử dụng ở: CreatePost, PostInventory, Hero "Ask Question", etc.
 * - Props:
 *   - isOpen: boolean (modal có hiển thị hay không)
 *   - onClose: callback khi đóng modal
 *   - onSuccess: callback khi tạo/sửa thành công
 *   - editingPost: object (nếu edit) hoặc null (nếu create)
 *   - title: string (tiêu đề modal - "Create Post" hoặc "Ask Question")
 */
export default function PostFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingPost = null,
  title = 'Create New Post'
}) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    file: null
  });

  // ✅ DEBUG: Log prop changes
  useEffect(() => {
    console.log('=== PostFormModal Props Changed ===');
    console.log('isOpen:', isOpen);
    console.log('editingPost:', editingPost);
    console.log('title:', title);
  }, [isOpen, editingPost, title]);

  // ✅ Khi modal mở, load subjects và init form
  useEffect(() => {
    console.log('🔵 Modal useEffect - isOpen:', isOpen);
    
    if (isOpen) {
      console.log('✅ Modal opening, fetching subjects...');
      fetchSubjects();
      
      // Nếu editing, populate form
      if (editingPost) {
        console.log('=== Edit Mode ===');
        console.log('editingPost:', editingPost);
        
        setFormData({
          title: editingPost.title,
          description: editingPost.description,
          subjectId: editingPost.subject?.id || '',
          file: null
        });
        
        if (editingPost.imageUrl) {
          setImagePreview(editingPost.imageUrl);
        }
      } else {
        // Create mode - reset form
        console.log('=== Create Mode ===');
        setFormData({
          title: '',
          description: '',
          subjectId: '',
          file: null
        });
        setImagePreview(null);
      }
    } else {
      console.log('❌ Modal closed');
    }
  }, [isOpen, editingPost]);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      console.log('Fetching subjects...');
      const response = await postApi.getSubjects();
      
      console.log('Subjects response:', response);
      
      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
      console.log('Subjects loaded:', items.length);
      setSubjects(items);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoadingSubjects(false);
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
    if (!formData.description.trim()) {
      alert('Vui lòng nhập mô tả');
      return;
    }
    if (!editingPost && !formData.file) {
      alert('Vui lòng chọn hình ảnh');
      return;
    }

    setLoading(true);
    try {
      if (editingPost) {
        // UPDATE
        console.log('=== Updating post:', editingPost.id);
        await postApi.updatePost(editingPost.id, formData);
        alert('Cập nhật bài đăng thành công!');
      } else {
        // CREATE
        console.log('=== Creating new post');
        await postApi.createPost(formData);
        alert('Tạo bài đăng thành công!');
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subjectId: '',
        file: null
      });
      setImagePreview(null);
      
      // Close modal & call callback
      onClose();
      onSuccess?.();
      
    } catch (err) {
      console.error('Error:', err);
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể lưu bài đăng'));
    } finally {
      setLoading(false);
    }
  };

  // ✅ Không render nếu modal không open
  if (!isOpen) {
    console.log('🔴 Modal not rendering (isOpen=false)');
    return null;
  }

  console.log('🟢 Modal rendering (isOpen=true)');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b-2 border-gray-200 sticky top-0 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white">
          <h2 className="text-3xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:text-[#03ccba] rounded-full p-2 transition-all"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Post Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
              placeholder="Enter post title"
              required
            />
          </div>

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            {loadingSubjects ? (
              <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-semibold">
                Loading subjects...
              </div>
            ) : (
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all appearance-none bg-white"
                required
              >
                <option value="">-- Select Subject --</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all resize-none"
              placeholder="Describe your post in detail..."
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Post Image {!editingPost && <span className="text-red-500">*</span>}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-[#03ccba] hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 transition-all">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
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
                    onChange={handleFileChange}
                    className="hidden"
                    required={!editingPost}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingSubjects}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (editingPost ? 'Update Post' : 'Create Post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
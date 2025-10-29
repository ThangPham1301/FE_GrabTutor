import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaArrowLeft, FaUpload, FaTimes } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';

export default function EditPost() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

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

  useEffect(() => {
    if (!user) {
      navigate('/login-role');
      return;
    }
    fetchSubjects();
    fetchPostDetail();
  }, [id, user]);

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await postApi.getSubjects();
      
      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
      setSubjects(items);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      const response = await postApi.getPostById(id);
      
      let postData = response.data?.data || response.data;
      
      // DEBUG - Log chi tiết
      console.log('=== fetchPostDetail DEBUG ===');
      console.log('postData:', postData);
      console.log('postData.user:', postData.user);
      console.log('postData.userId:', postData.userId);
      console.log('postData.createdBy:', postData.createdBy);
      console.log('user.userId:', user?.userId);
      
      // Kiểm tra quyền chỉnh sửa - Backend có thể trả về userId hoặc createdBy
      const postUserId = postData.user?.id || postData.userId || postData.createdBy;
      console.log('postUserId để so sánh:', postUserId);
      console.log('Match:', postUserId === user?.userId);
      
      // Nếu backend không trả về user info, bỏ qua kiểm tra quyền
      if (postUserId && postUserId !== user.userId) {
        console.log('❌ Không có quyền - User IDs không match');
        alert('Bạn không có quyền chỉnh sửa bài đăng này!');
        navigate('/posts/inventory');
        return;
      }
      
      console.log('✅ Có quyền chỉnh sửa');
      
      setFormData({
        title: postData.title,
        description: postData.description,
        subjectId: postData.subject?.id || '',
        file: null
      });
      
      if (postData.imageUrl) {
        setImagePreview(postData.imageUrl);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      alert('Không thể tải bài đăng!');
      navigate('/posts/inventory');
    } finally {
      setLoading(false);
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

    setLoading(true);
    try {
      await postApi.updatePost(id, formData);
      alert('Cập nhật bài đăng thành công!');
      navigate('/posts/inventory');
    } catch (err) {
      console.error('Error:', err);
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể cập nhật bài đăng'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/posts/inventory')}
          className="flex items-center gap-2 px-4 py-2 mb-6 bg-gray-300 rounded hover:bg-gray-400"
        >
          <FaArrowLeft /> Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-8">Chỉnh sửa bài đăng</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba]"
                placeholder="Nhập tiêu đề"
                required
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học <span className="text-red-500">*</span>
              </label>
              {loadingSubjects ? (
                <div className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500">
                  Đang tải danh sách môn học...
                </div>
              ) : (
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba]"
                  required
                >
                  <option value="">-- Chọn môn học --</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba]"
                placeholder="Mô tả chi tiết bài đăng"
                required
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh (tùy chọn - để trống để giữ nguyên)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-[#03ccba] transition-colors">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer text-center block">
                    <FaUpload className="text-4xl text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Nhấp để chọn ảnh mới</p>
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
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/posts/inventory')}
                className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50 font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || loadingSubjects}
                className="flex-1 px-6 py-3 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] disabled:opacity-50 font-medium"
              >
                {loading ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
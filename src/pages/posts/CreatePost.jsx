import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload, FaTimes, FaEdit, FaTrash, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';

export default function CreatePost() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subjectId: '',
    file: null
  });

  useEffect(() => {
    fetchSubjects();
    fetchPosts();
  }, [pageNo]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, filterSubject]);

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

  const fetchPosts = async () => {
    try {
      const response = await postApi.getAllPosts(pageNo, pageSize);
      
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

  const filterPosts = () => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSubject) {
      filtered = filtered.filter(post =>
        (post.subject?.id === parseInt(filterSubject) || 
         post.subjectId === parseInt(filterSubject))
      );
    }

    setFilteredPosts(filtered);
  };

  const handleOpenModal = (post = null) => {
    if (post) {
      // Mode edit
      setEditingId(post.id);
      setFormData({
        title: post.title,
        description: post.description,
        subjectId: post.subject?.id || '',
        file: null
      });
      if (post.imageUrl) {
        setImagePreview(post.imageUrl);
      }
    } else {
      // Mode create
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        subjectId: '',
        file: null
      });
      setImagePreview(null);
    }
    setShowModal(true);
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
    if (!editingId && !formData.file) {
      alert('Vui lòng chọn hình ảnh');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Update
        await postApi.updatePost(editingId, formData);
        alert('Cập nhật bài đăng thành công!');
      } else {
        // Create
        await postApi.createPost(formData);
        alert('Tạo bài đăng thành công!');
      }
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        subjectId: '',
        file: null
      });
      setImagePreview(null);
      setPageNo(0);
      fetchPosts();
    } catch (err) {
      console.error('Error:', err);
      alert('Lỗi: ' + (err.response?.data?.message || 'Không thể lưu bài đăng'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài đăng "${postTitle}" không?`)) {
      try {
        await postApi.deletePost(postId);
        alert('Xóa bài đăng thành công!');
        fetchPosts();
      } catch (err) {
        alert('Lỗi khi xóa bài đăng!');
        console.error('Delete error:', err);
      }
    }
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold mb-3">Browse Posts</h1>
              <p className="text-lg text-teal-100">Discover tutoring opportunities and learning requests</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-8 py-3 bg-white text-[#03ccba] rounded-lg font-bold hover:shadow-lg transition-all duration-300"
            >
              <FaPlus size={20} /> Create New Post
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-4 top-4 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search posts by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
              />
            </div>

            {/* Filter by Subject */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-4 text-gray-400 text-lg" />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all appearance-none bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          {(searchTerm || filterSubject) && (
            <div className="mt-4 text-sm text-gray-600">
              Found <span className="font-bold text-[#03ccba]">{filteredPosts.length}</span> post{filteredPosts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {(searchTerm || filterSubject ? filteredPosts : posts).length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {(searchTerm || filterSubject ? filteredPosts : posts).map(post => (
                <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  {/* Image */}
                  {post.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-[#03ccba] text-white px-3 py-1 rounded-full text-xs font-bold">
                        {post.subject?.name || 'Subject'}
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 flex flex-col h-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#03ccba] transition-colors">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                      {post.description}
                    </p>

                    {/* Meta Info */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Subject:</span>
                        <span className="text-[#03ccba]">{post.subject?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Created:</span>
                        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/posts/${post.id}`)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleOpenModal(post)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id, post.title)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 py-8">
                <button
                  onClick={handlePrevPage}
                  disabled={pageNo === 0}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors font-semibold"
                >
                  ← Previous
                </button>
                <span className="px-6 py-2 bg-white rounded-lg border-2 border-[#03ccba] text-gray-900 font-bold">
                  Page {pageNo + 1} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pageNo >= totalPages - 1}
                  className="px-6 py-2 bg-[#03ccba] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02b5a5] transition-colors font-semibold"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <p className="text-gray-500 text-xl mb-4">
              {searchTerm || filterSubject ? 'No posts match your search' : 'No posts available'}
            </p>
            {!(searchTerm || filterSubject) && (
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-bold inline-flex items-center gap-2"
              >
                <FaPlus /> Create First Post
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal - Create/Edit Post */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b-2 border-gray-200 sticky top-0 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white">
              <h2 className="text-3xl font-bold">
                {editingId ? 'Edit Post' : 'Create New Post'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setImagePreview(null);
                }}
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
                  Post Image {!editingId && <span className="text-red-500">*</span>}
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
                        required={!editingId}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setImagePreview(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || loadingSubjects}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (editingId ? 'Update Post' : 'Create Post')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
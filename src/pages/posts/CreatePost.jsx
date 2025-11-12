import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash, FaFlag } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import PostFormModal from '../../components/PostFormModal';
import postApi from '../../api/postApi';
import { useAuth } from '../../contexts/AuthContext';
import { useAskQuestion } from '../../hooks/useAskQuestion';

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log('=== CreatePost useEffect ===');
    console.log('User:', user);

    // ✅ Không cần check user tại đây - allow công khai
    // Chỉ fetch data
    fetchSubjects();
    fetchPosts();
  }, [pageNo]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, filterSubject]);

  const fetchSubjects = async () => {
    try {
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
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postApi.getAllPosts(pageNo, pageSize);
      
      console.log('=== fetchPosts response ===');
      console.log('Full response:', response);
      
      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
        console.log('✅ Got items from response.data.items');
        setTotalPages(response.data.totalPages || 0);
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      console.log('Items before processing:', items);
      console.log('First item subject:', items[0]?.subject);
      console.log('First item subjectId:', items[0]?.subjectId);
      
      // ✅ Nếu subject không có, cần fetch từ subjectId
      // Hoặc set default value
      const processedItems = items.map(post => ({
        ...post,
        subject: post.subject || {
          id: post.subjectId,
          name: 'Unknown Subject'  // ← Default nếu backend không trả về
        }
      }));
      
      console.log('Items after processing:', processedItems);
      console.log('First item after processing:', processedItems[0]);
      
      setPosts(processedItems);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
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

  const handleDeletePost = async (postId, postTitle) => {
    if (!user) {
      alert('⚠️ Vui lòng đăng nhập để xóa bài đăng!');
      return;
    }

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

  const handleOpenCreateModal = () => {
    console.log('🔵 handleOpenCreateModal called');
    if (!user) {
      alert('⚠️ Vui lòng đăng nhập để tạo bài đăng!');
      navigate('/login');
      return;
    }

    if (user.role !== 'USER' && user.role !== 'TUTOR') {
      alert('⚠️ Chỉ STUDENT và TUTOR mới có thể tạo bài đăng!');
      return;
    }

    setEditingPost(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (post) => {
    console.log('🔵 handleOpenEditModal called');
    console.log('Post:', post);
    if (!user) {
      alert('⚠️ Vui lòng đăng nhập để chỉnh sửa!');
      navigate('/login');
      return;
    }
    setEditingPost(post);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    console.log('🔵 handleCloseModal called');
    setShowModal(false);
    setEditingPost(null);
  };

  const handleModalSuccess = () => {
    console.log('🔵 handleModalSuccess called');
    fetchPosts();
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

            {/* ✅ Button Logic - Hiển thị theo role */}
            {user ? (
              // ✅ Đã đăng nhập
              <>
                {user.role === 'USER' && (
                  <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 px-8 py-3 bg-white text-[#03ccba] rounded-lg font-bold hover:shadow-lg transition-all duration-300"
                  >
                    <FaPlus size={20} /> Ask Question
                  </button>
                )}

                {/* ✅ TUTOR - Hide New Post Button on Browse Posts */}
                {/* TUTOR chỉ có thể tạo post ở /posts/inventory page */}
              </>
            ) : (
              // ✅ Chưa đăng nhập
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-8 py-3 bg-white text-[#03ccba] rounded-lg font-bold hover:shadow-lg transition-all duration-300"
              >
                <FaPlus size={20} /> Login to Create
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search & Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {(searchTerm || filterSubject) && (
            <div className="mt-4 text-sm text-gray-600">
              Found <span className="font-bold text-[#03ccba]">{filteredPosts.length}</span> post{filteredPosts.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba] mb-4"></div>
            <p className="text-gray-500 text-lg">Loading posts...</p>
          </div>
        ) : (searchTerm || filterSubject ? filteredPosts : posts).length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {(searchTerm || filterSubject ? filteredPosts : posts).map(post => (
                <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex flex-col h-full">
                  {/* ✅ Image - Fixed Height */}
                  {post.imageUrl && (
                    <div className="relative h-40 overflow-hidden flex-shrink-0">
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

                  {/* ✅ Content - Scrollable */}
                  <div className="p-6 flex flex-col flex-grow overflow-y-auto">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-[#03ccba] transition-colors">
                      {post.title}
                    </h3>
                    
                    {/* Description */}
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

                    {/* ✅ Action Buttons - Always Visible at Bottom */}
                    <div className="flex gap-2 mt-auto">
                      {/* ✅ FIX: Pass postId to URL */}
                      <button
                        onClick={() => navigate(`/posts/${post.id}`)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
            {!(searchTerm || filterSubject) && user && (user.role === 'USER' || user.role === 'TUTOR') && (
              <button
                onClick={handleOpenCreateModal}
                className="px-6 py-3 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-bold inline-flex items-center gap-2"
              >
                <FaPlus /> Create First Post
              </button>
            )}
          </div>
        )}
      </div>

      {/* ✅ PostFormModal */}
      <PostFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        editingPost={editingPost}
        title={editingPost ? (user?.role === 'USER' ? 'Edit Question' : 'Edit Post') : (user?.role === 'USER' ? 'Ask Question' : 'Create New Post')}
      />
    </div>
  );
}
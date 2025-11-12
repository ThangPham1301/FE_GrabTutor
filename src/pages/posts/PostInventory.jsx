import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaCalendar, FaBook,
  FaChevronLeft, FaChevronRight, FaSpinner, FaTimes, FaChartBar,
  FaClock, FaCheckCircle, FaExclamationCircle, FaArrowRight,FaBox
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';
import PostFormModal from '../../components/PostFormModal';

const DEBUG = true;

export default function PostInventory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    if (!user) {
      navigate('/login-role');
      return;
    }
    fetchSubjects();
    fetchMyPosts();
  }, [pageNo, user, navigate]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, filterSubject]);

  // ==================== API CALLS ====================
  const fetchSubjects = async () => {
    try {
      const response = await postApi.getSubjects();
      
      console.log('=== fetchSubjects RESPONSE ===');
      console.log('Full response:', response);
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      console.log('📚 Subjects count:', items.length);
      items.forEach((subject, idx) => {
        console.log(`[Subject ${idx}]: id=${subject.id}, name=${subject.name}`);
      });
      
      setSubjects(items);
    } catch (err) {
      console.error('❌ Error fetching subjects:', err);
    }
  };

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postApi.getMyPosts(pageNo, pageSize);
      
      console.log('=== fetchMyPosts RESPONSE ===');
      console.log('Full response:', response);
      
      let items = [];
      let totalPagesValue = 0;
      
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        totalPagesValue = response.data.totalPages || 0;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      console.log('📋 Posts count:', items.length);
      items.forEach((post, idx) => {
        console.log(`[Post ${idx}]:`);
        console.log('  - id:', post.id);
        console.log('  - title:', post.title);
        console.log('  - subjectId:', post.subjectId);
        console.log('  - subject.name:', post.subject?.name);
      });
      
      setPosts(items);
      setTotalPages(totalPagesValue);
      if (DEBUG) console.log('✅ Posts loaded:', items.length);
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
      setError('Failed to load your posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================== FILTERS ====================
  const filterPosts = () => {
    let filtered = posts;

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(term) ||
        post.description?.toLowerCase().includes(term)
      );
    }

    // ✅ Subject filter - LỌC THEO MÔNAPPROX
    if (filterSubject) {
      filtered = filtered.filter(post =>
        (post.subject?.id === parseInt(filterSubject) || 
         post.subjectId === parseInt(filterSubject))
      );
    }

    // Giữ thứ tự theo createdAt (mới nhất trước)
    filtered = filtered.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    setFilteredPosts(filtered);
  };

  // ==================== HANDLERS ====================
  const handleOpenModal = (post = null) => {
    if (post) {
      setEditingPost(post);
    } else {
      setEditingPost(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const handleModalSuccess = () => {
    setPageNo(0);
    fetchMyPosts();
  };

  const handleDelete = async (postId, postTitle) => {
    if (!window.confirm(`Delete "${postTitle}"? This action cannot be undone.`)) return;

    try {
      await postApi.deletePost(postId);
      alert('✅ Post deleted successfully');
      await fetchMyPosts();
    } catch (err) {
      console.error('Delete error:', err);
      alert('❌ Error deleting post');
    }
  };

  const handleViewDetail = (postId) => {
    navigate(`/posts/${postId}`);
  };

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterSubject('');
    setPageNo(0);
  };

  // ==================== UTILITIES ====================
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'N/A';
    
    const subject = subjects.find(s => s.id === subjectId);
    console.log(`🔍 Finding subject: id=${subjectId}, found=${subject?.name || 'NOT FOUND'}`);
    return subject?.name || 'Unknown Subject';
  };

  const displayPosts = filteredPosts;
  const hasFilters = searchTerm.trim() || filterSubject;

  // ==================== RENDER ====================
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Please login to view your posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* ==================== HERO SECTION - SIMPLIFIED ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] via-teal-500 to-[#02b5a5] text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Left - Title */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-3xl">📝</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">My Posts</h1>
            </div>

            {/* Right - Create Button */}
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#03ccba] rounded-lg font-bold hover:shadow-lg transition-all hover:scale-105 text-sm md:text-base whitespace-nowrap"
            >
              <FaPlus size={18} /> Create Post
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-7">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔍 Search Posts
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
                />
              </div>
            </div>

            {/* ✅ Subject Filter */}
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📖 Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all bg-white"
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Button */}
            {hasFilters && (
              <div className="md:col-span-2 flex">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center gap-2 h-full"
                >
                  <FaTimes size={16} />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Results Info */}
          {hasFilters && (
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-blue-800 text-sm font-semibold">
                ✅ Showing {displayPosts.length} of {posts.length} posts
              </p>
            </div>
          )}
        </div>

        {/* Table */}
        {displayPosts.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              {/* Header */}
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">#</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Post Title</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Subject</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Created Date</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-gray-200">
                {displayPosts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-600 font-semibold">{index + 1}</td>
                    
                    {/* Post Title với Image */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.imageUrl && (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 hover:text-[#03ccba] cursor-pointer transition-colors">
                            {post.title}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                            {post.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Subject Name - Badge */}
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold border border-blue-300">
                        {getSubjectName(post.subjectId || post.subject?.id)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-center text-sm text-gray-600">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        {/* View Button */}
                        <button
                          onClick={() => handleViewDetail(post.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye size={16} />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenModal(post)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Post"
                        >
                          <FaEdit size={16} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(post.id, post.title)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Post"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center bg-white rounded-lg p-12 border-2 border-dashed border-gray-300">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              {hasFilters ? 'No posts match your filters' : 'No posts yet. Create your first post!'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={handlePrevPage}
              disabled={pageNo === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
            >
              ← Previous
            </button>
            <span className="px-4 py-2 font-semibold text-gray-700">
              Page {pageNo + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNo >= totalPages - 1}
              className="px-4 py-2 bg-[#03ccba] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02b5a5] transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      <PostFormModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        editingPost={editingPost}
        title={editingPost ? 'Edit Post' : 'Create New Post'}
      />
    </div>
  );
}
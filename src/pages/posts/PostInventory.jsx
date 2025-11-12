import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaCalendar, FaBook,
  FaChevronLeft, FaChevronRight, FaSpinner, FaTimes, FaChartBar,
  FaClock, FaCheckCircle, FaExclamationCircle, FaArrowRight
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
  const [filterStatus, setFilterStatus] = useState('all');
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
  }, [posts, searchTerm, filterSubject, filterStatus]);

  // ==================== API CALLS ====================
  const fetchSubjects = async () => {
    try {
      const response = await postApi.getSubjects();
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      setSubjects(items);
    } catch (err) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await postApi.getMyPosts(pageNo, pageSize);
      
      let items = [];
      let totalPagesValue = 0;
      
      if (response.data?.data?.items) {
        items = response.data.data.items;
        totalPagesValue = response.data.data.totalPages || 0;
      } else if (response.data?.items) {
        items = response.data.items;
        totalPagesValue = response.data.totalPages || 0;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      setPosts(items);
      setTotalPages(totalPagesValue);
      if (DEBUG) console.log('✅ Posts loaded:', items.length);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Unable to load posts');
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

    // Subject filter
    if (filterSubject) {
      filtered = filtered.filter(post =>
        (post.subject?.id === parseInt(filterSubject) || 
         post.subjectId === parseInt(filterSubject))
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(post => {
        if (filterStatus === 'open') return post.status === 'OPEN';
        if (filterStatus === 'closed') return post.status === 'CLOSED';
        return true;
      });
    }

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
    setFilterStatus('all');
    setPageNo(0);
  };

  // ==================== UTILITIES ====================
  const getStatusIcon = (status) => {
    if (status === 'OPEN') return <FaCheckCircle className="text-green-600" />;
    if (status === 'CLOSED') return <FaExclamationCircle className="text-red-600" />;
    return <FaClock className="text-gray-600" />;
  };

  const getStatusColor = (status) => {
    if (status === 'OPEN') return 'bg-green-100 text-green-700';
    if (status === 'CLOSED') return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  const displayPosts = filteredPosts;
  const hasFilters = searchTerm.trim() || filterSubject || filterStatus !== 'all';
  const stats = {
    total: posts.length,
    open: posts.filter(p => p.status === 'OPEN').length,
    closed: posts.filter(p => p.status === 'CLOSED').length
  };

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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== HERO SECTION ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-16 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start gap-8">
            <div className="flex-1">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                📝 My Posts
              </h1>
              <p className="text-xl text-teal-100 mb-6">
                Manage and track all your tutoring questions
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-3">
                  <div className="text-3xl font-bold">{stats.total}</div>
                  <div className="text-sm text-teal-100">Total Posts</div>
                </div>
                <div className="bg-green-500 bg-opacity-30 backdrop-blur-sm rounded-lg px-4 py-3">
                  <div className="text-3xl font-bold">{stats.open}</div>
                  <div className="text-sm text-teal-100">Open</div>
                </div>
                <div className="bg-red-500 bg-opacity-30 backdrop-blur-sm rounded-lg px-4 py-3">
                  <div className="text-3xl font-bold">{stats.closed}</div>
                  <div className="text-sm text-teal-100">Closed</div>
                </div>
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={() => handleOpenModal(null)}
              className="px-8 py-4 bg-white text-[#03ccba] rounded-xl font-bold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
            >
              <FaPlus size={20} />
              <span>Create Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-lg">
            <p className="text-red-700 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {/* ==================== SEARCH & FILTER ==================== */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-5">
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

            {/* Subject Filter */}
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

            {/* Status Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📊 Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all bg-white"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
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
            <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-blue-700 flex items-center gap-2">
              <FaFilter size={14} />
              Found <span className="font-bold">{displayPosts.length}</span> post{displayPosts.length !== 1 ? 's' : ''} matching your criteria
            </div>
          )}
        </div>

        {/* ==================== POSTS TABLE ==================== */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">Loading posts...</p>
          </div>
        ) : displayPosts.length > 0 ? (
          <>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Header */}
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">#</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Post Title</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Subject</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Created Date</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Actions</th>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody className="divide-y divide-gray-200">
                    {displayPosts.map((post, index) => (
                      <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                        {/* Index */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="font-bold text-[#03ccba]">
                            {pageNo * pageSize + index + 1}
                          </span>
                        </td>

                        {/* Title */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#03ccba] to-[#02b5a5] flex-shrink-0 flex items-center justify-center text-white font-bold">
                              {post.title?.charAt(0) || 'P'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 line-clamp-1 hover:text-[#03ccba] transition-colors">
                                {post.title}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                                {post.description}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-4 text-center">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                            {post.subject?.name || 'N/A'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-fit mx-auto ${getStatusColor(post.status || 'OPEN')}`}>
                            {getStatusIcon(post.status)}
                            {post.status || 'OPEN'}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-center text-sm text-gray-600">
                          <div className="flex items-center justify-center gap-2">
                            <FaCalendar size={14} className="text-[#03ccba]" />
                            <span>
                              {post.createdAt 
                                ? new Date(post.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {/* View */}
                            <button
                              onClick={() => handleViewDetail(post.id)}
                              className="p-2.5 bg-[#03ccba] text-white rounded-lg hover:shadow-lg transition-all hover:scale-110"
                              title="View"
                            >
                              <FaEye size={14} />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleOpenModal(post)}
                              className="p-2.5 bg-blue-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-110"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="p-2.5 bg-red-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-110"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mt-8">
                <button
                  onClick={handlePrevPage}
                  disabled={pageNo === 0}
                  className="px-6 py-3 bg-white text-gray-700 rounded-lg border-2 border-gray-200 hover:border-[#03ccba] hover:text-[#03ccba] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2 shadow-md"
                >
                  <FaChevronLeft size={16} />
                  Previous
                </button>

                <div className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold shadow-md min-w-max">
                  Page {pageNo + 1} of {totalPages}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={pageNo >= totalPages - 1}
                  className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center gap-2 shadow-md"
                >
                  Next
                  <FaChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600 mb-6">
              {hasFilters 
                ? "Try adjusting your search filters"
                : "You haven't created any posts yet. Start by creating your first post!"}
            </p>
            <div className="flex gap-4 justify-center">
              {hasFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                >
                  Clear Filters
                </button>
              )}
              <button
                onClick={() => handleOpenModal(null)}
                className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
              >
                <FaPlus /> Create Your First Post
              </button>
            </div>
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
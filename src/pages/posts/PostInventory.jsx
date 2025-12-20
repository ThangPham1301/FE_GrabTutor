import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter, FaCalendar, FaBook,
  FaChevronLeft, FaChevronRight, FaSpinner, FaTimes, FaChartBar,
  FaClock, FaCheckCircle, FaExclamationCircle, FaArrowRight, FaBox,
  FaTrashRestore, FaCheck, FaExclamationTriangle, FaHistory
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';
import PostFormModal from '../../components/PostFormModal';

const DEBUG = true;

// ==================== STATUS BADGE COMPONENT ====================
function StatusBadge({ status, isDeleted }) {
  if (isDeleted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-full border-2 border-gray-400 font-bold text-sm shadow-sm">
        <FaTrash size={14} />
        <span>Deleted</span>
      </div>
    );
  }

  const statusConfig = {
    'OPEN': {
      icon: '🟢',
      color: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-300',
      label: 'Open',
      description: 'Seeking tutors'
    },
    'IN_PROGRESS': {
      icon: '🔵',
      color: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-300',
      label: 'In Progress',
      description: 'Active'
    },
    'REPORTED': {
      icon: '🚩',
      color: 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border-red-300',
      label: 'Reported',
      description: 'Under review'
    },
    'SOLVED': {
      icon: '✅',
      color: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-300',
      label: 'Solved',
      description: 'Completed'
    },
    'CLOSED': {
      icon: '🔒',
      color: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-300',
      label: 'Closed',
      description: 'Archived'
    }
  };

  const config = statusConfig[status] || statusConfig['OPEN'];

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 font-bold text-sm shadow-sm ${config.color}`}>
      <span className="text-lg">{config.icon}</span>
      <div className="flex flex-col">
        <span>{config.label}</span>
        <span className="text-xs opacity-75">{config.description}</span>
      </div>
    </div>
  );
}

// ==================== ACTION BUTTONS COMPONENT ====================
function ActionButtons({ post, onView, onEdit, onDelete }) {
  // ✅ FIX: Check 'deleted' từ backend (không phải 'isDeleted')
  const actuallyDeleted = post.deleted === true || post.deleted === 'true';
  
  return (
    <div className={`flex items-center justify-center gap-2 flex-wrap transition-all ${
      actuallyDeleted ? 'opacity-50 pointer-events-none' : ''
    }`}>
      {/* View Button */}
      <button
        onClick={onView}
        disabled={actuallyDeleted}
        className={`p-2.5 rounded-lg transition-all transform hover:scale-110 font-bold ${
          actuallyDeleted 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:shadow-md'
        }`}
        title={actuallyDeleted ? "Cannot view deleted post" : "View Details"}
      >
        <FaEye size={16} />
      </button>

      {/* Edit Button */}
      <button
        onClick={onEdit}
        disabled={actuallyDeleted}
        className={`p-2.5 rounded-lg transition-all transform hover:scale-110 font-bold ${
          actuallyDeleted 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-orange-100 text-orange-600 hover:bg-orange-200 hover:shadow-md'
        }`}
        title={actuallyDeleted ? "Cannot edit deleted post" : "Edit Post"}
      >
        <FaEdit size={16} />
      </button>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        disabled={actuallyDeleted}
        className={`p-2.5 rounded-lg transition-all transform hover:scale-110 font-bold ${
          actuallyDeleted 
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-red-100 text-red-600 hover:bg-red-200 hover:shadow-md'
        }`}
        title={actuallyDeleted ? "Already deleted" : "Delete Post"}
      >
        <FaTrash size={16} />
      </button>
    </div>
  );
}

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
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
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
      
      let items = [];
      let totalPagesValue = 0;
      
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        totalPagesValue = response.data.totalPages || 0;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
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

    // Subject filter - FIX
    if (filterSubject) {
      const selectedSubjectId = parseInt(filterSubject);
      filtered = filtered.filter(post => {
        const postSubjectId = parseInt(post.subjectId) || parseInt(post.subject?.id);
        return postSubjectId === selectedSubjectId;
      });
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'deleted') {
        filtered = filtered.filter(post => post.isDeleted === true);
      } else {
        filtered = filtered.filter(post => 
          post.isDeleted !== true && post.status === filterStatus
        );
      }
    } else {
      // By default, don't show deleted posts
      filtered = filtered.filter(post => post.isDeleted !== true);
    }

    // Sort: newest first
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
    setFilterStatus('all');
    setPageNo(0);
  };

  // ==================== UTILITIES ====================
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'N/A';
    
    const subject = subjects.find(s => s.id === subjectId || String(s.id) === String(subjectId));
    return subject?.name || 'Unknown Subject';
  };

  const displayPosts = filteredPosts;
  const hasFilters = searchTerm.trim() || filterSubject || filterStatus !== 'all';

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

      {/* ==================== HERO SECTION ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] via-teal-500 to-[#02b5a5] text-white py-16 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-xl">
                <span className="text-5xl">📝</span>
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">My Posts</h1>
                <p className="text-teal-100 mt-3 text-lg">Manage and track all your learning questions</p>
              </div>
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-3 px-8 py-4 bg-white text-[#03ccba] rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105 text-lg whitespace-nowrap shadow-lg transform"
            >
              <FaPlus size={20} /> Create New Post
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
            <p className="text-red-700 font-bold flex items-center gap-2">
              <FaExclamationCircle /> {error}
            </p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        
        {/* ==================== SEARCH & FILTER SECTION ==================== */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border-t-4 border-[#03ccba]">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaFilter size={24} /> Search & Filter
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            {/* Search Input */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaSearch size={16} /> Search Posts
              </label>
              <div className="relative group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#03ccba] group-focus-within:scale-125 transition-transform" size={18} />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPageNo(0);
                  }}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all font-medium shadow-sm hover:shadow-md"
                />
              </div>
            </div>

            {/* Subject Filter */}
            <div className="lg:col-span-4">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaBook size={16} /> Subject
              </label>
              <select
                value={filterSubject}
                onChange={(e) => {
                  setFilterSubject(e.target.value);
                  setPageNo(0);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all bg-white font-medium shadow-sm hover:shadow-md"
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
            <div className="lg:col-span-4">
              <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaCheckCircle size={16} /> Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPageNo(0);
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all bg-white font-medium shadow-sm hover:shadow-md"
              >
                <option value="all">All Active Posts</option>
                <option value="OPEN">🟢 Open</option>
                <option value="IN_PROGRESS">🔵 In Progress</option>
                <option value="SOLVED">✅ Solved</option>
                <option value="CLOSED">🔒 Closed</option>
                <option value="REPORTED">🚩 Reported</option>
                <option value="deleted">🗑️ Deleted</option>
              </select>
            </div>
          </div>

          {/* Results Info & Clear Button */}
          {hasFilters && (
            <div className="mt-8 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
              <p className="text-blue-800 text-sm font-bold flex items-center gap-2">
                <FaCheckCircle /> Showing {displayPosts.length} of {posts.length} posts
              </p>
              <button
                onClick={handleClearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaTimes size={16} /> Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* ==================== POSTS TABLE ==================== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-xl">
            <FaSpinner className="animate-spin text-[#03ccba] text-6xl mb-4" />
            <p className="text-gray-600 text-lg font-bold">Loading your posts...</p>
          </div>
        ) : displayPosts.length > 0 ? (
          <>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-t-4 border-[#03ccba]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Header */}
                  <thead className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white sticky top-0">
                    <tr>
                      <th className="px-6 py-5 text-left text-sm font-bold">#</th>
                      <th className="px-6 py-5 text-left text-sm font-bold">Post Title</th>
                      <th className="px-6 py-5 text-center text-sm font-bold">Subject</th>
                      <th className="px-6 py-5 text-center text-sm font-bold">Status</th>
                      <th className="px-6 py-5 text-center text-sm font-bold">Created Date</th>
                      <th className="px-6 py-5 text-center text-sm font-bold">Actions</th>
                    </tr>
                  </thead>

                  {/* Body */}
                  <tbody className="divide-y divide-gray-200">
                    {displayPosts.map((post, index) => (
                      <tr 
                        key={post.id} 
                        className={`hover:bg-gradient-to-r transition-all duration-300 ${
                          post.isDeleted 
                            ? 'bg-gradient-to-r from-gray-100 to-gray-50 opacity-75 hover:from-gray-150 hover:to-gray-100' 
                            : 'hover:from-teal-50 hover:to-cyan-50'
                        }`}
                      >
                        <td className="px-6 py-4 text-gray-700 font-bold text-lg">{index + 1}</td>
                        
                        {/* Post Title with Image */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {post.imageUrl && (
                              <div className="flex-shrink-0 overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#03ccba] transition-colors">
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  className="w-14 h-14 object-cover hover:scale-110 transition-transform"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`font-bold text-base transition-colors ${
                                post.isDeleted 
                                  ? 'text-gray-500 line-through' 
                                  : 'text-gray-900 hover:text-[#03ccba]'
                              }`}>
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
                          <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-full text-xs font-bold border-2 border-blue-300 shadow-sm">
                            {getSubjectName(post.subjectId || post.subject?.id)}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 text-center">
                          <StatusBadge 
                            status={post.status || 'OPEN'} 
                            isDeleted={post.isDeleted}
                          />
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-center text-sm text-gray-700 font-bold">
                          <div className="flex items-center justify-center gap-2">
                            <FaCalendar size={14} className="text-[#03ccba]" />
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-center">
                          <ActionButtons
                            post={post}
                            onView={() => handleViewDetail(post.id)}
                            onEdit={() => handleOpenModal(post)}
                            onDelete={() => handleDelete(post.id, post.title)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={handlePrevPage}
                  disabled={pageNo === 0}
                  className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#03ccba] hover:text-[#03ccba] transition-all font-bold text-lg shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  ← Previous
                </button>
                <span className="px-8 py-4 font-bold text-gray-800 bg-white rounded-xl border-2 border-[#03ccba] shadow-md text-lg">
                  Page {pageNo + 1} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={pageNo >= totalPages - 1}
                  className="px-8 py-4 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all font-bold text-lg shadow-md transform hover:scale-105"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center bg-white rounded-2xl p-20 border-2 border-dashed border-gray-300 shadow-xl">
            <FaBox className="text-8xl text-gray-300 mx-auto mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-3">No Posts Found</h3>
            <p className="text-gray-600 text-lg mb-8">
              {hasFilters
                ? 'Try adjusting your search filters'
                : 'Create your first post to get started!'}
            </p>
            {hasFilters ? (
              <button
                onClick={handleClearFilters}
                className="px-8 py-4 bg-[#03ccba] text-white rounded-xl hover:bg-[#02b5a5] transition-all font-bold text-lg shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => handleOpenModal()}
                className="px-8 py-4 bg-[#03ccba] text-white rounded-xl hover:bg-[#02b5a5] transition-all font-bold text-lg flex items-center gap-3 mx-auto shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaPlus size={20} /> Create First Post
              </button>
            )}
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
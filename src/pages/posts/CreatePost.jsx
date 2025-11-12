import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaSpinner, FaTimes, FaBook, FaCalendar, FaMapPin, FaDollarSign,
  FaUser, FaStar, FaClock, FaArrowRight
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import PostFormModal from '../../components/PostFormModal';
import postApi from '../../api/postApi';
import { useAuth } from '../../contexts/AuthContext';

const DEBUG = true;

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [editingPost, setEditingPost] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [subjects, setSubjects] = useState([]);
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    fetchSubjects();
    fetchPosts();
  }, [pageNo]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPageNo(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search when debounced term changes
  useEffect(() => {
    if (debouncedSearch.trim()) {
      searchPostsAPI(debouncedSearch);
    } else {
      fetchPosts();
    }
  }, [debouncedSearch]);

  // Filter posts on client-side
  useEffect(() => {
    filterPosts();
  }, [posts, filterSubject, filterLevel]);

  // ==================== API CALLS ====================
  const fetchSubjects = async () => {
    try {
      if (DEBUG) console.log('📚 Fetching subjects...');
      const response = await postApi.getSubjects();
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      setSubjects(items);
      if (DEBUG) console.log('✅ Subjects loaded:', items.length);
    } catch (err) {
      console.error('❌ Error fetching subjects:', err);
      setSubjects([]);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      if (DEBUG) console.log('📥 Fetching posts (page', pageNo, ')...');
      
      const response = await postApi.getAllPosts(pageNo, pageSize);
      
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
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPostsAPI = async (keyword) => {
    try {
      setSearching(true);
      if (DEBUG) console.log('🔍 Searching for:', keyword);
      
      const response = await postApi.searchPosts(keyword, pageNo, pageSize);
      
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
      if (DEBUG) console.log('✅ Search results:', items.length);
    } catch (err) {
      console.error('❌ Search error:', err);
      setPosts([]);
    } finally {
      setSearching(false);
    }
  };

  // ==================== HANDLERS ====================
  const filterPosts = () => {
    let filtered = posts;

    if (filterSubject) {
      filtered = filtered.filter(post =>
        (post.subject?.id === parseInt(filterSubject) || 
         post.subjectId === parseInt(filterSubject))
      );
    }

    if (filterLevel) {
      filtered = filtered.filter(post =>
        post.level === filterLevel
      );
    }

    setFilteredPosts(filtered);
  };

  const handleOpenCreateModal = () => {
    if (!user) {
      alert('⚠️ Please login to create a post!');
      navigate('/login');
      return;
    }

    if (user.role !== 'USER' && user.role !== 'TUTOR') {
      alert('⚠️ Only STUDENT and TUTOR can create posts!');
      return;
    }

    setEditingPost(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const handleModalSuccess = () => {
    setPageNo(0);
    fetchPosts();
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
    setFilterLevel('');
    setPageNo(0);
  };

  // ==================== RENDER ====================
  const displayPosts = filterSubject || filterLevel ? filteredPosts : posts;
  const hasFilters = searchTerm.trim() || filterSubject || filterLevel;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center gap-8">
            <div>
              <h1 className="text-5xl font-bold mb-3">📚 Browse Tutoring Posts</h1>
              <p className="text-lg text-teal-100 max-w-2xl">
                Find questions from students or share your expertise as a tutor
              </p>
            </div>
            
            {/* Stats */}
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-4 text-right min-w-max">
              <div className="text-4xl font-bold mb-1">{displayPosts.length}</div>
              <div className="text-sm text-teal-100">Posts Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SEARCH & FILTER ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔍 Search Posts
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by title, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
                />
                {searching && <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#03ccba]" />}
              </div>
            </div>

            {/* Filter Subject */}
            <div>
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

            {/* Filter Level */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📊 Level
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all bg-white"
              >
                <option value="">All Levels</option>
                <option value="Primary">Primary</option>
                <option value="Secondary">Secondary</option>
                <option value="High School">High School</option>
                <option value="University">University</option>
              </select>
            </div>

            {/* Clear Button */}
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <FaTimes size={16} />
                Clear
              </button>
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

        {/* ==================== POSTS GRID ==================== */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">Loading posts...</p>
          </div>
        ) : displayPosts.length > 0 ? (
          <>
            {/* Create Post Button (Floating) */}
            {user && (user.role === 'USER' || user.role === 'TUTOR') && (
              <button
                onClick={handleOpenCreateModal}
                className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-full shadow-lg hover:shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center z-40"
                title="Create Post"
              >
                <FaPlus size={24} />
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {displayPosts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onClick={() => navigate(`/posts/${post.id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 mb-8">
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
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600 mb-6">
              {hasFilters 
                ? "Try adjusting your search filters"
                : "No posts available yet. Be the first to create one!"}
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
              {user && (user.role === 'USER' || user.role === 'TUTOR') && (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2"
                >
                  <FaPlus /> Create First Post
                </button>
              )}
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

// ==================== POST CARD COMPONENT ====================
function PostCard({ post, onClick }) {
  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'bg-green-100 text-green-700',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700',
      'CLOSED': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer overflow-hidden group border border-gray-100"
    >
      {/* Header with Image/Gradient */}
      <div className="relative h-40 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] overflow-hidden">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaBook className="text-white text-5xl opacity-30" />
          </div>
        )}
        
        {/* Subject Badge */}
        <div className="absolute top-3 right-3 bg-white text-[#03ccba] px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          {post.subject?.name || 'Subject'}
        </div>

        {/* Status Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${getStatusColor(post.status || 'OPEN')}`}>
          {post.status || 'OPEN'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#03ccba] transition-colors">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {post.description}
        </p>

        {/* Meta Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200 text-xs">
          {/* Level */}
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <FaStar size={12} className="text-blue-600" />
            </div>
            <span className="font-semibold">{post.level || 'Any'}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
              <FaMapPin size={12} className="text-red-600" />
            </div>
            <span className="font-semibold truncate">{post.location || 'Online'}</span>
          </div>

          {/* Fee */}
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <FaDollarSign size={12} className="text-green-600" />
            </div>
            <span className="font-semibold">{post.fee ? `${post.fee.toLocaleString()}` : 'TBD'}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
              <FaCalendar size={12} className="text-purple-600" />
            </div>
            <span className="font-semibold text-xs">{formatDate(post.createdAt)}</span>
          </div>
        </div>

        {/* Student/Poster Info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03ccba] to-[#02b5a5] flex items-center justify-center text-white text-xs font-bold">
            {post.posterName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-900">{post.posterName || 'User'}</p>
            <p className="text-xs text-gray-500">{post.postType || 'Question'}</p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm flex items-center justify-center gap-2 group/btn"
        >
          View Details
          <FaArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
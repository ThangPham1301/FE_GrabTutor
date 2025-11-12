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

// ==================== POST CARD COMPONENT ====================
function PostCard({ post, subjects, onClick }) {
  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'bg-green-100 text-green-700 border-green-300',
      'IN_PROGRESS': 'bg-blue-100 text-blue-700 border-blue-300',
      'CLOSED': 'bg-gray-100 text-gray-700 border-gray-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  // ✅ Lấy subject name từ subjectId
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'Subject';
    const subject = subjects.find(s => s.id === subjectId || String(s.id) === String(subjectId));
    return subject?.name || 'Unknown Subject';
  };

  // ✅ Format thời gian tương đối
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const now = new Date();
    const postDate = new Date(date);
    const diffTime = Math.abs(now - postDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    
    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden group border border-gray-100 flex flex-col h-full"
    >
      {/* ✅ Header with Image/Gradient */}
      <div className="relative h-48 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] overflow-hidden">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#03ccba] to-[#02b5a5]">
            <FaBook className="text-white text-5xl opacity-40" />
          </div>
        )}
        
        {/* ✅ Subject Badge - Top Right */}
        <div className="absolute top-3 right-3 bg-white text-[#03ccba] px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-[#03ccba]">
          {getSubjectName(post.subjectId)}
        </div>

        {/* ✅ Status Badge - Top Left */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-lg border-2 ${getStatusColor(post.status || 'OPEN')}`}>
          {post.status === 'OPEN' ? '🟢 Open' : post.status === 'IN_PROGRESS' ? '🔵 In Progress' : '🔴 Closed'}
        </div>
      </div>

      {/* ✅ Content - flex-1 để đẩy footer xuống */}
      <div className="p-5 flex flex-col flex-1">
        {/* ✅ Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#03ccba] transition-colors">
          {post.title}
        </h3>

        {/* ✅ Description - 2 dòng */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
          {post.description || 'No description provided'}
        </p>

        {/* ✅ Simplified Meta - Chỉ hiển thị Subject + Date */}
        <div className="flex items-center justify-between mb-4 pb-4 border-t border-gray-100 pt-4">
          {/* Subject Name */}
          <div className="flex items-center gap-2">
            <FaBook size={12} className="text-[#03ccba] flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-700">
              {getSubjectName(post.subjectId)}
            </span>
          </div>

          {/* Posted Date */}
          <div className="flex items-center gap-1">
            <FaCalendar size={12} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-600">
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        {/* ✅ Poster Info */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-t border-gray-100 pt-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#03ccba] to-[#02b5a5] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {post.posterName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {post.posterName || 'Anonymous User'}
            </p>
            <p className="text-xs text-gray-500">Student</p>
          </div>
        </div>
      </div>

      {/* ✅ Action Button - sticky at bottom */}
      <div className="px-5 pb-5 mt-auto">
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="w-full py-2.5 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold text-sm flex items-center justify-center gap-2 group/btn"
        >
          View Details
          <FaArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  
  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);

  // ==================== LIFECYCLE ====================
  useEffect(() => {
    fetchSubjects();
    fetchPosts();
  }, [pageNo]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, filterSubject, subjects]);

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
      
      if (DEBUG) {
        console.log('📚 Subjects loaded:', items.length);
        items.forEach(s => console.log(`  - ${s.id}: ${s.name}`));
      }
      
      setSubjects(items);
    } catch (err) {
      console.error('❌ Error fetching subjects:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postApi.getAllPosts(pageNo, pageSize);
      
      let items = [];
      let totalPagesValue = 0;
      
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        totalPagesValue = response.data.totalPages || 0;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      if (DEBUG) console.log('📋 Posts loaded:', items.length);
      
      setPosts(items);
      setTotalPages(totalPagesValue);
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
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
      const selectedSubjectId = parseInt(filterSubject);
      filtered = filtered.filter(post => {
        const postSubjectId = post.subjectId;
        return postSubjectId === selectedSubjectId || String(postSubjectId) === String(filterSubject);
      });
    }

    // Sort: mới nhất trước
    filtered = filtered.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    setFilteredPosts(filtered);
  };

  // ==================== HANDLERS ====================
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterSubject('');
    setPageNo(0);
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

  const hasFilters = searchTerm.trim() || filterSubject;
  const displayPosts = filteredPosts;

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* ==================== HERO SECTION ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] via-teal-500 to-[#02b5a5] text-white py-16 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <FaBook className="text-5xl" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold">Browse Questions</h1>
                <p className="text-lg text-teal-100 mt-2">
                  Find questions from students and help them out
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔍 Search Questions
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
            <div className="md:col-span-2">
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
                ✅ Showing {displayPosts.length} of {posts.length} question{posts.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading questions...</p>
          </div>
        ) : displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                subjects={subjects}
                onClick={() => handleViewDetail(post.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center bg-white rounded-lg p-16 border-2 border-dashed border-gray-300">
            <FaBook className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Questions Found</h3>
            <p className="text-gray-600 mb-6">
              {hasFilters
                ? 'Try adjusting your search filters'
                : 'No questions available right now'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={handlePrevPage}
              disabled={pageNo === 0}
              className="px-6 py-3 bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors font-bold"
            >
              ← Previous
            </button>
            <span className="px-6 py-3 font-bold text-gray-700">
              Page {pageNo + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={pageNo >= totalPages - 1}
              className="px-6 py-3 bg-[#03ccba] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02b5a5] transition-colors font-bold"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
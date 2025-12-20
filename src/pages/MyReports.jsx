import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaArrowLeft, FaSpinner, FaFlag, FaCalendar, FaUser, FaExternalLinkAlt, 
  FaCheckCircle, FaClock, FaSearch, FaFilter, FaTimes, FaEye, FaFileAlt,
  FaChevronDown, FaBook
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import reportApi from '../api/reportApi';
import postApi from '../api/postApi';

const DEBUG = true;

export default function MyReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const queryRole = searchParams.get('role');
  const isTutorViewingReceived = queryRole === 'tutor' && user?.role === 'TUTOR';

  // State
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredReports, setFilteredReports] = useState([]);
  
  // Posts cache for detail display
  const [postsMap, setPostsMap] = useState({});

  // ==================== EFFECTS ====================
  useEffect(() => {
    if (!user || !['USER', 'TUTOR'].includes(user.role)) {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [user, pageNo, queryRole]);

  useEffect(() => {
    filterAndSortReports();
  }, [reports, searchQuery, statusFilter, sortBy]);

  // ==================== API CALLS ====================
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      if (DEBUG) console.log('=== fetchReports START ===');

      let response;

      if (user.role === 'USER') {
        response = await reportApi.getReportBySenderId(user.userId, pageNo, pageSize);
      } else if (user.role === 'TUTOR' && !isTutorViewingReceived) {
        response = await reportApi.getReportBySenderId(user.userId, pageNo, pageSize);
      } else if (user.role === 'TUTOR' && isTutorViewingReceived) {
        response = await reportApi.getReportByReceivedId(user.userId, pageNo, pageSize);
      }

      let reportList = [];
      let totalPagesValue = 0;

      if (response?.data) {
        if (response.data.items && Array.isArray(response.data.items)) {
          reportList = response.data.items;
          totalPagesValue = response.data.totalPages || 0;
        } else if (response.data.data?.items) {
          reportList = response.data.data.items;
          totalPagesValue = response.data.data.totalPages || 0;
        }
      } else if (Array.isArray(response?.items)) {
        reportList = response.items;
        totalPagesValue = response.totalPages || 0;
      }

      // ✅ Fetch post details for all reports
      if (reportList.length > 0) {
        await fetchPostDetails(reportList);
      }

      setReports(reportList);
      setTotalPages(totalPagesValue);

    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Fetch post details for display
  const fetchPostDetails = async (reportList) => {
    try {
      const postIds = [...new Set(reportList.map(r => r.postId).filter(Boolean))];
      
      if (postIds.length === 0) return;

      const newPostsMap = { ...postsMap };

      for (const postId of postIds) {
        if (newPostsMap[postId]) continue; // Already cached

        try {
          const postResponse = await postApi.getPostById(postId);
          const postData = postResponse?.data?.data || postResponse?.data || postResponse;
          newPostsMap[postId] = postData;
        } catch (err) {
          console.warn(`Could not fetch post ${postId}:`, err);
          newPostsMap[postId] = null;
        }
      }

      setPostsMap(newPostsMap);
    } catch (err) {
      console.error('Error fetching post details:', err);
    }
  };

  // ==================== FILTERS & SORTING ====================
  const filterAndSortReports = () => {
    let filtered = [...reports];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(report =>
        report.detail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.postId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.chatRoomId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        postsMap[report.postId]?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => 
        report.reportStatus?.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'status':
          return (a.reportStatus || '').localeCompare(b.reportStatus || '');
        default:
          return 0;
      }
    });

    setFilteredReports(filtered);
  };

  // ==================== HELPERS ====================
  
  const getStatusConfig = (status) => {
    const configs = {
      'PENDING': {
        icon: '⏳',
        color: 'bg-amber-50 border-l-4 border-amber-400',
        badge: 'bg-amber-100 text-amber-800 border border-amber-300',
        label: 'Pending',
        description: 'Awaiting review'
      },
      'RESOLVED': {
        icon: '✅',
        color: 'bg-emerald-50 border-l-4 border-emerald-400',
        badge: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        label: 'Resolved',
        description: 'Report has been resolved'
      },
      'REVIEWED': {
        icon: '👁️',
        color: 'bg-blue-50 border-l-4 border-blue-400',
        badge: 'bg-blue-100 text-blue-800 border border-blue-300',
        label: 'Under Review',
        description: 'Being reviewed'
      },
      'REJECTED': {
        icon: '❌',
        color: 'bg-slate-50 border-l-4 border-slate-400',
        badge: 'bg-slate-100 text-slate-800 border border-slate-300',
        label: 'Rejected',
        description: 'Report was rejected'
      }
    };
    return configs[status?.toUpperCase()] || configs['PENDING'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getTotalStats = () => {
    return {
      total: reports.length,
      pending: reports.filter(r => r.reportStatus?.toUpperCase() === 'PENDING').length,
      resolved: reports.filter(r => r.reportStatus?.toUpperCase() === 'RESOLVED').length,
      reviewed: reports.filter(r => r.reportStatus?.toUpperCase() === 'REVIEWED').length
    };
  };

  const hasFilters = searchQuery.trim() || statusFilter !== 'all';
  const stats = getTotalStats();

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-blue-600 mb-4" />
            <p className="text-gray-600 text-lg font-semibold">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity text-blue-100 hover:text-white"
          >
            <FaArrowLeft size={18} /> Back to Profile
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur">
              <FaFlag size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                {user?.role === 'USER' ? '📋 My Reports Sent' : '⚠️ Reports Against Me'}
              </h1>
              <p className="text-blue-100 mt-2 text-lg">
                {user?.role === 'USER'
                  ? 'Track reports you have submitted'
                  : 'Track reports filed against your account'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== STATS CARDS ==================== */}
      {reports.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Total Reports</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <FaFileAlt size={32} className="text-blue-200" />
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-amber-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Pending</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <FaClock size={32} className="text-amber-200" />
              </div>
            </div>

            {/* Reviewed */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Under Review</p>
                  <p className="text-3xl font-bold text-indigo-600">{stats.reviewed}</p>
                </div>
                <FaEye size={32} className="text-indigo-200" />
              </div>
            </div>

            {/* Resolved */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-emerald-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.resolved}</p>
                </div>
                <FaCheckCircle size={32} className="text-emerald-200" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 flex items-center gap-3">
            <FaTimes className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* ==================== SEARCH & FILTER ==================== */}
        {reports.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-blue-500">
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <FaSearch size={16} className="text-blue-500" /> Search Reports
                </label>
                <input
                  type="text"
                  placeholder="Search by detail, Post title, ID, or Chat Room ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPageNo(0);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
              </div>

              {/* Filter & Sort Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FaFilter size={16} className="text-blue-500" /> Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPageNo(0);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-medium"
                  >
                    <option value="all">📋 All Status</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="reviewed">👁️ Under Review</option>
                    <option value="resolved">✅ Resolved</option>
                    <option value="rejected">❌ Rejected</option>
                  </select>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FaChevronDown size={16} className="text-blue-500" /> Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white font-medium"
                  >
                    <option value="newest">🕒 Newest First</option>
                    <option value="oldest">🕐 Oldest First</option>
                    <option value="status">🏷️ Status</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Info */}
              {hasFilters && (
                <div className="flex items-center justify-between gap-4 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <p className="text-blue-800 text-sm font-semibold">
                    ✅ Showing {filteredReports.length} of {reports.length} report{reports.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setSortBy('newest');
                    }}
                    className="px-3 py-1 bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300 transition-colors text-sm font-semibold flex items-center gap-2"
                  >
                    <FaTimes size={14} /> Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== REPORTS LIST ==================== */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border-2 border-dashed border-gray-300 mb-8">
            <FaFlag className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-semibold">
              {hasFilters 
                ? 'No reports match your filters'
                : user?.role === 'USER'
                ? 'You haven\'t submitted any reports yet'
                : 'No reports have been filed against you'}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {user?.role === 'USER'
                ? 'If you find any inappropriate content, you can submit a report'
                : 'Keep following community guidelines to stay safe'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {filteredReports.map(report => {
              const statusConfig = getStatusConfig(report.reportStatus);
              const post = postsMap[report.postId];
              
              return (
                <div
                  key={report.id}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden ${statusConfig.color}`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      {/* Left Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3">
                          {/* Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.badge}`}>
                            {statusConfig.icon} {statusConfig.label}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">
                            {statusConfig.description}
                          </span>
                        </div>

                        {/* Report Detail */}
                        <p className="text-gray-900 font-bold text-lg mb-4 line-clamp-2">
                          {report.detail || 'No detail provided'}
                        </p>

                        {/* Post Info - if available */}
                        {post && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <div className="flex items-start gap-3">
                              {post.imageUrl && (
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-blue-900 flex items-center gap-2 mb-1">
                                  <FaBook size={14} /> Post Details
                                </p>
                                <p className="text-sm text-blue-800 font-semibold truncate">
                                  {post.title || 'Untitled Post'}
                                </p>
                                {post.description && (
                                  <p className="text-xs text-blue-700 truncate mt-1">
                                    {post.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Meta Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Date */}
                          <div className="flex items-start gap-2">
                            <FaCalendar size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-gray-500 font-semibold">Date</p>
                              <p className="text-sm text-gray-700 font-medium">{formatDate(report.createdAt)}</p>
                            </div>
                          </div>

                          {/* Post ID */}
                          {report.postId && (
                            <div className="flex items-start gap-2">
                              <FaFileAlt size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-semibold">Post ID</p>
                                <code className="text-xs text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded truncate block">
                                  {report.postId.slice(0, 12)}...
                                </code>
                              </div>
                            </div>
                          )}

                          {/* Chat Room ID */}
                          {report.chatRoomId && (
                            <div className="flex items-start gap-2">
                              <FaUser size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs text-gray-500 font-semibold">Chat Room</p>
                                <code className="text-xs text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded truncate block">
                                  {report.chatRoomId.slice(0, 12)}...
                                </code>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right - View Button */}
                      <button
                        onClick={() => {
                          if (report.postId) {
                            navigate(`/posts/${report.postId}`);
                          } else if (report.chatRoomId) {
                            navigate(`/chat/${report.chatRoomId}`);
                          }
                        }}
                        className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                        title={report.postId ? 'View Post' : report.chatRoomId ? 'View Chat' : 'View Report'}
                      >
                        <FaEye size={16} />
                        <span className="hidden sm:inline">View</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ==================== PAGINATION ==================== */}
        {reports.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8 border-t border-gray-200">
            <button
              onClick={() => setPageNo(Math.max(0, pageNo - 1))}
              disabled={pageNo === 0}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2"
            >
              <FaArrowLeft size={14} /> Previous
            </button>

            <div className="flex items-center gap-2">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const page = pageNo > 2 ? pageNo - 2 + i : i;
                if (page >= totalPages) return null;
                return (
                  <button
                    key={page}
                    onClick={() => setPageNo(page)}
                    className={`w-10 h-10 rounded-lg font-bold transition-all ${
                      page === pageNo
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-500'
                    }`}
                  >
                    {page + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPageNo(Math.min(totalPages - 1, pageNo + 1))}
              disabled={pageNo >= totalPages - 1}
              className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold flex items-center gap-2"
            >
              Next <FaArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
            </button>

            <span className="text-gray-600 font-semibold ml-4">
              Page {pageNo + 1} of {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
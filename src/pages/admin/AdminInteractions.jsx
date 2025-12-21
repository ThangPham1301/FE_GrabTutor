import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSpinner,
  FaEye,
  FaFlag,
  FaCalendar,
  FaUser,
  FaEnvelope,
  FaFileAlt,
  FaChartBar,
  FaSearch,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaImage,
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import Navbar from '../../components/Navbar';
import reportApi from '../../api/reportApi';
import userApi from '../../api/userApi';
import postApi from '../../api/postApi';

const DEBUG = true;

export default function AdminInteractions() {
  const navigate = useNavigate();

  // State
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportStats, setReportStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [chartType, setChartType] = useState('bar');

  // Pagination
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchUsers();
    fetchPosts();
    fetchAllReports();
    fetchReportStats();
  }, [pageNo]);

  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, statusFilter]);

  // ==================== API CALLS ====================

  // ✅ Fetch all users for matching
  const fetchUsers = async () => {
    try {
      if (DEBUG) console.log('👥 Fetching users for matching...');

      const response = await userApi.getAllUsers(0, 1000);

      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }

      if (DEBUG) console.log('👥 Users loaded:', items.length);
      setUsers(items);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      setUsers([]);
    }
  };

  // ✅ Fetch all posts for image matching
  const fetchPosts = async () => {
    try {
      if (DEBUG) console.log('📷 Fetching posts for image matching...');

      const response = await postApi.getAllPosts(0, 1000);

      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }

      if (DEBUG) console.log('📷 Posts loaded:', items.length);
      setPosts(items);
    } catch (err) {
      console.error('❌ Error fetching posts:', err);
      setPosts([]);
    }
  };

  // ✅ Fetch all reports
  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError(null);

      if (DEBUG) console.log('📋 Fetching reports...');

      const response = await reportApi.getAllReports(pageNo, pageSize);

      if (DEBUG) console.log('📋 Reports Response:', response);

      let items = [];
      let pages = 0;

      if (response?.data?.items) {
        items = response.data.items;
        pages = response.data.totalPages || 1;
      } else if (response?.items) {
        items = response.items;
        pages = response.totalPages || 1;
      } else if (Array.isArray(response)) {
        items = response;
        pages = 1;
      }

      if (DEBUG) console.log('📋 Reports loaded:', items.length);

      setReports(items);
      setTotalPages(pages);
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      setError('Unable to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch report statistics
  const fetchReportStats = async () => {
    try {
      if (DEBUG) console.log('📊 Fetching report stats...');

      // Calculate stats from reports
      const totalReports = reports.length;
      const pendingReports = reports.filter(
        (r) => r.reportStatus === 'PENDING' || !r.reportStatus
      ).length;
      const acceptedReports = reports.filter(
        (r) => r.reportStatus === 'ACCEPTED'
      ).length;
      const rejectedReports = reports.filter(
        (r) => r.reportStatus === 'REJECTED'
      ).length;

      setReportStats({
        total: totalReports,
        pending: pendingReports,
        accepted: acceptedReports,
        rejected: rejectedReports,
      });
    } catch (err) {
      console.error('❌ Error calculating stats:', err);
    }
  };

  // ==================== HELPERS ====================

  // Get user email from senderId
  const getUserEmail = (senderId) => {
    if (!senderId) return 'Unknown User';
    const user = users.find(
      (u) => u.id === senderId || String(u.id) === String(senderId)
    );
    return user?.email || 'Unknown User';
  };

  // Get user full name from senderId
  const getUserName = (senderId) => {
    if (!senderId) return 'Unknown';
    const user = users.find(
      (u) => u.id === senderId || String(u.id) === String(senderId)
    );
    return user?.fullName || 'Unknown';
  };

  // ✅ NEW: Get post image from postId
  const getPostImage = (postId) => {
    if (!postId) return null;
    const post = posts.find(
      (p) => p.id === postId || String(p.id) === String(postId)
    );
    return post?.imageUrl || null;
  };

  // ✅ NEW: Get post title from postId
  const getPostTitle = (postId) => {
    if (!postId) return 'Unknown Post';
    const post = posts.find(
      (p) => p.id === postId || String(p.id) === String(postId)
    );
    return post?.title || 'Unknown Post';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
      REJECTED: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Get status badge text
  const getStatusBadgeText = (status) => {
    const badges = {
      PENDING: '⏳ Pending',
      ACCEPTED: '✅ Accepted',
      REJECTED: '❌ Rejected',
    };
    return badges[status] || status || 'Pending';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ==================== FILTERS ====================

  const filterReports = () => {
    let filtered = reports;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (report) =>
          report.detail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          getUserEmail(report.senderId)
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          getUserName(report.senderId)
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((report) => report.reportStatus === statusFilter);
    }

    setFilteredReports(filtered);
  };

  // ==================== CHART DATA ====================

  const chartData = reportStats
    ? [
        {
          name: 'Total',
          value: reportStats.total || 0,
          fill: '#03ccba',
        },
        {
          name: 'Pending',
          value: reportStats.pending || 0,
          fill: '#f59e0b',
        },
        {
          name: 'Rejected',
          value: reportStats.rejected || 0,
          fill: '#ef4444',
        },
        {
          name: 'Accepted',
          value: reportStats.accepted || 0,
          fill: '#10b981',
        },
      ]
    : [];

  const pieData = [
    {
      name: 'Pending',
      value: reportStats?.pending || 0,
      fill: '#f59e0b',
    },
    {
      name: 'Rejected',
      value: reportStats?.rejected || 0,
      fill: '#ef4444',
    },
    {
      name: 'Accepted',
      value: reportStats?.accepted || 0,
      fill: '#10b981',
    },
  ].filter((d) => d.value > 0);

  // ==================== PAGINATION ====================

  const handleNextPage = () => {
    if (pageNo < totalPages - 1) {
      setPageNo(pageNo + 1);
    }
  };

  const handlePrevPage = () => {
    if (pageNo > 0) {
      setPageNo(pageNo - 1);
    }
  };

  const handleViewReport = (reportId) => {
    navigate(`/admin/report/${reportId}`);
  };

  // ==================== LOADING STATE ====================

  if (loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <FaArrowLeft size={20} /> Back to Dashboard
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaFlag size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">🚩 Report Management</h1>
              <p className="text-teal-100 text-lg mt-1">
                Review and manage all user reports and interactions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* ==================== STATISTICS CARDS ==================== */}
        {reportStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Reports */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#03ccba] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Total Reports
                </h3>
                <FaFlag className="text-[#03ccba] text-2xl" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {reportStats.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">All reports submitted</p>
            </div>

            {/* Pending Reports */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Pending
                </h3>
                <FaClock className="text-yellow-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {reportStats.pending || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Awaiting review</p>
            </div>

            {/* Reviewed Reports */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Rejected
                </h3>
                <FaExclamationTriangle className="text-red-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {reportStats.rejected || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Rejected reports</p>
            </div>

            {/* Resolved Reports */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Accepted
                </h3>
                <FaCheckCircle className="text-green-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {reportStats.accepted || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Accepted reports</p>
            </div>
          </div>
        )}

        {/* ==================== CHARTS SECTION ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar/Line Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                📊 Report Status Distribution
              </h2>
              <button
                onClick={() =>
                  setChartType(chartType === 'bar' ? 'line' : 'bar')
                }
                className="px-3 py-1 bg-[#03ccba] text-white text-xs font-bold rounded hover:bg-[#02b5a5] transition-all"
              >
                {chartType === 'bar' ? 'Switch to Line' : 'Switch to Bar'}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'bar' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#03ccba"
                    strokeWidth={3}
                    dot={{ fill: '#03ccba', r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🎯 Report Status Breakdown
            </h2>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-80">
                <p className="text-gray-500">No data available</p>
              </div>
            )}
          </div>
        </div>

        {/* ==================== FILTERS & SEARCH ==================== */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
              <FaSearch className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by email, name, or detail..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPageNo(0);
                }}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPageNo(0);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#03ccba] text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================== REPORTS LIST ==================== */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
              <FaFlag className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl font-semibold">
                {searchQuery || statusFilter !== 'all'
                  ? 'No reports match your filters'
                  : 'No reports found'}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                User reports will appear here when submitted
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredReports.map((report, index) => (
                <div
                  key={report.id}
                  className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors p-6 ${
                    getStatusColor(report.status)
                  }`}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                    {/* ✅ NEW: Post Image Display (Col 1) */}
                    <div className="flex justify-center">
                      {getPostImage(report.postId) ? (
                        <div className="relative group">
                          <img
                            src={getPostImage(report.postId)}
                            alt={getPostTitle(report.postId)}
                            className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200 shadow-md hover:shadow-lg transition-shadow"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                            <FaImage className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl" />
                          </div>
                          <div className="mt-2 text-center">
                            <p className="text-xs font-semibold text-gray-900 line-clamp-2">
                              {getPostTitle(report.postId)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <FaFileAlt className="text-gray-400 text-2xl" />
                        </div>
                      )}
                    </div>

                    {/* Reporter Info (Col 2-3) */}
                    <div className="lg:col-span-2">
                      <div className="space-y-3">
                        {/* Reporter Email */}
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                            {getUserName(report.senderId)
                              .charAt(0)
                              .toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {getUserName(report.senderId)}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
                              <FaEnvelope size={12} />
                              <span className="truncate">
                                {getUserEmail(report.senderId)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Report Detail */}
                        <div className="bg-gray-50 p-3 rounded border-l-2 border-red-500">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {report.detail || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Report Metadata (Col 4) */}
                    <div className="space-y-2">
                      {/* Created Date */}
                      <div>
                        <p className="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                          <FaCalendar size={10} /> Date
                        </p>
                        <p className="text-xs text-gray-700">
                          {formatDate(report.createdAt)}
                        </p>
                      </div>

                      {/* Chat Room ID */}
                      {report.chatRoomId && (
                        <div>
                          <p className="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                            <FaFileAlt size={10} /> Room ID
                          </p>
                          <p className="text-xs font-mono bg-gray-100 px-2 py-1 rounded truncate">
                            {report.chatRoomId?.slice(0, 8) || 'N/A'}...
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Status & Actions (Col 5) */}
                    <div className="space-y-3 lg:text-right">
                      {/* Status Badge */}
                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                            report.reportStatus
                          )}`}
                        >
                          {getStatusBadgeText(report.reportStatus)}
                        </span>
                      </div>

                      {/* View Button */}
                      <button
                        onClick={() => handleViewReport(report.id)}
                        className="w-full lg:w-auto px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <FaEye size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 px-6 py-6 border-t border-gray-200">
              <button
                onClick={handlePrevPage}
                disabled={pageNo === 0}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-all font-semibold"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 font-bold text-gray-700 bg-gray-100 rounded-lg">
                Page {pageNo + 1} / {totalPages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pageNo >= totalPages - 1}
                className="px-4 py-2 bg-[#03ccba] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#02b5a5] transition-all font-semibold"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
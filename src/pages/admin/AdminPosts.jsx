import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import postApi from "../../api/postApi";
import adminApi from "../../api/adminApi";
import statisticApi from "../../api/statisticApi";
import {
  FaArrowLeft,
  FaSpinner,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaClock,
  FaFilter,
  FaSearch,
  FaBook,
  FaImage,
  FaCalendarAlt,
} from "react-icons/fa";
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
} from "recharts";

const DEBUG = true;

export default function AdminPosts() {
  const navigate = useNavigate();
  
  // Posts State
  const [posts, setPosts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [postStats, setPostStats] = useState(null);
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  
  // Pagination State
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  
  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("bar");

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchSubjects();
    fetchPosts();
    fetchPostStats();
  }, [pageNo]);

  // ==================== API CALLS ====================
  
  // ✅ Fetch Subjects
  const fetchSubjects = async () => {
    try {
      if (DEBUG) console.log("📚 Fetching subjects...");
      
      const response = await adminApi.getSubjects(0, 100);
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      if (DEBUG) console.log("📚 Subjects loaded:", items.length);
      setSubjects(items);
    } catch (err) {
      console.error("❌ Error fetching subjects:", err);
      setSubjects([]);
    }
  };

  // ✅ Fetch Posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (DEBUG) console.log("📋 Fetching posts...");
      
      const response = await postApi.getAllPosts(pageNo, pageSize);
      
      if (DEBUG) console.log("📋 Posts Response:", response);
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        setTotalPages(response.data.totalPages || 0);
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }
      
      if (DEBUG) console.log("📋 Posts loaded:", items.length);
      
      setPosts(items);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
      setError("Unable to load posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Post Statistics
  const fetchPostStats = async () => {
    try {
      if (DEBUG) console.log("📊 Fetching post stats...");
      
      const response = await statisticApi.getPostStatus();
      
      if (DEBUG) console.log("📊 Post stats:", response);
      
      setPostStats(response?.data || response);
    } catch (err) {
      console.error("❌ Error fetching post stats:", err);
    }
  };

  // ==================== HELPERS ====================
  
  // Get subject name from subjectId
  const getSubjectName = (subjectId) => {
    if (!subjectId) return "Unknown";
    const subject = subjects.find(
      (s) => s.id === subjectId || String(s.id) === String(subjectId)
    );
    return subject?.name || "Unknown";
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      OPEN: "bg-green-100 text-green-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      REPORTED: "bg-red-100 text-red-800",
      SOLVED: "bg-emerald-100 text-emerald-800",
      CLOSED: "bg-gray-100 text-gray-800",
    };
    return colors[status?.toUpperCase()] || "bg-gray-100 text-gray-800";
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      OPEN: "🟢",
      IN_PROGRESS: "🔵",
      REPORTED: "🚩",
      SOLVED: "✅",
      CLOSED: "🔒",
    };
    return icons[status?.toUpperCase()] || "❓";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==================== FILTERS ====================
  
  const filteredPosts = posts.filter((post) => {
    // Search filter
    const matchesSearch =
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || post.status === statusFilter;

    // Subject filter
    const matchesSubject =
      subjectFilter === "all" ||
      post.subjectId === subjectFilter ||
      String(post.subjectId) === String(subjectFilter);

    return matchesSearch && matchesStatus && matchesSubject;
  });

  // ==================== CHART DATA ====================
  
  const chartData = postStats
    ? [
        {
          name: "Open",
          value: postStats.open || 0,
          fill: "#10b981",
        },
        {
          name: "In Progress",
          value: postStats.in_progress || 0,
          fill: "#3b82f6",
        },
        {
          name: "Reported",
          value: postStats.reported || 0,
          fill: "#ef4444",
        },
        {
          name: "Solved",
          value: postStats.solved || 0,
          fill: "#059669",
        },
        {
          name: "Closed",
          value: postStats.closed || 0,
          fill: "#9ca3af",
        },
      ]
    : [];

  const pieData = chartData.filter((d) => d.value > 0);

  // ==================== PAGINATION ====================
  
  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  // ==================== LOADING STATE ====================
  
  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all mb-4"
          >
            <FaArrowLeft /> Back
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <FaFileAlt size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">📄 Post Management</h1>
              <p className="text-teal-100 text-lg mt-1">
                Manage and monitor all posts on the platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* ==================== STATISTICS CARDS ==================== */}
        {postStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Total */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#03ccba] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Total Posts
                </h3>
                <FaFileAlt className="text-[#03ccba] text-2xl" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {postStats.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">All posts</p>
            </div>

            {/* Open */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">Open</h3>
                <FaCheckCircle className="text-green-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {postStats.open || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Seeking tutors</p>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  In Progress
                </h3>
                <FaClock className="text-blue-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {postStats.in_progress || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Active</p>
            </div>

            {/* Reported */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Reported
                </h3>
                <FaExclamationTriangle className="text-red-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {postStats.reported || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Under review</p>
            </div>

            {/* Solved */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">Solved</h3>
                <FaCheckCircle className="text-emerald-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {postStats.solved || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Completed</p>
            </div>
          </div>
        )}

        {/* ==================== CHARTS SECTION ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar/Line Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                📊 Post Status Distribution
              </h2>
              <button
                onClick={() =>
                  setChartType(chartType === "bar" ? "line" : "bar")
                }
                className="px-3 py-1 bg-[#03ccba] text-white text-xs font-bold rounded hover:bg-[#02b5a5] transition-all"
              >
                {chartType === "bar" ? "Switch to Line" : "Switch to Bar"}
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === "bar" ? (
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
                    dot={{ fill: "#03ccba", r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🎯 Status Breakdown
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
              <FaSearch className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title or description..."
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
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REPORTED">Reported</option>
                <option value="SOLVED">Solved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <FaBook className="text-gray-400" size={18} />
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setPageNo(0);
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#03ccba] text-gray-700"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 font-semibold text-sm">
                📊 {filteredPosts.length} of {posts.length} posts
              </p>
            </div>
          </div>
        </div>

        {/* ==================== POSTS TABLE ==================== */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">No.</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Post Info</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <tr
                      key={post.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {/* No. */}
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {pageNo * pageSize + index + 1}
                      </td>

                      {/* Post Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-lg flex items-center justify-center text-white text-lg">
                              <FaFileAlt />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {post.title || "Untitled"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {post.description
                                ? post.description.substring(0, 50) + "..."
                                : "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          <FaBook size={12} />
                          {getSubjectName(post.subjectId)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${getStatusColor(
                            post.status
                          )}`}
                        >
                          {getStatusIcon(post.status)} {post.status || "OPEN"}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt size={12} className="text-[#03ccba]" />
                          {formatDate(post.createdAt)}
                        </div>
                      </td>

                      {/* Details */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/admin/posts/${post.id}`)}
                          className="px-3 py-2 bg-[#03ccba] text-white rounded text-xs font-bold hover:bg-[#02b5a5] transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <FaFileAlt className="text-gray-300 text-5xl mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {searchQuery || statusFilter !== "all" || subjectFilter !== "all"
                          ? "No posts match your filters"
                          : "No posts found"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
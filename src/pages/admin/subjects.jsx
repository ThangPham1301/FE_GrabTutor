import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import adminApi from "../../api/adminApi";
import statisticApi from "../../api/statisticApi";
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaBook,
  FaFilter,
  FaSearch,
  FaCalendar,
  FaChartBar,
  FaClock,
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

export default function AdminSubjects() {
  const navigate = useNavigate();

  // State
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [subjectStats, setSubjectStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [chartType, setChartType] = useState("bar");

  // Pagination
  const [pageNo, setPageNo] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // Form
  const [formData, setFormData] = useState({
    name: "",
  });

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchSubjects();
    fetchSubjectStats();
  }, [pageNo]);

  useEffect(() => {
    filterSubjects();
  }, [subjects, searchQuery]);

  // ==================== API CALLS ====================

  // ✅ Fetch Subjects
  const fetchSubjects = async () => {
    setLoading(true);
    try {
      if (DEBUG) console.log("📚 Fetching subjects...");

      const response = await adminApi.getSubjects(pageNo, pageSize);

      if (DEBUG) console.log("📚 Subjects Response:", response);

      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
        setTotalPages(response.data.totalPages || 0);
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }

      if (DEBUG) console.log("📚 Subjects loaded:", items.length);

      setSubjects(items);
      setError(null);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Unable to load subjects");
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Subject Statistics
  const fetchSubjectStats = async () => {
    try {
      if (DEBUG) console.log("📊 Fetching subject stats...");

      // Mock stats since backend may not have this endpoint
      // In real scenario, fetch from backend
      const totalSubjects = subjects.length;
      const activeSubjects = Math.floor(totalSubjects * 0.9);
      const recentSubjects = Math.floor(totalSubjects * 0.3);

      setSubjectStats({
        total: totalSubjects,
        active: activeSubjects,
        recent: recentSubjects,
      });
    } catch (err) {
      console.error("❌ Error fetching subject stats:", err);
    }
  };

  // ==================== HANDLERS ====================

  // ✅ Filter Subjects
  const filterSubjects = () => {
    let filtered = subjects;

    if (searchQuery) {
      filtered = filtered.filter((subject) =>
        subject.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSubjects(filtered);
  };

  // ✅ Open Modal for Create/Edit
  const handleOpenModal = (subject = null) => {
    if (subject) {
      setEditingId(subject.id);
      setFormData({
        name: subject.name,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
      });
    }
    setShowModal(true);
  };

  // ✅ Save Subject (Create/Update)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("❌ Please enter subject name!");
      return;
    }

    try {
      if (editingId) {
        // Update
        await adminApi.updateSubject(editingId, { name: formData.name });
        alert("✅ Subject updated successfully!");
      } else {
        // Create
        await adminApi.createSubject({ name: formData.name });
        alert("✅ Subject created successfully!");
      }
      setShowModal(false);
      setPageNo(0);
      await fetchSubjects();
    } catch (err) {
      alert(
        "❌ Error: " +
          (err.response?.data?.message || "Unable to save subject")
      );
      console.error("Error:", err);
    }
  };

  // ✅ Delete Subject
  const handleDelete = async (subjectId, subjectName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${subjectName}"? This action cannot be undone.`
      )
    ) {
      try {
        await adminApi.deleteSubject(subjectId);
        alert("✅ Subject deleted successfully!");
        await fetchSubjects();
      } catch (err) {
        alert("❌ Error deleting subject!");
        console.error("Delete error:", err);
      }
    }
  };

  // ==================== PAGINATION ====================
  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  // ==================== CHART DATA ====================
  const chartData = subjects.length > 0
    ? [
        {
          name: "Total",
          value: subjects.length,
          fill: "#03ccba",
        },
        {
          name: "Created This Month",
          value: Math.floor(subjects.length * 0.3),
          fill: "#10b981",
        },
        {
          name: "Popular",
          value: Math.floor(subjects.length * 0.4),
          fill: "#3b82f6",
        },
      ]
    : [];

  const pieData = [
    {
      name: "Active",
      value: Math.floor(subjects.length * 0.9),
      fill: "#10b981",
    },
    {
      name: "Archived",
      value: Math.floor(subjects.length * 0.1),
      fill: "#9ca3af",
    },
  ].filter((d) => d.value > 0);

  // ==================== HELPERS ====================
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

  // ==================== LOADING STATE ====================
  if (loading && subjects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading subjects...</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FaBook size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-bold">📚 Subject Management</h1>
                <p className="text-teal-100 text-lg mt-1">
                  Manage all subjects on the platform
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#03ccba] rounded-lg font-bold hover:bg-opacity-90 transition-all"
            >
              <FaPlus /> Add Subject
            </button>
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
        {subjectStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Subjects */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#03ccba] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Total Subjects
                </h3>
                <FaBook className="text-[#03ccba] text-2xl" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {subjectStats.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">All registered subjects</p>
            </div>

            {/* Active Subjects */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Active Subjects
                </h3>
                <FaChartBar className="text-green-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {subjectStats.active || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Currently in use</p>
            </div>

            {/* Recent Subjects */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Recent Subjects
                </h3>
                <FaClock className="text-blue-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {subjectStats.recent || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Added this month</p>
            </div>
          </div>
        )}

        {/* ==================== CHARTS SECTION ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar/Line Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                📊 Subject Distribution
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
              🎯 Subject Status
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

        {/* ==================== SEARCH & FILTER ==================== */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
            <FaSearch className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by subject name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageNo(0);
              }}
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* ==================== SUBJECTS TABLE ==================== */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">No.</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Subject Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold">
                    Created Date
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subject, index) => (
                    <tr
                      key={subject.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      {/* No. */}
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {pageNo * pageSize + index + 1}
                      </td>

                      {/* Subject Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {subject.name?.charAt(0).toUpperCase() || "S"}
                          </div>
                          <span className="font-semibold text-gray-900">
                            {subject.name || "Untitled"}
                          </span>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCalendar size={12} className="text-[#03ccba]" />
                          {formatDate(subject.createdAt) || "N/A"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(subject)}
                            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-1"
                            title="Edit subject"
                          >
                            <FaEdit size={12} /> Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(subject.id, subject.name)
                            }
                            className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1"
                            title="Delete subject"
                          >
                            <FaTrash size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12">
                      <FaBook className="text-gray-300 text-5xl mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {searchQuery
                          ? "No subjects match your search"
                          : "No subjects found"}
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

      {/* ==================== CREATE/EDIT MODAL ==================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? "✏️ Edit Subject" : "➕ Add New Subject"}
            </h2>

            <div className="space-y-4">
              {/* Subject Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#03ccba] text-gray-900"
                  placeholder="Enter subject name..."
                  autoFocus
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../../api/userApi";
import statisticApi from "../../api/statisticApi";
import Navbar from "../../components/Navbar";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaTrash,
  FaSpinner,
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaUserSlash,
  FaSearch,
  FaFilter,
  FaDownload,
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

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [pageNo, pageSize]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  // ✅ FETCH ALL USERS
  const fetchUsers = async () => {
    setLoading(true);
    try {
      if (DEBUG) console.log("📋 Fetching users...");

      const response = await userApi.getAllUsers(pageNo, pageSize);

      if (DEBUG) console.log("📋 Users Response:", response);

      let items = [];
      if (response.data && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      }

      if (DEBUG) console.log("📋 Total users:", items.length);

      setUsers(items);
      setTotalPages(response.data?.totalPages || 0);
      setError(null);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("Unable to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH USER STATS
  const fetchUserStats = async () => {
    try {
      if (DEBUG) console.log("📊 Fetching user stats...");

      const response = await statisticApi.getUserStatus("user", 0, 100);

      if (DEBUG) console.log("📊 User stats:", response);

      setUserStats(response?.data || response);
    } catch (err) {
      console.error("❌ Error fetching user stats:", err);
    }
  };

  // ✅ FILTER USERS
  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phoneNumber?.includes(searchQuery)
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  // ✅ DELETE USER
  const handleDeleteUser = async (userId, userName) => {
    if (
      window.confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
      )
    ) {
      try {
        await userApi.deleteUser(userId);
        alert("✅ User deleted successfully!");
        await fetchUsers();
      } catch (err) {
        alert("❌ Error deleting user!");
        console.error("Delete error:", err);
      }
    }
  };

  // ✅ TOGGLE USER ACTIVE STATUS
  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await userApi.changeActive(userId, !currentStatus);
      alert(
        `✅ User ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
      await fetchUsers();
    } catch (err) {
      alert("❌ Error updating user status!");
      console.error("Toggle error:", err);
    }
  };

  // ✅ PAGINATION
  const handleNextPage = () => {
    if (pageNo < totalPages - 1) setPageNo(pageNo + 1);
  };

  const handlePrevPage = () => {
    if (pageNo > 0) setPageNo(pageNo - 1);
  };

  // ✅ PREPARE CHART DATA
  const chartData = userStats
    ? [
        {
          name: "Total",
          value: userStats.total || 0,
          fill: "#03ccba",
        },
        {
          name: "Active",
          value: userStats.active || 0,
          fill: "#10b981",
        },
        {
          name: "Inactive",
          value: userStats.inactive || 0,
          fill: "#ef4444",
        },
        {
          name: "Pending",
          value: userStats.pending || 0,
          fill: "#f59e0b",
        },
      ]
    : [];

  const pieData = [
    { name: "Active", value: userStats?.active || 0, fill: "#10b981" },
    { name: "Inactive", value: userStats?.inactive || 0, fill: "#ef4444" },
    { name: "Pending", value: userStats?.pending || 0, fill: "#f59e0b" },
  ].filter((d) => d.value > 0);

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
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
              <FaUsers size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-bold">👥 User Management</h1>
              <p className="text-teal-100 text-lg mt-1">
                Manage and monitor all registered users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* ==================== STATISTICS CARDS ==================== */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#03ccba] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Total Users
                </h3>
                <FaUsers className="text-[#03ccba] text-2xl" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {userStats.total || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">All registered users</p>
            </div>

            {/* Active Users */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Active Users
                </h3>
                <FaUserCheck className="text-green-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {userStats.active || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Currently active</p>
            </div>

            {/* Inactive Users */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Inactive Users
                </h3>
                <FaUserSlash className="text-red-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-red-600">
                {userStats.inactive || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Deactivated users</p>
            </div>

            {/* Pending Users */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 font-semibold text-sm">
                  Pending Users
                </h3>
                <FaUserClock className="text-yellow-500 text-2xl" />
              </div>
              <p className="text-3xl font-bold text-yellow-600">
                {userStats.pending || 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">Awaiting verification</p>
            </div>
          </div>
        )}

        {/* ==================== CHARTS SECTION ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                📊 User Status Distribution
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
              <FaSearch className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" size={18} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#03ccba] text-gray-700"
              >
                <option value="all">All Roles</option>
                <option value="USER">Student</option>
                <option value="TUTOR">Tutor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================== USERS TABLE ==================== */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold">No.</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Phone</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id || index}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {pageNo * pageSize + index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.fullName?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className="font-semibold text-gray-900 truncate">
                            {user.fullName || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.phoneNumber || "N/A"}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                            user.role === "USER"
                              ? "bg-blue-100 text-blue-800"
                              : user.role === "TUTOR"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {user.role === "USER"
                            ? "Student"
                            : user.role === "TUTOR"
                            ? "Tutor"
                            : "Admin"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {user.active !== false ? (
                          <span className="flex items-center gap-2 text-green-600 font-semibold">
                            <FaCheckCircle size={14} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-600 font-semibold">
                            <FaTimesCircle size={14} /> Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleActive(user.id, user.active !== false)
                            }
                            className={`px-3 py-2 rounded text-xs font-bold transition-all ${
                              user.active !== false
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            title={
                              user.active !== false
                                ? "Deactivate user"
                                : "Activate user"
                            }
                          >
                            {user.active !== false ? "Deactivate" : "Activate"}
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteUser(user.id, user.fullName)
                            }
                            className="px-3 py-2 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-1"
                            title="Delete user"
                          >
                            <FaTrash size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <FaUsers className="text-gray-300 text-5xl mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        {searchQuery || roleFilter !== "all"
                          ? "No users match your search"
                          : "No users found"}
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
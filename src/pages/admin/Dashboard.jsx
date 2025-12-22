import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaSignOutAlt,
  FaChalkboardTeacher,
  FaBook,
  FaComments,
  FaWallet,
  FaFileAlt,
  FaSpinner,
  FaArrowRight,
  FaFlag,
  FaChartLine,
  FaCheckCircle,
  FaHome, // ✅ THAY THẾ FaDashboard thành FaHome
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import statisticApi from '../../api/statisticApi';

const DEBUG = true;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [postStats, setPostStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      if (DEBUG) console.log('📊 Fetching dashboard stats...');

      // ✅ Fetch user totals
      const statsResponse = await statisticApi.getUserTotals();
      if (DEBUG) console.log('👥 User stats:', statsResponse);
      setUserStats(statsResponse?.data || statsResponse);

      // ✅ Fetch post status
      const postResponse = await statisticApi.getPostStatus();
      if (DEBUG) console.log('📄 Post stats:', postResponse);
      setPostStats(postResponse?.data || postResponse);

      setError(null);
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login-role');
  };

  // ==================== MENU ITEMS ====================
  const menuItems = [
    {
      label: 'User Management',
      icon: FaUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      onClick: () => navigate('/admin/users'),
      description: 'Manage all registered users',
    },
    {
      label: 'Tutor Management',
      icon: FaChalkboardTeacher,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      onClick: () => navigate('/admin/tutors'),
      description: 'Monitor tutors and ratings',
    },
    {
      label: 'Post Management',
      icon: FaFileAlt,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      onClick: () => navigate('/admin/posts'),
      description: 'Review and manage posts',
    },
    {
      label: 'Subject Management',
      icon: FaBook,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      onClick: () => navigate('/admin/subjects'),
      description: 'Manage course subjects',
    },
    {
      label: 'Report Management',
      icon: FaFlag,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      onClick: () => navigate('/admin/interactions'),
      description: 'Handle user reports',
    },
    {
      label: 'Wallet & Transactions',
      icon: FaWallet,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      onClick: () => navigate('/admin/transactions'),
      description: 'Monitor financial data',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-[#03ccba] mb-4" />
            <p className="text-gray-600 text-lg">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur">
                <FaHome size={32} /> {/* ✅ THAY ĐỔI TẠI ĐÂY */}
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">Admin Dashboard</h1>
                <p className="text-teal-100 text-lg mt-1">Welcome back! Manage your platform here.</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-white text-[#03ccba] hover:bg-gray-100 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-8 shadow">
            <p className="text-red-700 font-semibold">❌ {error}</p>
          </div>
        )}

        {/* ==================== MANAGEMENT MENU ==================== */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#03ccba] to-[#02b5a5] rounded"></div>
            Platform Management
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className={`bg-white border-l-4 rounded-xl p-8 hover:shadow-xl hover:scale-105 transition-all duration-300 text-left group shadow-md hover:border-l-8`}
                  style={{ borderLeftColor: item.color.split(' ')[1] }}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 text-white shadow-lg group-hover:shadow-xl transition-shadow`}
                  >
                    <Icon size={28} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#03ccba] transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 text-[#03ccba] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Access</span>
                    <FaArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================== FOOTER INFO ==================== */}
        <div className="mt-12 p-8 bg-white rounded-xl shadow-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">📊 Platform Overview</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>✓ {userStats?.total || 0} total users on platform</li>
                <li>✓ {postStats?.total || 0} questions posted</li>
                <li>✓ {postStats?.open || 0} posts waiting for tutors</li>
                <li>✓ Real-time chat & notifications enabled</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">🎯 System Status</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  All systems operational
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Database connected
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  API responding normally
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  No active alerts
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
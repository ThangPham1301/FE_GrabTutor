import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaSignOutAlt, FaChalkboardTeacher, FaBook, FaComments, FaWallet, FaFileAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import userApi from '../../api/userApi';
import statisticApi from '../../api/statisticApi';

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
      // ✅ Dùng API user-totals thay vì getAllUsers
      const statsResponse = await statisticApi.getUserTotals();
      console.log('User totals response:', statsResponse);
      setUserStats(statsResponse?.data || statsResponse);
      
      // ✅ Fetch post stats
      const postResponse = await statisticApi.getPostStatus();
      console.log('Post status response:', postResponse);
      setPostStats(postResponse?.data || postResponse);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
      setUserStats(null);
      setPostStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login-role');
  };

  const menu = [
    {
      label: 'Quản lý User',
      icon: <FaUsers className="text-4xl text-blue-600" />,
      onClick: () => {
        navigate('/admin/users');
      }
    },
    {
      label: 'Quản lý Tutor',
      icon: <FaChalkboardTeacher className="text-4xl text-green-600" />,
      onClick: () => {
        navigate('/admin/tutors');
      }
    },
    {
      label: 'Quản lý Bài đăng',
      icon: <FaFileAlt className="text-4xl text-purple-600" />,
      onClick: () => {
        navigate('/admin/posts');
      }
    },
    {
      label: 'Quản lý môn học',
      icon: <FaBook className="text-4xl text-yellow-600" />,
      onClick: () => {
        navigate('/admin/subjects');
      }
    },
    {
      label: 'Quản lý tương tác',
      icon: <FaComments className="text-4xl text-pink-600" />,
      onClick: () => {
        navigate('/admin/interactions');
      }
    },
    {
      label: 'Quản lý Ví',
      icon: <FaWallet className="text-4xl text-emerald-600" />,
      onClick: () => {
        navigate('/admin/wallet');
      }
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-16">
          <p className="text-lg text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 mx-4 mt-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Quản lý hệ thống GrabTutor</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>

        {/* ✅ Stats từ API */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold">Tổng User</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{userStats?.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold">Tutor</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{userStats?.tutor || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-semibold">Student</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{userStats?.user || 0}</p>
          </div>
        </div>

        {/* ✅ Post Stats */}
        {postStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
              <p className="text-gray-600 text-sm font-semibold">Tất cả Bài đăng</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">{postStats?.total || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <p className="text-gray-600 text-sm font-semibold">Đang mở</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">{postStats?.open || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <p className="text-gray-600 text-sm font-semibold">Đã đóng</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{postStats?.closed || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
              <p className="text-gray-600 text-sm font-semibold">Bị xóa</p>
              <p className="text-4xl font-bold text-gray-600 mt-2">{postStats?.deleted || 0}</p>
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Quản lý</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                type="button"
                className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow hover:shadow-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 hover:border-[#03ccba] cursor-pointer"
              >
                {item.icon}
                <p className="text-lg font-semibold text-gray-900 mt-4 text-center">{item.label}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
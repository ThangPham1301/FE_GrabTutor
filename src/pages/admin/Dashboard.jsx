import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaSignOutAlt, FaChalkboardTeacher, FaBook, FaComments, FaWallet } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar';
import userApi from '../../api/userApi';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers();
      if (response.data && response.data.items) {
        setUsers(response.data.items);
      } else {
        setUsers([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load users');
      console.error('Error fetching users:', err);
      setUsers([]);
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
        console.log('Navigate to /admin/users');
        navigate('/admin/users');
      }
    },
    {
      label: 'Quản lý Tutor',
      icon: <FaChalkboardTeacher className="text-4xl text-green-600" />,
      onClick: () => {
        console.log('Navigate to /admin/tutors');
        navigate('/admin/tutors');
      }
    },
    {
      label: 'Quản lý môn học',
      icon: <FaBook className="text-4xl text-yellow-600" />,
      onClick: () => {
        console.log('Navigate to /admin/subjects');
        navigate('/admin/subjects');
      }
    },
    {
      label: 'Quản lý tương tác',
      icon: <FaComments className="text-4xl text-pink-600" />,
      onClick: () => {
        console.log('Navigate to /admin/interactions');
        navigate('/admin/interactions');
      }
    },
    {
      label: 'Quản lý nạp tiền',
      icon: <FaWallet className="text-4xl text-teal-600" />,
      onClick: () => {
        console.log('Navigate to /admin/wallet');
        navigate('/admin/wallet');
      }
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Quản lý hệ thống GrabTutor</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Tổng User</p>
            <p className="text-3xl font-bold text-gray-900">{users.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Tutor</p>
            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'TUTOR').length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Student</p>
            <p className="text-3xl font-bold text-gray-900">{users.filter(u => u.role === 'USER').length || 0}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map((item, idx) => (
              <button
                key={idx}
                onClick={item.onClick}
                type="button"
                className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow hover:shadow-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 hover:border-[#03ccba] cursor-pointer"
              >
                {item.icon}
                <span className="mt-4 text-sm font-semibold text-gray-700 text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logout button */}
        <div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FaSignOutAlt /> Log out
          </button>
        </div>
      </div>
    </div>
  );
}
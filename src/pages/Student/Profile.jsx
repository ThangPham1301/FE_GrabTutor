import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaIdBadge, FaSave, FaTimes, FaEdit } from 'react-icons/fa';
import Navbar from '../../components/Navbar';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (user) {
      try {
        setFormData({
          fullName: user.fullName || '',
          dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
          phoneNumber: user.phoneNumber || ''
        });
      } catch (error) {
        console.error('Error setting form data:', error);
      }
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f7f2ed] flex items-center justify-center">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  const handleLogout = () => {
    try {
      logout();
      navigate('/login-role');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSave = async () => {
    try {
      // API call would go here
      // await userApi.updateProfile(formData);
      setIsEditing(false);
      alert('Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Lỗi khi cập nhật thông tin!');
    }
  };

  const handleCancel = () => {
    try {
      setFormData({
        fullName: user.fullName || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        phoneNumber: user.phoneNumber || ''
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Cancel error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2ed]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 flex items-center gap-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5]"
                >
                  <FaEdit /> Chỉnh sửa
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 flex items-center gap-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <FaTimes /> Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 flex items-center gap-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5]"
                  >
                    <FaSave /> Lưu
                  </button>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <FaEnvelope className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Full Name */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <FaUser className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Họ và tên</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba]"
                  />
                ) : (
                  <p className="font-medium">{formData.fullName}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <FaPhone className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba]"
                  />
                ) : (
                  <p className="font-medium">{formData.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* DOB */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <FaCalendar className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ngày sinh</p>
                {isEditing ? (
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#03ccba]"
                  />
                ) : (
                  <p className="font-medium">{new Date(formData.dob).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {/* Role (Read-only) */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <FaIdBadge className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Vai trò</p>
                <p className="font-medium">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
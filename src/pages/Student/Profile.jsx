import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaEdit, FaSave, FaTimes, FaSignOutAlt, FaKey, FaShieldAlt, FaClock, FaCheckCircle, FaUserCircle, FaStar, FaBook, FaTrophy } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import userApi from '../../api/userApi';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myInfo, setMyInfo] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dob: ''
  });

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchFullUserInfo(),
        fetchMyInfo()
      ]).then(() => {
        console.log('✅ Both API calls completed');
      }).catch(err => {
        console.error('❌ Error in profile data fetch:', err);
      });
    }
  }, [user]);

  const fetchFullUserInfo = async () => {
    try {
      setLoading(true);
      console.log('=== fetchFullUserInfo START ===');
      
      const response = await userApi.getMyInfo();
      
      console.log('=== getMyInfo Response ===');
      console.log(JSON.stringify(response, null, 2));
      
      const fullUserData = response.data || response;
      
      console.log('fullUserData:', fullUserData);
      
      setFormData({
        fullName: fullUserData.fullName || user.fullName || '',
        phoneNumber: fullUserData.phoneNumber || '',
        dob: fullUserData.dob ? new Date(fullUserData.dob).toISOString().split('T')[0] : ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('=== fetchFullUserInfo ERROR ===');
      console.error('Error:', error.message);
      
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : ''
      });
      
      setLoading(false);
    }
  };

  // ✅ Fetch MyInfo to get userStatus
  const fetchMyInfo = async () => {
    try {
      console.log('=== fetchMyInfo START ===');
      console.log('📝 Current user.userId:', user.userId);
      
      const response = await userApi.getMyInfo();
      
      const myInfoData = response.data || response;
      console.log('=== MyInfo Response ===');
      console.log(JSON.stringify(myInfoData, null, 2));
      
      // ✅ Match userId
      console.log('📊 userId Matching:');
      console.log('  - myInfoData.userId:', myInfoData.userId);
      console.log('  - user.userId:', user.userId);
      
      if (myInfoData.userId === user.userId) {
        console.log('✅ userId matched successfully!');
        console.log('📌 userStatus from myInfo:', myInfoData.userStatus);
        setMyInfo(myInfoData);
      } else {
        console.warn('⚠️ userId mismatch - setting data anyway');
        setMyInfo(myInfoData);
      }
    } catch (error) {
      console.error('❌ Error fetching my info:', error);
      setMyInfo(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const handleLogout = () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await userApi.updateProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
      await fetchFullUserInfo();
    } catch (error) {
      console.error('Update error:', error);
      alert('Error updating profile!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    fetchFullUserInfo();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-teal-600">
                  {(user?.fullName || user?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Student Profile</h1>
                <p className="text-teal-100 text-lg">Manage your account and learning progress</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="bg-white text-teal-600 px-4 py-2 rounded-full text-sm font-semibold">
                    {user.role}
                  </span>
                  <span className="bg-white text-teal-600 px-4 py-2 rounded-full text-sm font-semibold">
                    Active Member
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    disabled={loading}
                    className="px-6 py-3 flex items-center gap-2 bg-white text-[#03ccba] rounded-lg hover:bg-gray-100 transition-all font-bold disabled:opacity-50"
                  >
                    <FaEdit size={18} /> Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="px-6 py-3 flex items-center gap-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold disabled:opacity-50"
                  >
                    <FaSignOutAlt size={18} /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-6 py-3 flex items-center gap-2 border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#03ccba] transition-colors font-bold disabled:opacity-50"
                  >
                    <FaTimes size={18} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-3 flex items-center gap-2 bg-white text-[#03ccba] rounded-lg hover:bg-gray-100 transition-all font-bold disabled:opacity-50"
                  >
                    <FaSave size={18} /> Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Full Name */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Full Name
                  </label>
                  <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                    isEditing 
                      ? 'border-[#03ccba] bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-transparent text-gray-900 font-medium outline-none disabled:cursor-not-allowed text-lg"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Email
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full bg-transparent text-gray-900 font-medium outline-none cursor-not-allowed text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone Number */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Phone Number
                  </label>
                  <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                    isEditing 
                      ? 'border-[#03ccba] bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-transparent text-gray-900 font-medium outline-none disabled:cursor-not-allowed text-lg"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Date of Birth
                  </label>
                  <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                    isEditing 
                      ? 'border-[#03ccba] bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-transparent text-gray-900 font-medium outline-none disabled:cursor-not-allowed text-lg"
                    />
                  </div>
                </div>

                {/* Role (Read-only) */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Role
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <input
                      type="text"
                      value={user.role}
                      disabled
                      className="w-full bg-transparent text-gray-900 font-medium outline-none cursor-not-allowed text-lg"
                    />
                  </div>
                </div>

                {/* Account Status (Read-only) */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Account Status
                  </label>
                  <div className={`border-2 rounded-xl p-4 ${myInfo?.userStatus === 'PENDING' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${myInfo?.userStatus === 'PENDING' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                      <span className="text-gray-900 font-medium text-lg">
                        {myInfo?.userStatus === 'PENDING' ? 'Pending Verification' : 'Active'}
                      </span>
                    </div>
                    {myInfo?.userStatus === 'PENDING' && (
                      <p className="text-xs text-yellow-700 mt-2">Waiting for admin approval...</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/change-password')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg hover:shadow-md transition-all"
                >
                  <FaKey className="text-purple-600 text-xl" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Change Password</p>
                    <p className="text-xs text-gray-600">Update your password</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/posts')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg hover:shadow-md transition-all"
                >
                  <FaBook className="text-blue-600 text-xl" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Browse Posts</p>
                    <p className="text-xs text-gray-600">Find tutors & questions</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/posts/inventory')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg hover:shadow-md transition-all"
                >
                  <FaTrophy className="text-orange-600 text-xl" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">My Posts</p>
                    <p className="text-xs text-gray-600">Your learning requests</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <FaShieldAlt className="text-blue-600 text-xl mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Security Tip</h4>
                  <p className="text-sm text-gray-700">
                    Update your password regularly and never share your credentials with anyone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaIdCard, FaUniversity, FaGraduationCap, FaBook, FaEdit, FaSave, FaTimes, FaSignOutAlt, FaClock, FaStar, FaCheckCircle, FaUserCircle, FaChartLine, FaKey } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import userApi from '../../api/userApi';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    dob: '',
    nationalId: '',
    university: '',
    highestAcademicDegree: '',
    major: ''
  });

  useEffect(() => {
    if (user) {
      fetchFullUserInfo();
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
        dob: fullUserData.dob ? new Date(fullUserData.dob).toISOString().split('T')[0] : '',
        nationalId: fullUserData.nationalId || '',
        university: fullUserData.university || '',
        highestAcademicDegree: fullUserData.highestAcademicDegree || '',
        major: fullUserData.major || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('=== fetchFullUserInfo ERROR ===');
      console.error('Error:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);
      
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
        nationalId: user.nationalId || '',
        university: user.university || '',
        highestAcademicDegree: user.highestAcademicDegree || '',
        major: user.major || ''
      });
      
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
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
      console.log('=== handleSave START ===');
      console.log('Updating with data:', formData);
      
      const updatePayload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dob: formData.dob,
        nationalId: formData.nationalId,
        university: formData.university,
        highestAcademicDegree: formData.highestAcademicDegree,
        major: formData.major
      };
      
      const response = await userApi.updateProfile(updatePayload);
      
      console.log('=== handleSave SUCCESS ===');
      console.log('Response:', response);
      
      await fetchFullUserInfo();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('=== handleSave ERROR ===');
      console.error('Error:', error.message);
      console.error('Status:', error.response?.status);
      console.error('Response:', error.response?.data);
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
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
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <FaUserCircle className="text-5xl text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Tutor Profile</h1>
                <p className="text-teal-100 text-lg">Manage your professional information</p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-semibold">
                    {user.role}
                  </span>
                  <span className="bg-white bg-opacity-20 px-4 py-2 rounded-full text-sm font-semibold">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Professional Information</h2>
              
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

                {/* National ID */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    National ID / Passport
                  </label>
                  <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                    isEditing 
                      ? 'border-[#03ccba] bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <input
                      type="text"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-transparent text-gray-900 font-medium outline-none disabled:cursor-not-allowed text-lg"
                      placeholder="Enter your ID"
                    />
                  </div>
                </div>

                {/* University */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    University
                  </label>
                  <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                    isEditing 
                      ? 'border-[#03ccba] bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-transparent text-gray-900 font-medium outline-none disabled:cursor-not-allowed text-lg"
                      placeholder="Enter your university"
                    />
                  </div>
                </div>

                {/* Major */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Major / Specialization
                  </label>
                  <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                    isEditing 
                      ? 'border-[#03ccba] bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-transparent text-gray-900 font-medium outline-none disabled:cursor-not-allowed text-lg"
                      placeholder="Enter your major"
                    />
                  </div>
                </div>

                {/* Degree */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Highest Academic Degree
                  </label>
                  <div className={`border-2 rounded-xl p-4 transition-all duration-300 ${
                    isEditing 
                      ? 'border-[#03ccba] bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md' 
                      : 'border-gray-200 bg-gray-50'
                  }`}>
                    <input
                      type="text"
                      value={formData.highestAcademicDegree}
                      onChange={(e) => setFormData({ ...formData, highestAcademicDegree: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-transparent text-gray-900 font-medium outline-none disabled:cursor-not-allowed text-lg"
                      placeholder="e.g., Bachelor, Master, PhD"
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
                  <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-900 font-medium text-lg">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
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
                  onClick={() => navigate('/posts/create')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg hover:shadow-md transition-all"
                >
                  <FaBook className="text-green-600 text-xl" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Create New Post</p>
                    <p className="text-xs text-gray-600">Share your tutoring services</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
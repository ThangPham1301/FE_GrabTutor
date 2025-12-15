import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUser, FaEnvelope, FaPhone, FaCalendar, FaIdCard, FaUniversity, 
  FaGraduationCap, FaBook, FaEdit, FaSave, FaTimes, FaSignOutAlt, 
  FaStar, FaCheckCircle, FaUserCircle, FaChartLine, FaKey 
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import userApi from '../../api/userApi';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // ✅ Tutor info state (from TutorInfoResponse)
  const [tutorInfo, setTutorInfo] = useState(null);
  
  // ✅ My info state (from getMyInfo)
  const [myInfo, setMyInfo] = useState(null);
  
  const [formData, setFormData] = useState({
    nationalId: '',
    university: '',
    highestAcademicDegree: '',
    major: ''
  });

  // ==================== FETCH DATA ====================
  useEffect(() => {
    if (user && user.userId) {
      fetchTutorInfo();
      fetchMyInfo(); // ✅ NEW - Fetch my info
    }
  }, [user]);

  // ✅ Fetch TutorInfoResponse
  const fetchTutorInfo = async () => {
    try {
      setLoading(true);
      console.log('=== fetchTutorInfo START ===');
      console.log('userId:', user.userId);
      
      const response = await userApi.getTutorInfo(user.userId);
      
      const tutorData = response.data || response;
      console.log('=== TutorInfo Response ===');
      console.log(JSON.stringify(tutorData, null, 2));
      
      // ✅ Set tutor info
      setTutorInfo(tutorData);
      
      // ✅ Populate form with tutor data
      setFormData({
        nationalId: tutorData.nationalId || '',
        university: tutorData.university || '',
        highestAcademicDegree: tutorData.highestAcademicDegree || '',
        major: tutorData.major || ''
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tutor info:', error);
      setTutorInfo(null);
      setLoading(false);
    }
  };

  // ✅ NEW - Fetch MyInfo (fullName, role, dob, email)
  const fetchMyInfo = async () => {
    try {
      console.log('=== fetchMyInfo START ===');
      
      const response = await userApi.getMyInfo();
      
      const myInfoData = response.data || response;
      console.log('=== MyInfo Response ===');
      console.log(JSON.stringify(myInfoData, null, 2));
      
      // ✅ Match userId
      if (myInfoData.userId === user.userId) {
        console.log('✅ userId matched!');
        setMyInfo(myInfoData);
      } else {
        console.warn('⚠️ userId mismatch');
        setMyInfo(myInfoData);
      }
    } catch (error) {
      console.error('Error fetching my info:', error);
      setMyInfo(null);
    }
  };

  // ==================== HANDLERS ====================
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
      console.log('Updating tutor info with data:', formData);
      
      const updatePayload = {
        nationalId: formData.nationalId,
        university: formData.university,
        highestAcademicDegree: formData.highestAcademicDegree,
        major: formData.major
      };
      
      // ✅ Call updateTutorInfo API
      const response = await userApi.updateTutorInfo(updatePayload);
      
      console.log('=== handleSave SUCCESS ===');
      console.log('Response:', response);
      
      await fetchTutorInfo();
      setIsEditing(false);
      alert('✅ Tutor profile updated successfully!');
    } catch (error) {
      console.error('=== handleSave ERROR ===');
      console.error('Error:', error.message);
      alert('❌ Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    fetchTutorInfo();
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (loading && !tutorInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading tutor profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] rounded-2xl shadow-xl p-8 mb-8 text-white mx-4 mt-4">
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
                  {myInfo?.role || user.role}
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
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* LEFT COLUMN - Professional Info (2/3) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Tutor Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Full Name (from myInfo - Read-only) */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Full Name
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <input
                      type="text"
                      value={myInfo?.fullName || user.fullName || ''}
                      disabled
                      className="w-full bg-transparent text-gray-900 font-medium outline-none cursor-not-allowed text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">From account info</p>
                </div>

                {/* Date of Birth (from myInfo - Read-only) */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Date of Birth
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <input
                      type="date"
                      value={myInfo?.dob ? new Date(myInfo.dob).toISOString().split('T')[0] : ''}
                      disabled
                      className="w-full bg-transparent text-gray-900 font-medium outline-none cursor-not-allowed text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">From account info</p>
                </div>

                {/* National ID (Editable) */}
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
                      placeholder="Enter your national ID"
                    />
                  </div>
                </div>

                {/* University (Editable) */}
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

                {/* Highest Academic Degree (Editable) */}
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

                {/* Major (Editable) */}
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

                {/* Email (Read-only) */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Email
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <input
                      type="email"
                      value={myInfo?.email || user.email || ''}
                      disabled
                      className="w-full bg-transparent text-gray-900 font-medium outline-none cursor-not-allowed text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                </div>

                {/* Role (Read-only) */}
                <div className="relative">
                  <label className="absolute -top-3 left-4 bg-white px-2 text-sm font-semibold text-[#03ccba]">
                    Role
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <input
                      type="text"
                      value={myInfo?.role || user.role || 'TUTOR'}
                      disabled
                      className="w-full bg-transparent text-gray-900 font-medium outline-none cursor-not-allowed text-lg"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">From account info</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Statistics (1/3) */}
          <div className="space-y-6">
            
            {/* ✅ STATISTICS CARD - FROM TutorInfoResponse */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Statistics</h3>
              
              <div className="space-y-6">
                
                {/* Average Stars */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">Average Rating</p>
                    <FaStar className="text-yellow-400 text-xl" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-yellow-600">
                      {tutorInfo?.averageStars?.toFixed(1) || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">/5.0 ⭐</p>
                  </div>
                  
                  {/* Star Display */}
                  {tutorInfo?.averageStars !== undefined && (
                    <div className="flex gap-1 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={16}
                          className={i < Math.round(tutorInfo.averageStars) ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Problems Solved */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700">Problems Solved</p>
                    <FaCheckCircle className="text-blue-500 text-xl" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-blue-600">
                      {tutorInfo?.problemSolved || 0}
                    </p>
                    <p className="text-sm text-gray-600">questions answered</p>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Account Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-lg font-bold text-green-600">Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
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
                    <p className="text-xs text-gray-600">Share tutoring services</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/my-courses')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg hover:shadow-md transition-all"
                >
                  <FaBook className="text-blue-600 text-xl" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">My Courses</p>
                    <p className="text-xs text-gray-600">Manage courses</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/wallet')}
                  className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg hover:shadow-md transition-all"
                >
                  <FaChartLine className="text-orange-600 text-xl" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Wallet & Earnings</p>
                    <p className="text-xs text-gray-600">Check balance</p>
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
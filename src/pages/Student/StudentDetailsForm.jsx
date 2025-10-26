// src/pages/Student/StudentDetailsForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaBirthdayCake, FaPhone, FaLock } from 'react-icons/fa';
import authApi from '../../api/authApi';

export default function StudentDetailsForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: '',
    email: '',
    birthday: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('signupEmail');
    if (!email) {
      navigate('/signup-student');
    } else {
      setFormData(prev => ({ ...prev, email }));
    }
  }, [navigate]);

  // Format ngày sinh chuẩn yyyy-MM-dd
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0]; // "2025-01-01"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 5) {
      setError('Mật khẩu phải có ít nhất 5 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await authApi.sendRegisterOtp(formData.email);

      const userData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.studentName,
        dob: formatDate(formData.birthday),
        phoneNumber: formData.phone,
        role: 'STUDENT'
      };

      console.log('userData gửi đi:', userData);

      navigate('/signup-student/verify', { state: { userData } });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Không thể gửi OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2ed] flex flex-col">
      {/* Header */}
      <div className="w-full bg-white py-6 px-8 flex justify-between items-center shadow-sm">
        <button
          onClick={() => navigate('/signup-student')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
        <button
          onClick={() => navigate('/')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Student Name */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Student Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaUser /></span>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Email
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <span className="pl-4 text-gray-500"><FaEnvelope /></span>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full p-4 border-0 bg-gray-50 rounded-lg"
                />
              </div>
            </div>

            {/* Birthday */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Birthday
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaBirthdayCake /></span>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaPhone /></span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                  placeholder="Enter 10-digit phone number"
                  minLength={10}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaLock /></span>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                  minLength={5}
                  placeholder="At least 5 characters"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Confirm Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaLock /></span>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                  minLength={5}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#03ccba] text-white py-4 rounded-lg hover:bg-[#02b5a5] text-lg font-medium mt-8 transition-colors duration-300 disabled:bg-gray-300"
            >
              {loading ? 'Đang gửi OTP...' : 'Tiếp tục'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-white py-6 px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <p className="text-gray-600">
              Need help? Call us on{' '}
              <a href="tel:+442037736020" className="text-[#03ccba] font-medium">
                +44 (0) 203 773 6020
              </a>
              {' '}or{' '}
              <a href="mailto:help@mytutor.co.uk" className="text-[#03ccba] font-medium">
                email us
              </a>
            </p>
          </div>
          <button 
            onClick={() => navigate('/login-role')}
            className="bg-[#ebded5] px-8 py-3 rounded-lg hover:bg-[#03ccba] hover:text-white transition-all duration-300 font-medium"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
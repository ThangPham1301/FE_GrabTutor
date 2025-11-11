import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaIdCard, FaPhone, FaGraduationCap, FaBook, FaUniversity, FaLock } from 'react-icons/fa';
import userApi from '../../api/userApi';

const DEGREES = [
  'Bachelor',
  'Master',
  'PhD',
  'Other'
];

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Literature',
  'History',
  'Geography'
];

export default function TutorDetailsForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    dob: '',
    phoneNumber: '',
    nationalId: '',
    university: '',
    highestAcademicDegree: '',
    major: '',
    role: 'TUTOR'
  });

  useEffect(() => {
    const email = localStorage.getItem('signupEmail');
    if (!email) {
      navigate('/signup-tutor');
    } else {
      setFormData(prev => ({ ...prev, email }));
    }
  }, [navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName.trim()) {
      setError('Vui lòng nhập tên');
      return;
    }
    if (!formData.dob) {
      setError('Vui lòng chọn ngày sinh');
      return;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      setError('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }
    if (!formData.password.trim() || formData.password.length < 5) {
      setError('Mật khẩu phải có ít nhất 5 ký tự');
      return;
    }
    if (!formData.university.trim()) {
      setError('Vui lòng nhập trường đại học');
      return;
    }
    if (!formData.highestAcademicDegree.trim()) {
      setError('Vui lòng chọn bằng cấp');
      return;
    }
    if (!formData.major.trim()) {
      setError('Vui lòng chọn chuyên ngành');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const tutorData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        dob: formatDate(formData.dob),
        phoneNumber: formData.phoneNumber,
        nationalId: formData.nationalId,
        university: formData.university,
        highestAcademicDegree: formData.highestAcademicDegree,
        major: formData.major,
        role: 'TUTOR'
      };

      console.log('tutorData gửi đi:', tutorData);
      
      // ✅ Gọi API đăng ký
      await userApi.addTutor(tutorData);

      localStorage.removeItem('signupEmail');
      
      // ✅ Hiển thị thông báo thành công
      alert('✅ Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.');
      
      // ✅ Chuyển hướng sang trang LOGIN (không phải login-role)
      // Lưu email vào localStorage để pre-fill form login
      localStorage.setItem('loginEmail', formData.email);
      
      setTimeout(() => {
        navigate('/login');
      }, 500);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Không thể đăng ký');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2ed] flex flex-col">
      {/* Header */}
      <div className="w-full bg-white py-6 px-8 flex justify-between items-center shadow-sm">
        <button
          onClick={() => navigate('/signup-tutor')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center transition-colors"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
        <button
          onClick={() => navigate('/')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center transition-colors"
        >
          ×
        </button>
      </div>

      {/* Main form */}
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Email (readonly) */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Email Address
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full p-4 border-0 bg-transparent rounded-lg outline-none disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                  minLength={5}
                  placeholder="Min 5 characters"
                />
              </div>
            </div>

            {/* National ID */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                National ID / Passport
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                />
              </div>
            </div>

            {/* Full Name */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Full Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Date of Birth
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* University */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                University
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                  placeholder="Enter your university"
                />
              </div>
            </div>

            {/* Major */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Major / Specialization
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <select
                  value={formData.major}
                  onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Literature">Literature</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                </select>
              </div>
            </div>

            {/* Degree */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Highest Academic Degree
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <select
                  value={formData.highestAcademicDegree}
                  onChange={(e) => setFormData(prev => ({ ...prev, highestAcademicDegree: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                >
                  <option value="">Select your degree</option>
                  <option value="Bachelor">Bachelor</option>
                  <option value="Master">Master</option>
                  <option value="PhD">PhD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#03ccba] text-white py-4 rounded-lg hover:bg-[#02b5a5] text-lg font-medium transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                  Signing up...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-white py-6 px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
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
            onClick={() => navigate('/login')}
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-medium"
          >
            Already have an account? Log In
          </button>
        </div>
      </div>
    </div>
  );
}

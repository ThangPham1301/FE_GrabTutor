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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await userApi.addTutor(formData);
      
      localStorage.removeItem('signupEmail');
      alert('Đăng ký thành công! Vui lòng chờ admin phê duyệt.');
      navigate('/login-tutor');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại');
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
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          &larr;
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Complete Your Profile</h1>
        <button
          onClick={() => navigate('/')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Main form */}
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Email (readonly) */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Email Address
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                <span className="pl-4 text-gray-500"><FaEnvelope /></span>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full p-4 border-0 bg-gray-50 rounded-lg"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Password
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <span className="pl-4 text-gray-500"><FaLock /></span>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full p-4 border-0 rounded-lg"
                  required
                  minLength={5}
                />
              </div>
            </div>

            {/* National ID Field */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                National ID
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaIdCard /></span>
                <input
                  type="text"
                  value={formData.nationalId}
                  onChange={(e) => setFormData(prev => ({ ...prev, nationalId: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Tutor Name Field */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Tutor Name
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaUser /></span>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Phone Number
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaPhone /></span>
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

            {/* University Field */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                University
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaUniversity /></span>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData(prev => ({ ...prev, university: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Major Field */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Major
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaBook /></span>
                <select
                  value={formData.major}
                  onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                >
                  <option value="">Select a subject</option>
                  {SUBJECTS.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Degree Field */}
            <div className="relative">
              <label className="absolute -top-2.5 left-2 bg-white px-2 text-sm font-medium text-gray-600">
                Degree
              </label>
              <div className="flex items-center border border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-1 focus-within:ring-[#03ccba]">
                <span className="pl-4 text-gray-500"><FaGraduationCap /></span>
                <select
                  value={formData.highestAcademicDegree}
                  onChange={(e) => setFormData(prev => ({ ...prev, highestAcademicDegree: e.target.value }))}
                  className="w-full p-4 border-0 focus:ring-0 rounded-lg"
                  required
                >
                  <option value="">Select your degree</option>
                  {DEGREES.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#03ccba] text-white py-4 rounded-lg hover:bg-[#02b5a5] text-lg font-medium transition-colors duration-300 disabled:bg-gray-300"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
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
            <p className="text-gray-600">
              Help! I'm an{' '}
              <button className="text-[#03ccba] font-medium">
                adult learner
              </button>
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

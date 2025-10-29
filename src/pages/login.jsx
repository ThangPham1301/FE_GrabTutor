import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../components/Navbar';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'USER'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (loginSuccess && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'TUTOR') {
        navigate('/profile');
      } else if (user.role === 'USER') {
        navigate('/');
      }
    }
  }, [loginSuccess, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      
      // Validation
      if (!formData.email.trim()) {
        setError('Please enter your email or username');
        setLoading(false);
        return;
      }
      if (!formData.password.trim()) {
        setError('Please enter your password');
        setLoading(false);
        return;
      }

      // ✅ Validate email format - nhưng cho phép "admin"
      const emailInput = formData.email.trim().toLowerCase();
      if (emailInput !== 'admin') {
        // Chỉ validate email format nếu không phải "admin"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput)) {
          setError('Please enter a valid email address');
          setLoading(false);
          return;
        }
      }

      console.log('=== Login START ===');
      console.log('Email:', formData.email);
      
      await login(formData);
      setLoginSuccess(true);
    } catch (err) {
      console.error('=== Login ERROR ===');
      console.error('Error:', err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Side - Benefits */}
            <div className="hidden lg:flex flex-col justify-center space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                  Welcome Back!
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Sign in to access your personalized learning experience and connect with expert tutors.
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FaCheckCircle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Access Your Courses</p>
                    <p className="text-gray-600 text-sm">Continue learning where you left off</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FaCheckCircle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Book Expert Tutors</p>
                    <p className="text-gray-600 text-sm">Find and schedule lessons with qualified professionals</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FaCheckCircle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Message Your Tutors</p>
                    <p className="text-gray-600 text-sm">Get real-time support and guidance</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FaCheckCircle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Track Your Progress</p>
                    <p className="text-gray-600 text-sm">Monitor your learning journey</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <FaCheckCircle className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Connect with Community</p>
                    <p className="text-gray-600 text-sm">Join thousands of learners worldwide</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-200">
                <div>
                  <p className="text-3xl font-bold text-[#03ccba]">50K+</p>
                  <p className="text-gray-600 text-sm">Active Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#03ccba]">1K+</p>
                  <p className="text-gray-600 text-sm">Expert Tutors</p>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full mb-6 shadow-lg">
                  <FaLock className="text-white text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                <p className="text-gray-600">Enter your credentials to access your account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-pulse">
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address or Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="text"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setError(null);
                      }}
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-50 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-base font-medium"
                      placeholder="name@example.com or admin"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Admin tip: Use "admin" as username to login as administrator
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" size={18} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setError(null);
                      }}
                      disabled={loading}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-50 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-base font-medium"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-[#03ccba]"
                    />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[#03ccba] hover:text-[#02b5a5] font-semibold transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-8"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <FaArrowRight />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-sm text-gray-500">Don't have an account?</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Sign Up Link */}
              <button
                onClick={() => navigate('/signup-role')}
                className="w-full border-2 border-[#03ccba] text-[#03ccba] font-bold py-3 rounded-lg hover:bg-[#03ccba] hover:text-white transition-all duration-300"
              >
                Create Account
              </button>

              {/* Security Info */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
                <p>
                  ✓ Secure login with SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

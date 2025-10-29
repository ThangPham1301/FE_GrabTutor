import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaLock, FaArrowLeft, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import authApi from '../api/authApi';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  // ✅ Kiểm tra user đã đăng nhập chưa
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Please Sign In</h2>
            <p className="text-gray-600 mb-8 text-lg">You need to sign in to change your password</p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.oldPassword.trim()) {
      setError('Please enter your current password');
      return false;
    }
    if (!formData.newPassword.trim()) {
      setError('Please enter your new password');
      return false;
    }
    if (formData.newPassword.length < 5) {
      setError('New password must be at least 5 characters');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Password confirmation does not match');
      return false;
    }
    if (formData.oldPassword === formData.newPassword) {
      setError('New password cannot be the same as current password');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('=== changePassword START ===');
      console.log('Changing password for user:', user.email);

      const payload = {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      };

      await authApi.changePassword(payload);

      console.log('=== changePassword SUCCESS ===');
      setSuccess('Password changed successfully! Please sign in again.');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // ✅ Logout sau 2 giây
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('=== changePassword ERROR ===');
      console.error('Error:', err.message);
      console.error('Response:', err.response?.data);
      
      setError(
        err.response?.data?.message || 
        'Failed to change password. Please check your current password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Info */}
            <div className="hidden lg:flex flex-col justify-center space-y-8">
              <div>
                <h1 className="text-5xl font-bold text-gray-900 mb-4">
                  Update Your Password
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  Keep your account secure by regularly updating your password to a strong, unique combination.
                </p>
              </div>

              {/* Security Tips */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Security Tips:</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Use strong passwords</p>
                      <p className="text-gray-600 text-sm">Mix uppercase, lowercase, numbers and symbols</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">At least 5 characters</p>
                      <p className="text-gray-600 text-sm">Longer passwords are more secure</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Don't reuse old passwords</p>
                      <p className="text-gray-600 text-sm">Always use a new, unique password</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-[#03ccba] font-semibold hover:text-[#02b5a5] transition-colors text-lg mt-8"
              >
                <FaArrowLeft /> Back to Profile
              </button>
            </div>

            {/* Right Side - Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full mb-6 shadow-lg">
                  <FaShieldAlt className="text-white text-3xl" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Change Password</h2>
                <p className="text-gray-600">Secure your account with a new password</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-pulse">
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-pulse">
                  <p className="text-green-700 font-medium text-sm">{success}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type={showPasswords.oldPassword ? 'text' : 'password'}
                      value={formData.oldPassword}
                      onChange={(e) => handleChange('oldPassword', e.target.value)}
                      disabled={loading}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-50 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-base"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('oldPassword')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.oldPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type={showPasswords.newPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleChange('newPassword', e.target.value)}
                      disabled={loading}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-50 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-base"
                      placeholder="Enter new password (min. 5 characters)"
                      required
                      minLength={5}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('newPassword')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type={showPasswords.confirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      disabled={loading}
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-50 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-base"
                      placeholder="Confirm new password"
                      required
                      minLength={5}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('confirmPassword')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    disabled={loading}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <div className="px-4 text-gray-500 text-sm font-medium">or</div>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Additional Actions */}
              <button
                onClick={() => navigate('/profile')}
                className="w-full py-3 text-[#03ccba] font-semibold hover:text-[#02b5a5] flex items-center justify-center gap-2 transition-colors"
              >
                <FaArrowLeft /> Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
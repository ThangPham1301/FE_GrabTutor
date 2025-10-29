import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import authApi from '../../api/authApi';

export default function ForgotPasswordEmailForm() {
  const [step, setStep] = useState('email'); // 'email', 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const navigate = useNavigate();

  // Bước 1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      console.log('Sending forgot password OTP to:', email);
      await authApi.sendForgotPasswordOtp(email);

      setSuccessMessage('OTP sent successfully! Check your email.');
      setStep('email'); // Stay on same step but show OTP field
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(
        err.response?.data?.message || 
        'Unable to send OTP. Please check your email.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    if (otp.length < 6) {
      setError('OTP must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('=== Verifying OTP ===');
      console.log('Email:', email);
      console.log('OTP:', otp);

      await authApi.verifyOtp(email, otp);

      console.log('OTP verified successfully!');
      setSuccessMessage('Code verified! Now set your new password.');
      setStep('reset');
      setOtp('');
      setError(null);
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(
        err.message || 
        'Invalid or expired OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Bước 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!formData.newPassword.trim()) {
      setError('Please enter new password');
      return;
    }

    if (formData.newPassword.length < 5) {
      setError('Password must be at least 5 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('=== Resetting Password ===');
      console.log('Email:', email);

      const resetData = {
        email: email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      };

      await authApi.changeForgotPassword(resetData);

      console.log('Password reset successfully!');
      setSuccessMessage('Password reset successful! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await authApi.sendForgotPasswordOtp(email);
      setSuccessMessage('OTP sent again! Check your email.');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2ed] flex flex-col">
      {/* Header */}
      <div className="w-full bg-white py-6 px-8 flex justify-between items-center shadow-sm">
        <button
          onClick={() => navigate('/login')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Forgot Password</h1>
        <button
          onClick={() => navigate('/')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Info */}
            <div className="hidden lg:flex flex-col justify-center space-y-8">
              <div>
                <h2 className="text-5xl font-bold text-gray-900 mb-4">
                  Reset Your Password
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                  {step === 'email' && !successMessage 
                    ? 'Enter your email address to get started.'
                    : step === 'email' && successMessage
                    ? 'Enter the code sent to your email.'
                    : 'Create a strong new password for your account.'}
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step === 'email' ? 'Quick Recovery:' : 'Password Tips:'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaCheckCircle className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {step === 'email' ? 'Fast & Secure' : 'Use strong passwords'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {step === 'email' 
                          ? 'Verify your email instantly' 
                          : 'Mix uppercase, lowercase, numbers and symbols'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaCheckCircle className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {step === 'email' ? 'One-Time Code' : 'At least 5 characters'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {step === 'email' 
                          ? 'Expires in 10 minutes' 
                          : 'Longer passwords are more secure'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#03ccba] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaCheckCircle className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {step === 'email' ? 'No Hassle' : 'Never reuse old passwords'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {step === 'email' 
                          ? 'Back to your account in seconds' 
                          : 'Always use a new, unique password'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
              {/* Step 1: Email + OTP */}
              {step === 'email' && (
                <>
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full mb-6 shadow-lg">
                      <FaEnvelope className="text-white text-3xl" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {successMessage ? 'Verify Code' : 'Reset Password'}
                    </h3>
                    <p className="text-gray-600">
                      {successMessage 
                        ? `Enter the code sent to ${email}` 
                        : 'Enter your email to get started'}
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                      <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg">
                      <p className="text-green-700 font-medium text-sm">{successMessage}</p>
                    </div>
                  )}

                  <form onSubmit={successMessage ? handleVerifyOtp : handleSendOtp} className="space-y-5">
                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" size={18} />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError(null);
                          }}
                          disabled={successMessage || loading}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-50 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-base font-medium"
                          placeholder="Email"
                          required
                        />
                      </div>
                    </div>

                    {/* OTP Field - Show when OTP sent */}
                    {successMessage && (
                      <div className="animate-slideDown">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          6-Digit Code
                        </label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            if (val.length <= 6) {
                              setOtp(val);
                              setError(null);
                            }
                          }}
                          className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-50 outline-none transition-all uppercase text-base font-medium"
                          placeholder="000000"
                          maxLength="6"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          {otp.length}/6 characters
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading || (successMessage && otp.length < 6)}
                      className="w-full py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-6"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          {successMessage ? 'Verifying...' : 'Sending...'}
                        </>
                      ) : (
                        successMessage ? 'Verify Code' : 'Send Code'
                      )}
                    </button>
                  </form>

                  {/* Resend OTP Link */}
                  {successMessage && (
                    <div className="mt-6 text-center space-y-2">
                      <p className="text-gray-600 text-sm">Didn't receive the code?</p>
                      <button
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-[#03ccba] font-semibold hover:text-[#02b5a5] transition-colors disabled:text-gray-400"
                      >
                        Resend Code
                      </button>
                    </div>
                  )}

                  {/* Change Email Link */}
                  {successMessage && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => {
                          setSuccessMessage(null);
                          setError(null);
                          setOtp('');
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Use different email
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Step 2: Reset Password */}
              {step === 'reset' && (
                <>
                  <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full mb-6 shadow-lg">
                      <FaLock className="text-white text-3xl" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">New Password</h3>
                    <p className="text-gray-600">Create a strong new password for your account</p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                      <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg">
                      <p className="text-green-700 font-medium text-sm">{successMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-5">
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
                          type={showPassword.newPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, newPassword: e.target.value }));
                            setError(null);
                          }}
                          disabled={loading}
                          className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-50 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-base"
                          placeholder="Enter new password (min. 5 characters)"
                          required
                          minLength={5}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400" />
                        </div>
                        <input
                          type={showPassword.confirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => {
                            setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                            setError(null);
                          }}
                          disabled={loading}
                          className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-50 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-base"
                          placeholder="Confirm your new password"
                          required
                          minLength={5}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-6"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </form>
                </>
              )}

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-gray-300"></div>
                <div className="px-4 text-gray-500 text-sm font-medium">or</div>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Back to Login */}
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-white py-6 px-8 mt-8">
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
            onClick={() => navigate('/login')}
            className="bg-[#ebded5] px-8 py-3 rounded-lg hover:bg-[#03ccba] hover:text-white transition-all duration-300 font-medium"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* CSS for slide animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
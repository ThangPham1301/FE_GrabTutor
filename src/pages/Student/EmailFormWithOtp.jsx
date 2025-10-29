import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studentIcon from '../../assets/student.png';
import authApi from '../../api/authApi';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';

export default function EmailFormWithOtp() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

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

      console.log('Sending OTP to email:', email);
      await authApi.sendRegisterOtp(email);

      setSuccessMessage('Verification code has been sent to your email');
      setShowOtpInput(true);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(
        err.response?.data?.message || 
        'Unable to send verification code. Email may not exist or already registered.'
      );
      setShowOtpInput(false);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }

    // OTP must be exactly 6 characters
    if (otp.trim().length !== 6) {
      setError('Verification code must be exactly 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('=== handleVerifyOtp DEBUG ===');
      console.log('Email:', email);
      console.log('OTP from input:', otp);
      console.log('OTP after trim:', otp.trim());
      console.log('OTP type:', typeof otp.trim());
      console.log('OTP length:', otp.trim().length);
      
      // Send OTP as string, without uppercase conversion
      await authApi.verifyOtp(email, otp.trim());

      setSuccessMessage('Email verified successfully! Redirecting to complete your profile...');
      localStorage.setItem('signupEmail', email);
      
      setTimeout(() => {
        navigate('/signup-student/details');
      }, 1000);
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      console.log('Resending OTP to email:', email);
      await authApi.sendRegisterOtp(email);

      setSuccessMessage('A new verification code has been sent! Please check your email');
      setOtp('');
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Unable to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2ed] flex flex-col">
      {/* Header */}
      <div className="w-full bg-white py-6 px-8 flex justify-between items-center shadow-sm">
        <button
          onClick={() => {
            navigate('/signup-role');
            setShowOtpInput(false);
            setOtp('');
            setEmail('');
            setError(null);
          }}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center transition-colors"
          title="Go back"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Student Sign Up</h1>
        <button
          onClick={() => navigate('/')}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center transition-colors"
          title="Close"
        >
          ×
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-4xl w-full flex flex-col md:flex-row gap-12">
          {/* Left side */}
          <div className="md:w-1/2 flex flex-col items-center justify-center">
            <img 
              src={studentIcon}
              alt="Student" 
              className="w-48 h-48 object-contain mb-6"
            />
            <h2 className="text-2xl font-bold mb-3">Join as a Student</h2>
            <p className="text-gray-600 text-center text-lg">
              Start your learning journey with expert tutors
            </p>
          </div>

          {/* Right side */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-8">
              {showOtpInput ? 'Verify Your Email' : 'Enter Your Email Address'}
            </h3>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Success message */}
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded">
                <p className="text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            {!showOtpInput ? (
              // Email form
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Email Address *
                  </label>
                  <div className="flex items-center border-2 border-gray-300 rounded-lg focus-within:border-[#03ccba] focus-within:ring-2 focus-within:ring-[#03ccba] focus-within:ring-opacity-50 transition-all">
                    <FaEnvelope className="ml-4 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      placeholder="example@email.com"
                      className="w-full p-4 border-0 focus:ring-0 rounded-lg outline-none text-lg"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">We'll send a verification code to this email</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#03ccba] text-white py-4 rounded-lg hover:bg-[#02b5a5] text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Sending Verification Code...
                    </span>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            ) : (
              // OTP verification form
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    A 6-character verification code has been sent to <strong>{email}</strong>
                  </p>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Verification Code *
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      // Only allow alphanumeric characters
                      const val = e.target.value.toUpperCase();
                      if (val.length <= 6) {
                        setOtp(val);
                      }
                    }}
                    placeholder="ENTER CODE"
                    className="w-full px-4 py-4 text-center text-2xl tracking-widest font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent outline-none uppercase transition-all"
                    required
                    maxLength="6"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {otp.length}/6 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.trim().length !== 6}
                  className="w-full bg-[#03ccba] text-white py-4 rounded-lg hover:bg-[#02b5a5] text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Email'
                  )}
                </button>

                <div className="text-center py-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm mb-3">Didn't receive the code?</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#03ccba] font-semibold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Resend Verification Code
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowOtpInput(false);
                    setOtp('');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-semibold transition-colors"
                >
                  Use a Different Email
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-white py-6 px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-gray-600">
              Need help? Contact us at{' '}
              <a href="mailto:support@grabgiasu.com" className="text-[#03ccba] font-semibold hover:underline">
                support@grabgiasu.com
              </a>
            </p>
          </div>

          <button
            onClick={() => navigate('/login-role')}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-[#03ccba] hover:text-white transition-all duration-300 font-semibold"
          >
            Already have an account? Log In
          </button>
        </div>
      </div>
    </div>
  );
}
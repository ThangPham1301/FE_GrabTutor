import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import authApi from '../../api/authApi';

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = location.state || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Verify OTP
      await authApi.verifyOtp({
        email: userData.email,
        otp: otp,
        type: 'REGISTER'
      });

      // Register user after OTP verification
      const response = await authApi.register(userData);

      if (response.success) {
        localStorage.removeItem('signupEmail');
        alert('Đăng ký thành công!');
        navigate('/login-student');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      setError(null);
      await authApi.sendRegisterOtp(userData.email);
      alert('Mã OTP mới đã được gửi!');
    } catch (err) {
      setError('Không thể gửi lại mã OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    navigate('/signup-student');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f7f2ed] flex flex-col">
      {/* Header */}
      <div className="w-full bg-white py-6 px-8 flex justify-between items-center shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Xác thực Email</h1>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <FaEnvelope className="text-2xl text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Nhập mã OTP</h2>
            <p className="text-gray-600">
              Chúng tôi đã gửi mã xác thực đến email{' '}
              <span className="font-medium">{userData.email}</span>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Nhập mã OTP"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border rounded-lg focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                required
                maxLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#03ccba] text-white py-3 rounded-lg font-medium hover:bg-[#02b5a5] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">Không nhận được mã?</p>
            <button
              onClick={handleResendOtp}
              disabled={loading}
              className="text-[#03ccba] font-medium hover:underline mt-1"
            >
              Gửi lại mã OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
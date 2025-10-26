import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import tutorIcon from '../assets/tutor.png';

export default function LoginTutor() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'TUTOR'
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);
      
      const response = await login(formData);

      console.log('Login successful:', response);
      navigate('/tutor/profile');
    } catch (err) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#faf4ef] min-h-screen flex flex-col">
      {/* Header with back and close buttons */}
      <div className="w-full bg-white py-6 px-8 flex justify-between items-center shadow-sm">
        <button
          onClick={() => navigate("/login-role")}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          &larr;
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Tutor Log in</h1>
        <button
          onClick={() => navigate("/")}
          className="text-3xl text-gray-600 hover:text-gray-800 w-10 h-10 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex justify-center items-center px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row max-w-4xl w-full">
          {/* Left side - Tutor info */}
          <div className="md:w-1/2 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
            <img
              src={tutorIcon}
              alt="Tutor"
              className="w-48 h-48 object-contain mb-6"
            />
            <h2 className="text-xl font-bold text-gray-800 mb-3">Tutor Portal</h2>
            <p className="text-gray-600 text-center">
              Give lessons and manage your teaching schedule
            </p>
          </div>

          {/* Right side - Login form */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#03ccba] focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#03ccba] text-white py-3 rounded-lg font-medium hover:bg-[#02b5a5] transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
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
            onClick={() => navigate('/signup-tutor')}
            className="bg-[#ebded5] px-8 py-3 rounded-lg hover:bg-[#03ccba] hover:text-white transition-all duration-300 font-medium"
          >
            Sign up as Tutor
          </button>
        </div>
      </div>
    </div>
  );
}

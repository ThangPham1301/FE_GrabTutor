import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FaHome, FaPlus, FaUser, FaKey, FaCoins, FaSignOutAlt, FaBars, FaTimes, FaFolderOpen, FaBook, FaChalkboard, FaStar, FaChartLine, FaWallet, FaHandshake, FaComments } from 'react-icons/fa';
import PostBidsDropdown from './PostBidsDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const getAvatarInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  const getAvatarColor = () => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-red-500', 'bg-indigo-500'];
    const charCode = user?.email?.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  const handleNavigation = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'USER') {
      navigate('/posts');
    } else {
      alert('⚠️ Only STUDENT can ask questions!');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="text-3xl font-bold text-[#03ccba]">MyTutor</div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
            >
              <FaHome size={18} />
              Home
            </button>

            {/* Browse Posts */}
            <button
              onClick={() => navigate('/posts')}
              className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
            >
              <FaBook size={18} />
              Browse Posts
            </button>

            {/* Browse Courses - Public Access */}
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
            >
              <FaBook size={18} />
              Browse Courses
            </button>

            {/* Ask Question + Recharge - ONLY FOR USER (STUDENT) */}
            {user && user.role === 'USER' && (
              <>
                <button
                  onClick={handleNavigation}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  <FaPlus size={16} />
                  Ask Question
                </button>

                <button
                  onClick={() => navigate('/wallet/recharge')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  <FaWallet size={16} /> Recharge
                </button>

                <button
                  onClick={() => navigate('/courses/my-enrolled')}
                  className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
                >
                  <FaBook size={18} />
                  My Learning
                </button>
              </>
            )}

            {user ? (
              <>
                {/* ✅ TUTOR - Desktop Menu */}
                {user.role === 'TUTOR' && (
                  <>
                    {/* My Bids */}
                    <button
                      onClick={() => navigate('/posts/my-bids')}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
                    >
                      <FaHandshake size={18} />
                      My Bids
                    </button>

                    {/* My Courses Inventory */}
                    <button
                      onClick={() => navigate('/courses/inventory')}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                    >
                      <FaBook size={16} />
                      My Courses
                    </button>
                    
                    {/* New - Create Course Button */}
                    <button
                      onClick={() => navigate('/courses/create')}
                      className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#03ccba] text-[#03ccba] rounded-lg hover:bg-[#03ccba] hover:text-white transition-all font-semibold"
                    >
                      <FaPlus size={16} />
                      New Course
                    </button>
                  </>
                )}

                {/* ✅ STUDENT (USER) - Desktop Menu */}
                {user.role === 'USER' && (
                  <>
                    {/* ✅ NEW - Posts & Bids Dropdown */}
                    <PostBidsDropdown />

                    <button
                      onClick={() => navigate('/posts/inventory')}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
                    >
                      <FaFolderOpen size={18} />
                      My Posts
                    </button>

                    {/* ✅ Chat Button */}
                    <button
                      onClick={() => navigate('/chat')}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                      title="Messages"
                    >
                      <FaComments size={18} />
                      <span className="hidden sm:inline">Chat</span>
                    </button>
                  </>
                )}

                {/* ✅ ADMIN - Desktop Menu */}
                {user.role === 'ADMIN' && (
                  <>
                    <button
                      onClick={() => navigate('/admin/dashboard')}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
                    >
                      <FaChartLine size={18} />
                      Dashboard
                    </button>

                    <button
                      onClick={() => navigate('/admin/users')}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
                    >
                      <FaUser size={18} />
                      Users
                    </button>

                    <button
                      onClick={() => navigate('/admin/tutors')}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
                    >
                      <FaChalkboard size={18} />
                      Tutors
                    </button>

                    <button
                      onClick={() => navigate('/admin/subjects')}
                      className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
                    >
                      <FaBook size={18} />
                      Subjects
                    </button>
                  </>
                )}

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-10 h-10 rounded-full font-bold text-white flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg ${getAvatarColor()}`}
                    title={user.fullName || user.email}
                  >
                    {getAvatarInitials()}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setIsDropdownOpen(false)}
                      ></div>
                      
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                        {/* User Info Header */}
                        <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full font-bold text-white flex items-center justify-center ${getAvatarColor()}`}>
                              {getAvatarInitials()}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm">{user.fullName || user.email}</p>
                              <p className="text-xs text-teal-100">{user.email}</p>
                              <p className="text-xs text-teal-100 font-semibold mt-1">{user.role}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <button
                            onClick={() => {
                              navigate('/profile');
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          >
                            <FaUser className="text-[#03ccba]" size={18} />
                            <div>
                              <p className="font-semibold text-sm">Profile</p>
                              <p className="text-xs text-gray-500">View & edit profile</p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              navigate('/change-password');
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          >
                            <FaKey className="text-[#03ccba]" size={18} />
                            <div>
                              <p className="font-semibold text-sm">Change Password</p>
                              <p className="text-xs text-gray-500">Update your password</p>
                            </div>
                          </button>

                          <div className="border-t border-gray-200 my-2"></div>

                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors text-left font-semibold"
                          >
                            <FaSignOutAlt size={18} />
                            <div>
                              <p className="font-semibold text-sm">Logout</p>
                              <p className="text-xs text-gray-500">Sign out from account</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-2 text-[#03ccba] font-bold hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup-role')}
                  className="px-6 py-2 bg-[#03ccba] text-white font-bold rounded-lg hover:bg-[#02b5a5] transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            {user && (
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-10 h-10 rounded-full font-bold text-white flex items-center justify-center ${getAvatarColor()}`}
              >
                {getAvatarInitials()}
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <button
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              Home
            </button>

            <button
              onClick={() => {
                navigate('/posts');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              Browse Posts
            </button>

            {/* Browse Courses - Public Access */}
            <button
              onClick={() => navigate('/courses')}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              Browse Courses
            </button>

            {user && user.role === 'USER' && (
              <>
                <button
                  onClick={() => {
                    handleNavigation();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-[#03ccba] font-bold"
                >
                  + Ask Question
                </button>

                <button
                  onClick={() => {
                    navigate('/wallet/recharge');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-[#03ccba] font-bold"
                >
                  💳 Recharge
                </button>

                <button
                  onClick={() => navigate('/courses/my-enrolled')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                >
                  My Learning
                </button>
              </>
            )}

            {user ? (
              <>
                {/* ✅ TUTOR Mobile Menu */}
                {user.role === 'TUTOR' && (
                  <>
                    <button
                      onClick={() => {
                        navigate('/posts/my-bids');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                    >
                      My Bids
                    </button>

                    <button
                      onClick={() => {
                        navigate('/courses/inventory');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                    >
                      My Courses
                    </button>
                  </>
                )}

                {/* ✅ STUDENT Mobile Menu */}
                {user.role === 'USER' && (
                  <>
                    <button
                      onClick={() => navigate('/posts/inventory')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                    >
                      My Posts
                    </button>
                  </>
                )}

                {/* ✅ ADMIN Mobile Menu */}
                {user.role === 'ADMIN' && (
                  <>
                    <button
                      onClick={() => {
                        navigate('/admin/dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                    >
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        navigate('/admin/users');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                    >
                      Users
                    </button>

                    <button
                      onClick={() => {
                        navigate('/admin/tutors');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                    >
                      Tutors
                    </button>

                    <button
                      onClick={() => {
                        navigate('/admin/subjects');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                    >
                      Subjects
                    </button>
                  </>
                )}

                <div className="border-t border-gray-200 my-2"></div>

                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                >
                  Profile
                </button>

                <button
                  onClick={() => {
                    navigate('/change-password');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                >
                  Change Password
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 font-bold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    navigate('/signup-role');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 bg-[#03ccba] text-white rounded"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        )}

        {isDropdownOpen && (
          <div
            className="fixed inset-0"
            onClick={() => setIsDropdownOpen(false)}
          ></div>
        )}
      </div>
    </nav>
  );
}

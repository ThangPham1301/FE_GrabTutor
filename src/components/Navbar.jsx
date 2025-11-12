import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  FaHome, FaPlus, FaUser, FaKey, FaCoins, FaSignOutAlt, FaBars, FaTimes, 
  FaFolderOpen, FaBook, FaChalkboard, FaStar, FaChartLine, FaWallet, 
  FaHandshake, FaComments, FaChevronDown, FaBox
} from 'react-icons/fa';
import PostBidsDropdown from './PostBidsDropdown';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login-role');
  };

  const handleNavigation = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'USER') {
      navigate('/posts');
    } else {
      alert('⚠️ Chỉ có STUDENT mới có thể đặt câu hỏi!');
    }
  };

  const getAvatarColor = () => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-red-500',
      'bg-green-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-cyan-500'
    ];
    return colors[Math.abs(user?.id?.charCodeAt(0) || 0) % colors.length];
  };

  const getAvatarInitials = () => {
    if (user?.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-[#03ccba]">
            🎓 GrabTutor
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Home */}
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

            {/* Browse Courses */}
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
            >
              <FaBook size={18} />
              Browse Courses
            </button>
   {/* ✅ THÊM COMPONENT NÀY - Bids Dropdown (STUDENT ONLY) */}
            {user && user.role === 'USER' && (
              <PostBidsDropdown />
            )}
            {/* STUDENT ONLY - Inventory Dropdown */}
            {user && user.role === 'USER' && (
              <div className="relative group">
                <button
                  className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
                >
                  <FaBox size={18} />
                  Inventory
                  <FaChevronDown size={12} />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                  {/* Ask Question */}
                  <button
                    onClick={() => {
                      navigate('/posts');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 transition-colors"
                  >
                    <FaPlus size={16} className="text-[#03ccba]" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Ask Question</p>
                      <p className="text-xs text-gray-600">Post your homework questions</p>
                    </div>
                  </button>

                  {/* My Posts */}
                  <button
                    onClick={() => {
                      navigate('/posts/inventory');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <FaFolderOpen size={16} className="text-blue-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">My Posts</p>
                      <p className="text-xs text-gray-600">View your questions</p>
                    </div>
                  </button>

                  {/* My Learning */}
                  <button
                    onClick={() => {
                      navigate('/courses/my-enrolled');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <FaBook size={16} className="text-green-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">My Learning</p>
                      <p className="text-xs text-gray-600">Track your courses</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Chat */}
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium"
            >
              <FaComments size={18} />
              Chat
            </button>

            {/* User Menu */}
            {user ? (
              <>
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
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          {/* Profile */}
                          <button
                            onClick={() => {
                              if (user.role === 'TUTOR') {
                                navigate('/profile');
                              } else {
                                navigate('/student-profile');
                              }
                              setIsDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          >
                            <FaUser className="text-[#03ccba]" size={18} />
                            <div>
                              <p className="font-semibold text-sm">My Profile</p>
                              <p className="text-xs text-gray-500">View your profile</p>
                            </div>
                          </button>

                          {/* ✅ RECHARGE - Now in Dropdown (STUDENT ONLY) */}
                          {user.role === 'USER' && (
                            <button
                              onClick={() => {
                                navigate('/wallet/recharge');
                                setIsDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-amber-50 transition-colors text-left border-y border-gray-100"
                            >
                              <FaWallet className="text-amber-600" size={18} />
                              <div>
                                <p className="font-semibold text-sm">💳 Recharge Wallet</p>
                                <p className="text-xs text-gray-500">Add money to account</p>
                              </div>
                            </button>
                          )}

                          {/* Change Password */}
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

                          {/* Logout */}
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors text-left font-semibold"
                          >
                            <FaSignOutAlt size={18} />
                            <div>
                              <p className="font-semibold text-sm">Logout</p>
                              <p className="text-xs text-red-500">Sign out from account</p>
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
              className="text-gray-700 hover:text-[#03ccba]"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4">
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

            <button
              onClick={() => {
                navigate('/courses');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              Browse Courses
            </button>

            {/* Mobile Inventory */}
            {user && user.role === 'USER' && (
              <>
                <button
                  onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium flex items-center justify-between"
                >
                  📦 Inventory
                  <FaChevronDown size={12} className={`transform transition-transform ${isInventoryOpen ? 'rotate-180' : ''}`} />
                </button>

                {isInventoryOpen && (
                  <>
                    <button
                      onClick={() => {
                        navigate('/posts');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-8 py-2 text-sm text-gray-600 hover:text-[#03ccba] transition-colors"
                    >
                      + Ask Question
                    </button>
                    <button
                      onClick={() => {
                        navigate('/posts/inventory');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-8 py-2 text-sm text-gray-600 hover:text-[#03ccba] transition-colors"
                    >
                      My Posts
                    </button>
                    <button
                      onClick={() => {
                        navigate('/courses/my-enrolled');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-8 py-2 text-sm text-gray-600 hover:text-[#03ccba] transition-colors"
                    >
                      My Learning
                    </button>
                  </>
                )}
              </>
            )}

            <button
              onClick={() => {
                navigate('/chat');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              Chat
            </button>

            {user && user.role === 'USER' && (
              <button
                onClick={() => {
                  navigate('/wallet/recharge');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-[#03ccba] font-bold"
              >
                💳 Recharge
              </button>
            )}

            {user && (
              <>
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
            )}

            {!user && (
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
      </div>
    </nav>
  );
}

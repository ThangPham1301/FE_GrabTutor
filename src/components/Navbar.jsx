import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  FaHome,
  FaPlus, 
  FaUser, 
  FaKey, 
  FaCoins, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaFolderOpen, 
  FaBook, 
  FaChalkboard, 
  FaStar, 
  FaChartLine, 
  FaWallet, 
  FaHandshake, 
  FaComments, 
  FaChevronDown, 
  FaBox, 
  FaChartBar, 
  FaFlag,
} from 'react-icons/fa';

import NotificationBell from './NotificationBell';
import MyReportsDropdown from './MyReportsDropdown';
import postApi from '../api/postApi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balance, setBalance] = useState(null);

  // ✅ NEW - Add state for unaccepted bids count
  const [unacceptedBidsCount, setUnacceptedBidsCount] = useState(0);

  // ==================== HELPERS ====================

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  // ✅ NEW - Load bids count on mount
  useEffect(() => {
    if (user && user.role === 'USER') {
      fetchUnacceptedBidsCount();
    }
  }, [user]);

  // ✅ NEW - Fetch unaccepted bids count
  const fetchUnacceptedBidsCount = async () => {
    try {
      const response = await postApi.getMyPosts(0, 100);
      
      let posts = [];
      if (response.data?.items) {
        posts = response.data.items;
      } else if (Array.isArray(response.data)) {
        posts = response.data;
      }

      let unacceptedCount = 0;
      for (const post of posts) {
        const bidsResponse = await postApi.getTutorBidsForPost(post.id);
        let bids = [];
        
        if (bidsResponse.data && Array.isArray(bidsResponse.data)) {
          bids = bidsResponse.data;
        } else if (bidsResponse.data?.items) {
          bids = bidsResponse.data.items;
        }

        unacceptedCount += bids.filter(b => b.status !== 'ACCEPTED').length;
      }

      setUnacceptedBidsCount(unacceptedCount);
    } catch (error) {
      console.error('Error fetching unaccepted bids count:', error);
      setUnacceptedBidsCount(0);
    }
  };

  // ==================== ADMIN NAVBAR ====================
  if (user && user.role === 'ADMIN') {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-2xl text-[#03ccba]">
              🎓 GrabTutor Admin
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              
              {/* Dashboard Button */}
              <button
                onClick={() => navigate('/admin/dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  location.pathname === '/admin/dashboard'
                    ? 'bg-[#03ccba] text-white shadow-md'
                    : 'text-gray-700 hover:text-[#03ccba] hover:bg-gray-50'
                }`}
              >
                <FaHome size={18} />
                Dashboard
              </button>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isDropdownOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full font-bold text-white flex items-center justify-center ${getAvatarColor()}`}>
                    {getAvatarInitials()}
                  </div>
                  <FaChevronDown size={12} className="text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    
                    {/* User Info Header */}
                    <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full font-bold text-white flex items-center justify-center ${getAvatarColor()}`}>
                          {getAvatarInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{user.fullName || user.email}</p>
                          <p className="text-xs text-teal-100 truncate">{user.email}</p>
                          <p className="text-xs text-teal-100 mt-1">👤 {user.role}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Profile */}
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <FaUser className="text-[#03ccba]" size={18} />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">My Profile</p>
                          <p className="text-xs text-gray-500">View your profile</p>
                        </div>
                      </button>

                      {/* Change Password */}
                      <button
                        onClick={() => {
                          navigate('/change-password');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <FaKey className="text-purple-600" size={18} />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Change Password</p>
                          <p className="text-xs text-gray-500">Update your password</p>
                        </div>
                      </button>

                      <hr className="my-2" />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-600" size={18} />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Logout</p>
                          <p className="text-xs text-gray-500">Sign out of account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
              {/* Dashboard */}
              <button
                onClick={() => {
                  navigate('/admin/dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors font-semibold"
              >
                📊 Dashboard
              </button>

              {/* Divider */}
              <hr className="my-2" />

              {/* Profile */}
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
              >
                👤 Profile
              </button>

              {/* Change Password */}
              <button
                onClick={() => {
                  navigate('/change-password');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
              >
                🔑 Change Password
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-red-600 font-bold hover:text-red-700 transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    );
  }

  // ==================== STUDENT/TUTOR NAVBAR ====================
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
            <Link to="/" className="text-gray-700 hover:text-[#03ccba] font-medium transition-colors">
              Home
            </Link>

            {/* Browse Posts - TUTOR ONLY */}
            {user && user.role === 'TUTOR' && (
              <Link to="/posts" className="text-gray-700 hover:text-[#03ccba] font-medium transition-colors flex items-center gap-2">
                <FaBook size={18} />
                Browse Questions
              </Link>
            )}

            {/* Browse Posts - STUDENT ONLY */}
            {user && user.role === 'USER' && (
              <Link to="/posts" className="text-gray-700 hover:text-[#03ccba] font-medium transition-colors">
                Browse Posts
              </Link>
            )}

            {/* Browse Courses */}
            <Link to="/courses" className="text-gray-700 hover:text-[#03ccba] font-medium transition-colors">
              Browse Courses
            </Link>

            {/* ✅ MY BIDS RECEIVED - Student Only with Badge */}
            {user && user.role === 'USER' && (
              <Link 
                to="/posts/my-received-bids" 
                className="relative flex items-center gap-2 text-gray-700 hover:text-[#03ccba] font-medium transition-colors"
              >
                <FaBook size={18} />
                <span>My Bids</span>
                
                {/* Badge - show unaccepted bids count */}  
                {unacceptedBidsCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    {unacceptedBidsCount}
                  </span>
                )}
              </Link>
            )}

            {/* Chat */}
            <button
              onClick={() => {
                if (!user) navigate('/login');
                else navigate('/chat');
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] font-medium transition-colors"
            >
              <FaComments size={18} />
              Chat
            </button>

            {/* Inventory Dropdown - Student Only */}
            {user && user.role === 'USER' && (
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium">
                  <FaBox size={18} />
                  Inventory
                  <FaChevronDown size={12} />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                  
                  {/* My Posts */}
                  <button
                    onClick={() => navigate('/posts/inventory')}
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
                    onClick={() => navigate('/courses/my-enrolled')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                  >
                    <FaBook size={16} className="text-green-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">My Learning</p>
                      <p className="text-xs text-gray-600">Track your courses</p>
                    </div>
                  </button>

                  {/* My Reviews */}
                  <button
                    onClick={() => navigate('/posts/my-reviews')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                  >
                    <FaStar size={16} className="text-yellow-400" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">My Reviews</p>
                      <p className="text-xs text-gray-600">Reviews you've written</p>
                    </div>
                  </button>

                  {/* My Reports */}
                  <button
                    onClick={() => navigate('/my-reports')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                  >
                    <FaFlag size={16} className="text-red-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">My Reports</p>
                      <p className="text-xs text-gray-600">Reports submitted</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Inventory Dropdown - Tutor Only */}
            {user && user.role === 'TUTOR' && (
              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium">
                  <FaBox size={18} />
                  Inventory
                  <FaChevronDown size={12} />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top z-50">
                  
                  {/* My Courses */}
                  <button
                    onClick={() => navigate('/courses/inventory')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <FaBook size={16} className="text-blue-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">My Courses</p>
                      <p className="text-xs text-gray-600">Manage your courses</p>
                    </div>
                  </button>

                  {/* My Bids */}
                  <button
                    onClick={() => navigate('/posts/my-bids')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                  >
                    <FaHandshake size={16} className="text-green-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">My Bids</p>
                      <p className="text-xs text-gray-600">Your submitted bids</p>
                    </div>
                  </button>

                  {/* My Received Reviews */}
                  <button
                    onClick={() => navigate('/reviews/received')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                  >
                    <FaStar size={16} className="text-yellow-400" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">My Reviews</p>
                      <p className="text-xs text-gray-600">Reviews from students</p>
                    </div>
                  </button>

                  {/* My Reports */}
                  <button
                    onClick={() => navigate('/my-reports?role=tutor')}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors border-t border-gray-100"
                  >
                    <FaFlag size={16} className="text-orange-600" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">My Reports</p>
                      <p className="text-xs text-gray-600">Reports about you</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* ✅ NEW - NOTIFICATION BELL */}
            {user && (
              <NotificationBell />
            )}

            {/* User Menu Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isDropdownOpen ? 'bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full font-bold text-white flex items-center justify-center ${getAvatarColor()}`}>
                    {getAvatarInitials()}
                  </div>
                  <FaChevronDown size={12} className="text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    
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

                    {/* ✅ TUTOR WALLET - Inside Dropdown */}
                    {user && user.role === 'TUTOR' && (
                      <button
                        onClick={() => {
                          navigate('/wallet/tutor');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-green-50 flex items-center gap-3 transition-colors border-b border-gray-100"
                      >
                        <FaWallet className="text-green-600" size={18} />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">My Wallet</p>
                          <p className="text-xs text-green-600 font-bold">
                            {!loadingBalance && balance !== null 
                              ? `${(balance / 1000000).toFixed(1)}M VNĐ` 
                              : 'Loading...'}
                          </p>
                        </div>
                      </button>
                    )}

                    {/* ✅ STUDENT RECHARGE - Inside Dropdown */}
                    {user && user.role === 'USER' && (
                      <button
                        onClick={() => {
                          navigate('/wallet/recharge');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-100"
                      >
                        <FaCoins className="text-blue-600" size={18} />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Recharge Wallet</p>
                          <p className="text-xs text-blue-600">Add money to account</p>
                        </div>
                      </button>
                    )}

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Profile */}
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <FaUser className="text-[#03ccba]" size={18} />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">My Profile</p>
                          <p className="text-xs text-gray-500">View your profile</p>
                        </div>
                      </button>

                      {/* Change Password */}
                      <button
                        onClick={() => {
                          navigate('/change-password');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <FaKey className="text-purple-600" size={18} />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Change Password</p>
                          <p className="text-xs text-gray-500">Update your password</p>
                        </div>
                      </button>

                      <hr className="my-2" />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-600" size={18} />
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Logout</p>
                          <p className="text-xs text-gray-500">Sign out of account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login Button */
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-[#03ccba] transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            <button
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              Home
            </button>

            {user && user.role === 'USER' && (
              <>
                <button
                  onClick={() => {
                    navigate('/posts');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                >
                  Browse Posts
                </button>
              </>
            )}

            {user && user.role === 'TUTOR' && (
              <>
                <button
                  onClick={() => {
                    navigate('/posts');
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                >
                  Browse Questions
                </button>
              </>
            )}

            <button
              onClick={() => {
                navigate('/courses');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              Browse Courses
            </button>

            <button
              onClick={() => {
                navigate('/chat');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
            >
              Chat
            </button>

            {/* Mobile Inventory */}
            {user && user.role === 'USER' && (
              <>
                <button
                  onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                >
                  Inventory {isInventoryOpen ? '▼' : '▶'}
                </button>
                {isInventoryOpen && (
                  <>
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

            {user && user.role === 'TUTOR' && (
              <>
                <button
                  onClick={() => setIsInventoryOpen(!isInventoryOpen)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-[#03ccba] transition-colors"
                >
                  Inventory {isInventoryOpen ? '▼' : '▶'}
                </button>
                {isInventoryOpen && (
                  <>
                    <button
                      onClick={() => {
                        navigate('/courses/inventory');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-8 py-2 text-sm text-gray-600 hover:text-[#03ccba] transition-colors"
                    >
                      My Courses
                    </button>
                    <button
                      onClick={() => {
                        navigate('/posts/my-bids');
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-8 py-2 text-sm text-gray-600 hover:text-[#03ccba] transition-colors"
                    >
                      My Bids
                    </button>
                  </>
                )}
              </>
            )}

            {user && (
              <>
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
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 font-bold hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            )}

            {!user && (
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-[#03ccba] font-bold"
              >
                Login
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

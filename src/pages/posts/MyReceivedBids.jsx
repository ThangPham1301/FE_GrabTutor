import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaBook, FaCheckCircle, FaClock, FaTimesCircle, 
  FaCheck, FaTimes, FaSpinner, FaExclamationCircle, FaCalendar,
  FaPhone, FaEnvelope, FaChevronDown, FaBox, FaPlus
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import postApi from '../../api/postApi';
import notificationApi from '../../api/notificationApi';
import chatApi from '../../api/chatApi';
import userApi from '../../api/userApi';
import Navbar from '../../components/Navbar';

const DEBUG = true;

export default function MyReceivedBids() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [posts, setPosts] = useState([]);
  const [postBids, setPostBids] = useState({});
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingBids, setLoadingBids] = useState({});
  const [expandedPost, setExpandedPost] = useState(null);
  const [processingBid, setProcessingBid] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, accepted
  const [myInfo, setMyInfo] = useState(null);

  // Effects
  useEffect(() => {
    if (!user || user.role !== 'USER') {
      navigate('/login-role');
      return;
    }
    fetchMyPosts();
    fetchMyInfo();
  }, [user, navigate]);

  // Fetch myInfo to get userStatus
  const fetchMyInfo = async () => {
    try {
      const response = await userApi.getMyInfo();
      const myInfoData = response.data || response;
      setMyInfo(myInfoData);
      console.log('📌 userStatus from myInfo:', myInfoData.userStatus);
    } catch (error) {
      console.error('Error fetching myInfo:', error);
    }
  };

  // API Calls
  const fetchMyPosts = async () => {
    try {
      setLoadingPosts(true);
      setError(null);
      
      if (DEBUG) console.log('=== fetchMyPosts START ===');
      
      const response = await postApi.getMyPosts(0, 100);
      
      if (DEBUG) console.log('=== fetchMyPosts SUCCESS ===');
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      if (DEBUG) console.log('Posts loaded:', items.length);
      setPosts(items);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchBidsForPost = async (postId) => {
    // If already loaded, just toggle
    if (postBids[postId]) {
      setExpandedPost(expandedPost === postId ? null : postId);
      return;
    }

    try {
      setLoadingBids(prev => ({ ...prev, [postId]: true }));
      
      if (DEBUG) console.log('=== fetchBidsForPost START ===', postId);
      
      const response = await postApi.getTutorBidsForPost(postId);
      
      if (DEBUG) console.log('=== fetchBidsForPost SUCCESS ===');
      
      let bidsData = [];
      if (response.data && Array.isArray(response.data)) {
        bidsData = response.data;
      } else if (response.data?.items) {
        bidsData = response.data.items;
      } else if (Array.isArray(response)) {
        bidsData = response;
      }
      
      if (DEBUG) console.log('Bids loaded:', bidsData.length);
      
      setPostBids(prev => ({
        ...prev,
        [postId]: bidsData
      }));
      setExpandedPost(postId);
    } catch (err) {
      console.error('Error fetching bids:', err);
    } finally {
      setLoadingBids(prev => ({ ...prev, [postId]: false }));
    }
  };

  // Handlers
  const handleAcceptBid = async (postId, bidId) => {
    // ✅ Check if user is PENDING using myInfo
    if (myInfo?.userStatus === 'PENDING') {
      alert('❌ You have not been verified by Admin yet. Please contact Admin to activate your account.');
      return;
    }
    if (!window.confirm('Are you sure you want to accept this bid? Other bids will be deactivated.')) return;

    try {
      setProcessingBid(bidId);
      
      if (DEBUG) console.log('Accepting bid:', bidId);

      // Find tutor info
      const selectedBid = postBids[postId].find(b => b.id === bidId);
      const tutorId = selectedBid?.tutor?.id;

      // Accept bid
      await postApi.acceptTutorBid(bidId);

      // Send notification to TUTOR
      try {
        const post = posts.find(p => p.id === postId);
        await notificationApi.sendNotification(
          tutorId,
          `Your bid for "${post.title}" has been ACCEPTED! 🎉`,
          'BID_ACCEPTED'
        );
        if (DEBUG) console.log('✅ Notification sent to tutor');
      } catch (notifErr) {
        console.warn('⚠️ Failed to send tutor notification:', notifErr);
      }

      // Send notification to STUDENT (self)
      try {
        const post = posts.find(p => p.id === postId);
        await notificationApi.sendNotification(
          user.userId || user.id,
          `You accepted bid from ${selectedBid?.tutor?.fullName} for "${post?.title}"`,
          'BID_ACCEPTED'
        );
        if (DEBUG) console.log('✅ Notification sent to student');
      } catch (notifErr) {
        console.warn('⚠️ Failed to send student notification:', notifErr);
      }

      // ✅ GET OR CREATE CONVERSATION + NAVIGATE
      try {
        const conversationData = await chatApi.getOrCreateConversation(postId, bidId);
        const roomId = conversationData?.roomId || conversationData?.id;
        
        if (roomId) {
          console.log('✅ Chatroom created/found:', roomId);
          alert('✅ Bid accepted successfully! Opening chatroom...');
          navigate(`/chat?roomId=${roomId}`);
        } else {
          alert('✅ Bid accepted successfully! Notifications sent.');
          // Update bid status
          setPostBids(prev => ({
            ...prev,
            [postId]: prev[postId].map(bid =>
              bid.id === bidId ? { ...bid, status: 'ACCEPTED' } : bid
            )
          }));
          await fetchBidsForPost(postId);
        }
      } catch (chatErr) {
        console.warn('⚠️ Failed to get/create conversation:', chatErr);
        alert('✅ Bid accepted successfully! Notifications sent.');
        // Update bid status
        setPostBids(prev => ({
          ...prev,
          [postId]: prev[postId].map(bid =>
            bid.id === bidId ? { ...bid, status: 'ACCEPTED' } : bid
          )
        }));
        await fetchBidsForPost(postId);
      }
    } catch (err) {
      console.error('Error accepting bid:', err);
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingBid(null);
    }
  };

  const handleDeleteBid = async (postId, bidId) => {
    if (!window.confirm('Delete this bid?')) return;

    try {
      setProcessingBid(bidId);
      
      if (DEBUG) console.log('Deleting bid:', bidId);
      
      await postApi.deleteTutorBid(bidId);
      alert('✅ Bid deleted!');
      
      // Remove bid from list
      setPostBids(prev => ({
        ...prev,
        [postId]: prev[postId].filter(bid => bid.id !== bidId)
      }));
    } catch (err) {
      console.error('Error deleting bid:', err);
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingBid(null);
    }
  };

  const handleViewPost = (postId) => {
    navigate(`/posts/${postId}`);
  };

  const handleChatWithTutor = async (postId, bidId) => {
    try {
      const response = await chatApi.getOrCreateConversation(postId, bidId);
      console.log('Conversation created:', response);
      navigate('/chat');
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation');
    }
  };

  // Helpers
  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <FaCheckCircle className="text-green-600" />;
      case 'REJECTED':
        return <FaTimesCircle className="text-red-600" />;
      case 'PENDING':
        return <FaClock className="text-yellow-600" />;
      default:
        return <FaExclamationCircle className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTotalBids = () => Object.values(postBids).flat().length;
  const getAcceptedBids = () => Object.values(postBids).flat().filter(b => b.status === 'ACCEPTED').length;
  const getPendingBids = () => Object.values(postBids).flat().filter(b => b.status === 'PENDING').length;

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') {
      return matchesSearch;
    } else if (filterStatus === 'pending') {
      const hasPendingBids = postBids[post.id]?.some(b => b.status === 'PENDING');
      return matchesSearch && hasPendingBids;
    } else if (filterStatus === 'accepted') {
      const hasAcceptedBids = postBids[post.id]?.some(b => b.status === 'ACCEPTED');
      return matchesSearch && hasAcceptedBids;
    }
    return matchesSearch;
  });

  // Loading state
  if (loadingPosts) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">Loading your posts and bids...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/posts/inventory')}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <FaArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-5xl font-bold">📝 My Posts & Bids</h1>
              <p className="text-lg text-teal-100">Review tutor bids for your questions</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 flex-wrap">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3 backdrop-blur">
              <p className="text-teal-100 text-sm font-semibold">Total Posts</p>
              <p className="text-3xl font-bold">{posts.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3 backdrop-blur">
              <p className="text-teal-100 text-sm font-semibold">Total Bids</p>
              <p className="text-3xl font-bold">{getTotalBids()}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3 backdrop-blur">
              <p className="text-teal-100 text-sm font-semibold">Accepted</p>
              <p className="text-3xl font-bold text-green-300">{getAcceptedBids()}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3 backdrop-blur">
              <p className="text-teal-100 text-sm font-semibold">Pending</p>
              <p className="text-3xl font-bold text-yellow-300">{getPendingBids()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== ERROR MESSAGE ==================== */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
            <p className="text-red-700 font-bold flex items-center gap-2">
              <FaExclamationCircle /> {error}
            </p>
          </div>
        </div>
      )}

      {/* ==================== SEARCH & FILTER ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">🔍 Search</label>
              <input
                type="text"
                placeholder="Search by post title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
              />
            </div>

            {/* Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Filter</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#03ccba] focus:ring-2 focus:ring-[#03ccba] focus:ring-opacity-30 outline-none transition-all"
              >
                <option value="all">All Posts</option>
                <option value="pending">Pending Bids</option>
                <option value="accepted">Accepted Bids</option>
              </select>
            </div>
          </div>
        </div>

        {/* ==================== CONTENT ==================== */}
        {filteredPosts.length === 0 ? (
          <div className="text-center bg-white rounded-2xl p-16 border-2 border-dashed border-gray-300 shadow-sm">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Posts Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first post to receive bids from tutors'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => navigate('/posts/inventory')}
                className="px-8 py-4 bg-[#03ccba] text-white rounded-xl hover:bg-[#02b5a5] transition-all font-bold text-lg"
              >
                <FaPlus className="inline mr-2" />
                Go to My Posts
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
                {/* Post Header - Expandable */}
                <button
                  onClick={() => fetchBidsForPost(post.id)}
                  className="w-full p-6 hover:bg-gray-50 transition-colors text-left flex gap-4 items-start"
                >
                  {/* Post Image */}
                  <div className="flex-shrink-0">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-lg flex items-center justify-center text-white">
                        <FaBook size={32} />
                      </div>
                    )}
                  </div>

                  {/* Post Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{post.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <FaCalendar size={12} />
                        <span>
                          {post.createdAt 
                            ? new Date(post.createdAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric'
                              })
                            : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bids Count & Expand Arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {postBids[post.id] && postBids[post.id].length > 0 && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                        {postBids[post.id].length} bid{postBids[post.id].length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <FaChevronDown
                      size={18}
                      className={`text-gray-600 transition-transform ${expandedPost === post.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {/* Bids List - Expandable */}
                {expandedPost === post.id && (
                  <div className="bg-gray-50 border-t divide-y max-h-96 overflow-y-auto">
                    {loadingBids[post.id] ? (
                      <div className="p-8 text-center">
                        <FaSpinner className="animate-spin text-[#03ccba] text-2xl mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">Loading bids...</p>
                      </div>
                    ) : postBids[post.id] && postBids[post.id].length > 0 ? (
                      postBids[post.id].map(bid => {
                        const isAccepted = bid.status === 'ACCEPTED';
                        const isProcessing = processingBid === bid.id;

                        return (
                          <div 
                            key={bid.id} 
                            className={`p-6 hover:bg-gray-100 transition-colors ${isAccepted ? 'bg-green-50' : ''}`}
                          >
                            {/* Bid Header */}
                            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-gray-200">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-base font-bold text-gray-900">
                                    {bid.tutor?.fullName || 'Unknown Tutor'}
                                  </h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(bid.status)}`}>
                                    {getStatusIcon(bid.status)}
                                    {bid.status}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">{bid.tutor?.email}</p>
                              </div>
                            </div>

                            {/* Bid Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">PROPOSED PRICE</p>
                                <p className="text-lg font-bold text-[#03ccba]">
                                  {bid.proposedPrice?.toLocaleString()} VNĐ/hr
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">LEVEL</p>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                                  {bid.questionLevel || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 font-semibold mb-1">SUBMITTED</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {new Date(bid.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4 pb-4 border-b border-gray-200">
                              <p className="text-xs text-gray-600 font-semibold mb-2">APPROACH / DESCRIPTION</p>
                              <p className="text-gray-700 bg-white rounded-lg p-3 text-sm leading-relaxed whitespace-pre-wrap">
                                {bid.description}
                              </p>
                            </div>

                            {/* Tutor Contact */}
                            {bid.tutor && (
                              <div className="mb-4 pb-4 border-b border-gray-200 flex gap-3">
                                {bid.tutor.phoneNumber && (
                                  <button
                                    onClick={() => window.location.href = `tel:${bid.tutor.phoneNumber}`}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-[#03ccba] transition-colors text-sm font-semibold text-gray-700"
                                    disabled={isAccepted}
                                  >
                                    <FaPhone size={14} className="text-[#03ccba]" />
                                    Call
                                  </button>
                                )}
                                {bid.tutor.email && (
                                  <button
                                    onClick={() => window.location.href = `mailto:${bid.tutor.email}`}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-[#03ccba] transition-colors text-sm font-semibold text-gray-700"
                                    disabled={isAccepted}
                                  >
                                    <FaEnvelope size={14} className="text-[#03ccba]" />
                                    Email
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3">
                              {!isAccepted ? (
                                <>
                                  <button
                                    onClick={() => handleAcceptBid(post.id, bid.id)}
                                    disabled={isProcessing}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all font-bold flex items-center justify-center gap-2"
                                  >
                                    {isProcessing ? (
                                      <>
                                        <FaSpinner className="animate-spin" />
                                        Accepting...
                                      </>
                                    ) : (
                                      <>
                                        <FaCheck />
                                        Accept Bid
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBid(post.id, bid.id)}
                                    disabled={isProcessing}
                                    className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-all font-bold flex items-center justify-center gap-2"
                                  >
                                    {isProcessing ? (
                                      <>
                                        <FaSpinner className="animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      <>
                                        <FaTimes />
                                        Delete
                                      </>
                                    )}
                                  </button>
                                </>
                              ) : (
                                <div className="w-full px-4 py-3 bg-green-50 border-2 border-green-500 rounded-lg text-center">
                                  <p className="text-green-700 font-bold flex items-center justify-center gap-2">
                                    <FaCheckCircle /> Accepted ✅
                                  </p>
                                </div>
                              )}
                              <button
                                onClick={() => handleViewPost(post.id)}
                                className="px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-bold"
                              >
                                View Post
                              </button>
                              {isAccepted && (
                                <button
                                  onClick={() => handleChatWithTutor(post.id, bid.id)}
                                  className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-bold"
                                >
                                  💬 Chat
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-gray-600">
                        <p className="text-sm font-semibold">No bids yet</p>
                        <p className="text-xs mt-2">Tutors will submit bids for this question</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
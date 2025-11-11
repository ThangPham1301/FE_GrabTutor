import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaBook, FaCheckCircle, FaClock, FaTimesCircle, FaCheck, FaTimes, FaSpinner, FaExclamationCircle, FaCalendar } from 'react-icons/fa';
import postApi from '../api/postApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import chatApi from '../api/chatApi';

export default function PostBidsDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [postBids, setPostBids] = useState({});
  const [loadingBids, setLoadingBids] = useState({});
  const [processingBid, setProcessingBid] = useState(null);

  // ✅ Load posts on component mount
  useEffect(() => {
    if (user && user.role === 'USER') {
      fetchMyPosts();
    }
  }, [user]);

  // Load posts from API
  const fetchMyPosts = async () => {
    try {
      setLoadingPosts(true);
      console.log('=== fetchMyPosts START ===');
      
      const response = await postApi.getMyPosts(0, 100);
      
      console.log('=== fetchMyPosts SUCCESS ===');
      console.log('Response:', response);
      
      let items = [];
      if (response.data?.data?.items) {
        items = response.data.data.items;
      } else if (response.data?.items) {
        items = response.data.items;
      } else if (Array.isArray(response.data)) {
        items = response.data;
      } else if (Array.isArray(response)) {
        items = response;
      }
      
      console.log('Posts loaded:', items.length);
      setPosts(items);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch bids for a specific post
  const fetchBidsForPost = async (postId) => {
    // If already loaded, just toggle
    if (postBids[postId]) {
      setExpandedPost(expandedPost === postId ? null : postId);
      return;
    }

    try {
      setLoadingBids(prev => ({ ...prev, [postId]: true }));
      console.log('=== fetchBidsForPost START ===');
      console.log('postId:', postId);
      
      const response = await postApi.getTutorBidsForPost(postId);
      
      console.log('=== fetchBidsForPost SUCCESS ===');
      console.log('Response:', response);
      
      let bidsData = [];
      if (response.data && Array.isArray(response.data)) {
        bidsData = response.data;
      } else if (response.data?.items) {
        bidsData = response.data.items;
      } else if (Array.isArray(response)) {
        bidsData = response;
      }
      
      console.log('Bids loaded:', bidsData.length);
      
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

  // Accept a bid
  const handleAcceptBid = async (postId, bidId) => {
    if (!window.confirm('Bạn có chắc chắn muốn nhận đặt cọc này không? Những đặt cọc khác sẽ bị vô hiệu hóa.')) return;

    try {
      setProcessingBid(bidId);
      console.log('Accepting bid:', bidId);
      
      await postApi.acceptTutorBid(bidId);
      alert('✅ Đặt cọc được chấp nhận!');
      
      // ✅ Cập nhật status
      setPostBids(prev => ({
        ...prev,
        [postId]: prev[postId].map(bid =>
          bid.id === bidId ? { ...bid, status: 'ACCEPTED' } : bid
        )
      }));

      // ✅ Auto-navigate to chat
      setTimeout(async () => {
        try {
          console.log('Creating conversation...');
          const response = await chatApi.getOrCreateConversation(postId, bidId);
          console.log('Conversation created:', response);
          
          // ✅ Auto-navigate to chat
          setTimeout(() => {
            navigate('/chat');
            setIsOpen(false);
          }, 500);
        } catch (error) {
          console.error('Error creating conversation:', error);
          // ✅ Vẫn navigate dù có lỗi
          setTimeout(() => {
            navigate('/chat');
            setIsOpen(false);
          }, 500);
        }
      }, 500);

    } catch (err) {
      console.error('Error accepting bid:', err);
      alert('❌ Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessingBid(null);
    }
  };

  // ✅ NEW - Create conversation and navigate to chat
  const createConversationAndChat = async (postId, tutorBidId) => {
    try {
      const response = await chatApi.getOrCreateConversation(postId, tutorBidId);
      
      console.log('Conversation created/retrieved:', response);
      
      // Redirect to chat page
      navigate('/chat');
      
      // Close dropdown
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Redirecting to chat...');
      navigate('/chat');
    }
  };

  // Delete a bid
  const handleDeleteBid = async (postId, bidId) => {
    if (!window.confirm('Delete this bid?')) return;

    try {
      setProcessingBid(bidId);
      console.log('Deleting bid:', bidId);
      
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
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const bidsCount = Object.values(postBids).flat().length;
  const acceptedCount = Object.values(postBids).flat().filter(b => b.status === 'ACCEPTED').length;

  // Only show for STUDENT/USER
  if (!user || user.role !== 'USER') {
    return null;
  }

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-700 hover:text-[#03ccba] transition-colors font-medium relative"
      >
        <FaBook size={18} />
        Bids
        <FaChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        
        {/* Badge - Show bid count */}
        {bidsCount > 0 && (
          <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {bidsCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white p-4 flex justify-between items-center sticky top-0">
              <h3 className="font-bold text-lg">My Posts & Bids</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Stats */}
            {bidsCount > 0 && (
              <div className="bg-blue-50 border-b border-gray-200 p-3 flex gap-4">
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-600 font-semibold">Total Bids</p>
                  <p className="text-lg font-bold text-blue-600">{bidsCount}</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-xs text-gray-600 font-semibold">Accepted</p>
                  <p className="text-lg font-bold text-green-600">{acceptedCount}</p>
                </div>
              </div>
            )}

            {/* Posts List */}
            <div>
              {loadingPosts ? (
                <div className="p-6 text-center">
                  <FaSpinner className="animate-spin text-[#03ccba] text-2xl mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="p-6 text-center">
                  <FaBook className="text-gray-300 text-3xl mx-auto mb-2" />
                  <p className="text-gray-600 text-sm mb-3">No posts yet</p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/posts/inventory');
                    }}
                    className="px-4 py-2 text-sm bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-semibold"
                  >
                    Create Post
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {posts.map(post => (
                    <div key={post.id} className="border-b last:border-b-0">
                      {/* Post Header - with Image & Date */}
                      <button
                        onClick={() => fetchBidsForPost(post.id)}
                        className="w-full p-3 hover:bg-gray-50 transition-colors text-left flex gap-3"
                      >
                        {/* ✅ NEW - Post Image */}
                        <div className="flex-shrink-0">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-lg flex items-center justify-center text-white">
                              <FaBook size={24} />
                            </div>
                          )}
                        </div>

                        {/* Post Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 line-clamp-1 text-sm">
                            {post.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {post.subject?.name || 'N/A'}
                          </p>
                          
                          {/* ✅ NEW - Created Date */}
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <FaCalendar size={10} />
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

                        {/* Bids Count & Expand Arrow */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {postBids[post.id] && postBids[post.id].length > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                              {postBids[post.id].length}
                            </span>
                          )}
                          <FaChevronDown
                            size={12}
                            className={`transition-transform ${expandedPost === post.id ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </button>

                      {/* Bids List - Expandable */}
                      {expandedPost === post.id && (
                        <div className="bg-gray-50 border-t divide-y">
                          {loadingBids[post.id] ? (
                            <div className="p-4 text-center">
                              <FaSpinner className="animate-spin text-[#03ccba] mx-auto text-sm" />
                            </div>
                          ) : postBids[post.id] && postBids[post.id].length > 0 ? (
                            postBids[post.id].map(bid => {
                              const isAccepted = bid.status === 'ACCEPTED';
                              const isProcessing = processingBid === bid.id;

                              return (
                                <div key={bid.id} className={`p-3 hover:bg-gray-100 transition-colors ${isAccepted ? 'bg-green-50' : ''}`}>
                                  {/* Bid Header */}
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-gray-900">
                                        {bid.tutor?.fullName || 'Unknown Tutor'}
                                      </p>
                                      <p className="text-xs text-gray-600 line-clamp-1">
                                        {bid.tutor?.email}
                                      </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 flex-shrink-0 ${getStatusColor(bid.status)}`}>
                                      {getStatusIcon(bid.status)}
                                      {bid.status}
                                    </span>
                                  </div>

                                  {/* Bid Details */}
                                  <div className="mb-2 space-y-1 text-xs text-gray-700">
                                    <p>💰 <span className="font-bold text-[#03ccba]">{bid.proposedPrice?.toLocaleString()} VNĐ/hr</span></p>
                                    <p>📊 Level: <span className="font-semibold">{bid.questionLevel}</span></p>
                                  </div>

                                  {/* Description */}
                                  <p className="text-xs text-gray-600 bg-white rounded p-2 mb-2 line-clamp-2">
                                    {bid.description}
                                  </p>

                                  {/* Actions */}
                                  <div className="flex gap-2">
                                    {bid.status === 'PENDING' ? (
                                      <>
                                        <button
                                          onClick={() => handleAcceptBid(post.id, bid.id)}
                                          disabled={isProcessing}
                                          className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 font-semibold"
                                        >
                                          {isProcessing ? (
                                            <FaSpinner className="animate-spin" />
                                          ) : (
                                            <>
                                              <FaCheck size={10} />
                                              Accept
                                            </>
                                          )}
                                        </button>
                                        <button
                                          onClick={() => handleDeleteBid(post.id, bid.id)}
                                          disabled={isProcessing}
                                          className="flex-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 font-semibold"
                                        >
                                          {isProcessing ? (
                                            <FaSpinner className="animate-spin" />
                                          ) : (
                                            <>
                                              <FaTimes size={10} />
                                              Delete
                                            </>
                                          )}
                                        </button>
                                      </>
                                    ) : (
                                      <button
                                        disabled
                                        className="w-full px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded cursor-not-allowed font-semibold"
                                      >
                                        {isAccepted ? '✅ Accepted' : bid.status}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center text-xs text-gray-600">
                              No bids yet
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t p-3 flex gap-2 sticky bottom-0">
              <button
                onClick={() => {
                  navigate('/posts/inventory');
                  setIsOpen(false);
                }}
                className="flex-1 px-3 py-2 text-sm bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-semibold"
              >
                View All Posts
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
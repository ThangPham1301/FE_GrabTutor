import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle, FaUser, FaStar, FaPhone, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import postApi from '../../api/postApi';
import Navbar from '../../components/Navbar';

export default function TutorBids() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptedBidId, setAcceptedBidId] = useState(null);
  const [processingBidId, setProcessingBidId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'USER') {
      navigate('/login');
      return;
    }
    fetchTutorBids();
    fetchPostDetail();
  }, [postId, user]);

  const fetchPostDetail = async () => {
    try {
      const response = await postApi.getPostById(postId);
      const postData = response.data?.data || response.data;
      setPost(postData);
    } catch (err) {
      console.error('Error fetching post:', err);
    }
  };

  const fetchTutorBids = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== fetchTutorBids START ===');
      
      const response = await postApi.getTutorBidsForPost(postId);
      
      console.log('=== fetchTutorBids SUCCESS ===');
      console.log('Response:', response);

      // Handle response structure
      let bidsData = [];
      if (response.data && Array.isArray(response.data)) {
        bidsData = response.data;
      } else if (response.data?.items) {
        bidsData = response.data.items;
      } else if (Array.isArray(response)) {
        bidsData = response;
      }

      console.log('Bids:', bidsData);
      setBids(bidsData);

      // Check if any bid is already accepted
      const acceptedBid = bidsData.find(bid => bid.status === 'ACCEPTED');
      if (acceptedBid) {
        setAcceptedBidId(acceptedBid.id);
      }
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError('Failed to load tutor bids');
      setBids([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (window.confirm('Are you sure you want to accept this bid? Other bids will be deactivated.')) {
      try {
        setProcessingBidId(bidId);
        console.log('Accepting bid:', bidId);

        await postApi.acceptTutorBid(bidId);

        alert('✅ Bid accepted successfully!');
        setAcceptedBidId(bidId);
        
        // Refresh bids
        await fetchTutorBids();
      } catch (err) {
        console.error('Error accepting bid:', err);
        alert('❌ Error accepting bid: ' + (err.response?.data?.message || err.message));
      } finally {
        setProcessingBidId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/posts/${postId}`)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <FaArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-5xl font-bold">Tutor Bids</h1>
              <p className="text-lg text-teal-100">Review and select the best tutor for your question</p>
            </div>
          </div>

          {/* Post Title */}
          {post && (
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-3 backdrop-blur">
              <p className="text-teal-100 text-sm">Question:</p>
              <p className="text-2xl font-bold">{post.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Accepted Bid Notification */}
        {acceptedBidId && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-600 text-lg" />
              <div>
                <p className="text-green-700 font-semibold">Bid Accepted!</p>
                <p className="text-green-600 text-sm">You have accepted a bid. Other bids are no longer available.</p>
              </div>
            </div>
          </div>
        )}

        {bids.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <FaClock size={64} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Bids Yet</h2>
            <p className="text-gray-600 mb-6">
              No tutors have submitted bids for your question yet. Check back later!
            </p>
            <button
              onClick={() => navigate(`/posts/${postId}`)}
              className="px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              Back to Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {bids.map((bid) => {
              const isDisabled = acceptedBidId && acceptedBidId !== bid.id;
              const isAccepted = bid.id === acceptedBidId;

              return (
                <div
                  key={bid.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                    isDisabled ? 'opacity-50 pointer-events-none' : ''
                  } ${isAccepted ? 'border-2 border-green-500' : ''}`}
                >
                  <div className="p-8">
                    {/* Header with Status */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {bid.tutor?.fullName?.charAt(0).toUpperCase() || 'T'}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">{bid.tutor?.fullName || 'Unknown Tutor'}</h3>
                            <p className="text-gray-600">{bid.tutor?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${
                        isAccepted
                          ? 'bg-green-100 text-green-800 border-2 border-green-500'
                          : bid.status === 'ACCEPTED'
                          ? 'bg-green-100 text-green-800'
                          : bid.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isAccepted ? <FaCheckCircle /> : <FaClock />}
                        {bid.status || 'PENDING'}
                      </div>
                    </div>

                    {/* Bid Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b-2 border-gray-100">
                      {/* Proposed Price */}
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-2">PROPOSED PRICE</p>
                        <p className="text-3xl font-bold text-[#03ccba]">
                          {bid.proposedPrice?.toLocaleString()} VNĐ/hr
                        </p>
                      </div>

                      {/* Question Level */}
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-2">QUESTION LEVEL</p>
                        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-bold">
                          {bid.questionLevel || 'N/A'}
                        </span>
                      </div>

                      {/* Submitted Date */}
                      <div>
                        <p className="text-gray-600 text-sm font-semibold mb-2">SUBMITTED</p>
                        <p className="text-gray-900 font-semibold">
                          {new Date(bid.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <p className="text-gray-600 text-sm font-semibold mb-3">APPROACH / DESCRIPTION</p>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed whitespace-pre-wrap">
                        {bid.description}
                      </p>
                    </div>

                    {/* Tutor Info */}
                    {bid.tutor && (
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
                        <p className="text-gray-600 text-sm font-semibold mb-3">TUTOR CONTACT</p>
                        <div className="flex flex-wrap gap-4">
                          {bid.tutor.phoneNumber && (
                            <button
                              onClick={() => window.location.href = `tel:${bid.tutor.phoneNumber}`}
                              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-[#03ccba] transition-colors"
                              disabled={isDisabled}
                            >
                              <FaPhone size={16} className="text-[#03ccba]" />
                              <span>{bid.tutor.phoneNumber}</span>
                            </button>
                          )}
                          {bid.tutor.email && (
                            <button
                              onClick={() => window.location.href = `mailto:${bid.tutor.email}`}
                              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:border-[#03ccba] transition-colors"
                              disabled={isDisabled}
                            >
                              <FaEnvelope size={16} className="text-[#03ccba]" />
                              <span>Send Email</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {!isAccepted && (
                      <button
                        onClick={() => handleAcceptBid(bid.id)}
                        disabled={isDisabled || processingBidId === bid.id}
                        className={`w-full px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
                          isDisabled
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white hover:shadow-lg'
                        }`}
                      >
                        {processingBidId === bid.id ? (
                          <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Accepting...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle /> Accept Bid
                          </>
                        )}
                      </button>
                    )}

                    {isAccepted && (
                      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
                        <p className="text-green-700 font-bold flex items-center justify-center gap-2">
                          <FaCheckCircle /> Bid Accepted
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
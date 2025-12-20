import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaArrowLeft, FaStar, FaUser, FaCalendar, FaBook, FaDollarSign, FaSpinner, 
  FaCheck, FaCheckCircle, FaMapMarkerAlt, FaTimes, FaEye, FaDownload
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';
import reviewApi from '../../api/reviewApi';
import ReviewFormModal from '../../components/ReviewFormModal';
import TutorBidModal from '../../components/TutorBidModal';

const DEBUG = true;

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ==================== STATES ====================
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [review, setReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [subjects, setSubjects] = useState([]);
  
  // Image modal
  const [showImageModal, setShowImageModal] = useState(false);
  
  // Bid states
  const [showBidModal, setShowBidModal] = useState(false);
  const [bids, setBids] = useState([]);
  const [hasBidded, setHasBidded] = useState(false);
  const [bidAccepted, setBidAccepted] = useState(false);

  // ==================== EFFECTS ====================
  
  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (!postId) {
      setError('Post ID not found');
      setLoading(false);
      return;
    }
    fetchPostDetail();
    fetchBids();
    if (user) {
      fetchReview();
      checkMyBid();
    }
  }, [postId, user]);

  // ==================== API CALLS ====================
  const fetchSubjects = async () => {
    try {
      const response = await postApi.getSubjects();
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      setSubjects(items);
    } catch (err) {
      console.error('❌ Error fetching subjects:', err);
    }
  };

  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postApi.getPostById(postId);
      const postData = response.data?.data || response.data;

      if (!postData) {
        setError('Post not found');
        return;
      }

      setPost(postData);
    } catch (err) {
      console.error('Error fetching post:', err);
      setError(err.response?.data?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async () => {
    try {
      const response = await reviewApi.getReviewByPostId(postId);
      if (response) {
        setReview(response);
      }
    } catch (err) {
      console.error('Error fetching review:', err);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await postApi.getTutorBidsForPost(postId);
      
      let bidsData = [];
      if (response.data && Array.isArray(response.data)) {
        bidsData = response.data;
      } else if (response.data?.items) {
        bidsData = response.data.items;
      } else if (Array.isArray(response)) {
        bidsData = response;
      }

      setBids(bidsData);
    } catch (err) {
      console.error('Error fetching bids:', err);
    }
  };

  const checkMyBid = async () => {
    try {
      if (user?.role !== 'TUTOR') return;

      const response = await postApi.getTutorBidsForPost(postId);
      
      let bidsData = [];
      if (response.data && Array.isArray(response.data)) {
        bidsData = response.data;
      } else if (response.data?.items) {
        bidsData = response.data.items;
      } else if (Array.isArray(response)) {
        bidsData = response;
      }

      const myBid = bidsData.find(b => b.tutor?.id === user.userId);
      if (myBid) {
        setHasBidded(true);
        if (myBid.status === 'ACCEPTED') {
          setBidAccepted(true);
        }
      }
    } catch (err) {
      console.error('Error checking my bid:', err);
    }
  };

  // ==================== HELPERS ====================
  
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'Not specified';
    
    const subject = subjects.find(s => {
      return s.id === subjectId || String(s.id) === String(subjectId);
    });
    
    return subject?.name || 'Unknown Subject';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'OPEN': {
        icon: '🟢',
        color: 'bg-green-100 text-green-700',
        label: 'Open'
      },
      'IN_PROGRESS': {
        icon: '🔵',
        color: 'bg-blue-100 text-blue-700',
        label: 'In Progress'
      },
      'REPORTED': {
        icon: '🚩',
        color: 'bg-red-100 text-red-700',
        label: 'Reported'
      },
      'SOLVED': {
        icon: '✅',
        color: 'bg-emerald-100 text-emerald-700',
        label: 'Solved'
      },
      'CLOSED': {
        icon: '🔒',
        color: 'bg-gray-100 text-gray-700',
        label: 'Closed'
      }
    };

    const statusInfo = statusMap[status] || statusMap['OPEN'];

    return (
      <div className="flex items-center gap-2">
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusInfo.color} flex items-center gap-2`}>
          {statusInfo.icon} {statusInfo.label}
        </span>
      </div>
    );
  };

  const getStatusLabel = (status) => {
    const labels = {
      'OPEN': 'Open',
      'REPORTED': 'Reported',
      'SOLVED': 'Solved',
      'CLOSED': 'Closed'
    };
    return labels[status] || status || 'Unknown';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      'OPEN': 'text-green-600',
      'REPORTED': 'text-red-600',
      'SOLVED': 'text-emerald-600',
      'CLOSED': 'text-gray-600'
    };
    return colors[status] || 'text-gray-600';
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <FaSpinner className="animate-spin text-5xl text-[#03ccba] mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-semibold">Loading question...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-700 mb-2">❌ Error</h2>
            <p className="text-red-600 mb-4">{error || 'Question not found'}</p>
            <button
              onClick={() => navigate('/posts')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
            >
              ← Back to Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== IMAGE MODAL ====================
  const ImageModal = () => {
    if (!showImageModal || !post.imageUrl) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        onClick={() => setShowImageModal(false)}
      >
        <div 
          className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
          >
            <FaTimes size={24} className="text-gray-900" />
          </button>

          {/* Image */}
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-auto max-h-[85vh] object-contain"
          />

          {/* Download Button */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <a
              href={post.imageUrl}
              download
              className="bg-[#03ccba] text-white px-4 py-2 rounded-lg hover:bg-[#02b5a5] transition-colors font-bold flex items-center gap-2 shadow-lg"
            >
              <FaDownload size={16} /> Download
            </a>
          </div>
        </div>
      </div>
    );
  };

  // ✅ NEW - Handler để chuyển đến MyReceivedBids
  const handleViewBids = () => {
    // Chuyển đến trang MyReceivedBids với post ID trong query params
    navigate(`/posts/my-received-bids?postId=${postId}`);
  };

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/posts')}
            className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity text-teal-100 hover:text-white font-semibold"
          >
            <FaArrowLeft size={20} /> Back to Questions
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{post.title}</h1>
          <p className="text-teal-100 text-lg flex items-center gap-2">
            <FaBook /> {getSubjectName(post.subjectId || post.subject?.id)}
          </p>
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ==================== MAIN CONTENT ==================== */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ✅ Post Image with Modal */}
            {post.imageUrl && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden group">
                <div className="relative h-96 bg-gray-100 overflow-hidden cursor-pointer">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onClick={() => setShowImageModal(true)}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-[#03ccba] px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg"
                    >
                      <FaEye size={18} /> View Full Image
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">📝</span> Description
              </h2>
              <p className="text-gray-700 text-lg whitespace-pre-wrap leading-relaxed">
                {post.description}
              </p>
            </div>

            {/* ✅ Post Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">ℹ️</span> Question Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Subject */}
                <div className="flex items-start gap-4 pb-6 border-b md:border-b-0">
                  <FaBook className="text-[#03ccba] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Subject</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {getSubjectName(post.subjectId || post.subject?.id)}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start gap-4 pb-6 border-b md:border-b-0">
                  <span className="text-xl mt-1 flex-shrink-0">🎯</span>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Status</p>
                    <div className="mt-2">
                      {getStatusBadge(post.status || 'OPEN')}
                    </div>
                  </div>
                </div>

                {/* Location */}
                {post.location && (
                  <div className="flex items-start gap-4 pb-6 border-b md:border-b-0">
                    <FaMapMarkerAlt className="text-[#03ccba] text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Location</p>
                      <p className="text-lg font-bold text-gray-900 mt-1">{post.location}</p>
                    </div>
                  </div>
                )}

                {/* Posted Date */}
                <div className="flex items-start gap-4 pb-6 border-b md:border-b-0">
                  <FaCalendar className="text-[#03ccba] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Posted</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Bids Count */}
                <div className="flex items-start gap-4 pb-6 border-b md:border-b-0">
                  <span className="text-xl mt-1 flex-shrink-0">🤝</span>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Tutor Bids</p>
                    <p className="text-lg font-bold text-[#03ccba] mt-1">{bids.length} bid{bids.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== SIDEBAR ==================== */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* ==================== QUICK ACTIONS ==================== */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">⚡</span> Quick Actions
              </h3>

              <div className="space-y-3">
                {/* STUDENT - No bids yet */}
                {user && user.role === 'USER' && bids.length === 0 && (
                  <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm font-semibold flex items-center gap-2">
                      <FaClock size={16} /> Waiting for tutor bids...
                    </p>
                    <p className="text-blue-700 text-xs mt-2">
                      Tutors will review your question and submit their bids
                    </p>
                  </div>
                )}

                {/* STUDENT - Has bids */}
                {user && user.role === 'USER' && bids.length > 0 && (
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm font-bold flex items-center gap-2">
                      <FaCheckCircle size={16} /> Question has bids
                    </p>
                    <p className="text-green-700 text-xs mt-2">
                      Check the bids and select your tutor
                    </p>
                    <button
                      onClick={handleViewBids}
                      className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm"
                    >
                      View {bids.length} Bid{bids.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                )}

                {/* TUTOR - Not bidded yet */}
                {user && user.role === 'TUTOR' && !hasBidded && post?.status === 'OPEN' && (
                  <button
                    onClick={() => setShowBidModal(true)}
                    className="w-full px-6 py-4 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2 text-base"
                  >
                    <FaCheckCircle size={18} />
                    💰 Submit Bid
                  </button>
                )}

                {/* TUTOR - Already bidded */}
                {user && user.role === 'TUTOR' && hasBidded && !bidAccepted && (
                  <div className="p-4 bg-gray-100 border-2 border-gray-300 rounded-lg cursor-not-allowed">
                    <p className="text-gray-800 text-sm font-bold flex items-center gap-2">
                      <FaCheck size={16} /> Bid Submitted
                    </p>
                    <p className="text-gray-700 text-xs mt-2">
                      Your bid is pending student's review
                    </p>
                    <button
                      disabled
                      className="mt-3 w-full px-4 py-2 bg-gray-400 text-white rounded-lg font-bold text-sm cursor-not-allowed"
                    >
                      Waiting for Response...
                    </button>
                  </div>
                )}

                {/* TUTOR - Bid Accepted */}
                {user && user.role === 'TUTOR' && bidAccepted && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-lg">
                    <p className="text-emerald-800 text-sm font-bold flex items-center gap-2">
                      <FaCheckCircle size={16} className="text-emerald-600" /> You're the Tutor!
                    </p>
                    <p className="text-emerald-700 text-xs mt-2">
                      Your bid was accepted. Start tutoring!
                    </p>
                    <button
                      onClick={() => navigate('/chat')}
                      className="mt-3 w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-bold text-sm"
                    >
                      📞 Contact Student
                    </button>
                  </div>
                )}

                {/* Not logged in */}
                {!user && (
                  <button
                    onClick={() => navigate('/login-role')}
                    className="w-full px-6 py-4 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
                  >
                    🔐 Login to Bid
                  </button>
                )}
              </div>
            </div>

            {/* ==================== REVIEW SECTION ==================== */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">⭐</span> Review
              </h3>

              {review ? (
                <div className="space-y-4">
                  {/* Stars Display */}
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        size={24}
                        className={i < review.stars ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                    <span className="ml-3 text-sm font-bold text-gray-700">
                      {review.stars}/5 Stars
                    </span>
                  </div>

                  {/* Description Display */}
                  {review.description && (
                    <div>
                      <p className="text-gray-700 leading-relaxed italic">
                        "{review.description}"
                      </p>
                    </div>
                  )}

                  {/* Date Display */}
                  {review.createdAt && (
                    <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                      Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 text-base mb-4 font-semibold">
                    😊 No review yet
                  </p>
                  <p className="text-gray-500 text-sm">
                    Complete tutoring to leave a review
                  </p>
                  
                  {/* Show review button for students if post is solved - DISABLED */}
                  {false && user && user.role === 'USER' && post?.status === 'SOLVED' && !review && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="mt-4 px-4 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-bold text-sm"
                    >
                      ⭐ Leave Review
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Poster Info */}
            {post.posterName && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FaUser size={20} /> Student
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {post.posterName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{post.posterName}</p>
                    <p className="text-xs text-gray-600">Student</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== IMAGE MODAL ==================== */}
      <ImageModal />

      {/* ==================== BID MODAL ==================== */}
      {showBidModal && (
        <TutorBidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          onSuccess={() => {
            setShowBidModal(false);
            checkMyBid();
            fetchBids();
          }}
          post={post}
        />
      )}

      {/* ==================== REVIEW FORM MODAL - DISABLED ==================== */}
      {false && showReviewForm && (
        <ReviewFormModal
          isOpen={showReviewForm}
          postId={postId}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            setShowReviewForm(false);
            fetchReview();
          }}
          existingReview={review}
        />
      )}
    </div>
  );
}
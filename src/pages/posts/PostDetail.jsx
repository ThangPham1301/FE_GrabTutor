import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaArrowLeft, FaStar, FaUser, FaCalendar, FaBook, FaDollarSign, FaSpinner, FaCheck, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';
import reviewApi from '../../api/reviewApi';
import ReviewFormModal from '../../components/ReviewFormModal';

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

  // ==================== EFFECTS ====================
  
  // ✅ Fetch subjects on mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // ✅ Fetch post detail
  useEffect(() => {
    if (!postId) {
      setError('Post ID not found');
      setLoading(false);
      return;
    }

    fetchPostDetail();
    if (user) {
      fetchReview();
    }
  }, [postId, user]);

  // ==================== API CALLS ====================
  const fetchSubjects = async () => {
    try {
      console.log('=== fetchSubjects START ===');
      const response = await postApi.getSubjects();
      
      console.log('=== fetchSubjects RESPONSE ===');
      console.log('Full response:', response);
      
      let items = [];
      if (response.data?.items && Array.isArray(response.data.items)) {
        items = response.data.items;
      } else if (response.data && Array.isArray(response.data)) {
        items = response.data;
      }
      
      console.log('📚 Subjects count:', items.length);
      items.forEach((subject, idx) => {
        console.log(`[Subject ${idx}]: id=${subject.id}, name=${subject.name}`);
      });
      
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
      console.log('Post loaded:', postData);
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

  // ==================== HANDLERS ====================
  
  // ✅ Get subject name from subjectId
  const getSubjectName = (subjectId) => {
    if (!subjectId) return 'Not specified';
    
    const subject = subjects.find(s => {
      // Match: s.id === subjectId (dù là string hay number)
      return s.id === subjectId || String(s.id) === String(subjectId);
    });
    
    console.log(`🔍 Finding subject: id=${subjectId}, found=${subject?.name || 'NOT FOUND'}`);
    return subject?.name || 'Unknown Subject';
  };

  // ✅ Helper function - Get status badge color & icon
  const getStatusBadge = (status) => {
    const statusMap = {
      'OPEN': {
        icon: '🟢',
        color: 'bg-green-100 text-green-700',
        label: 'Open'
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

  // ✅ Helper function - Get status label
  const getStatusLabel = (status) => {
    const labels = {
      'OPEN': 'Open',
      'REPORTED': 'Reported',
      'SOLVED': 'Solved',
      'CLOSED': 'Closed'
    };
    return labels[status] || status || 'Unknown';
  };

  // ✅ Helper function - Get status color for text
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
          <p className="text-gray-600 text-lg">Loading post...</p>
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
            <p className="text-red-600 mb-4">{error || 'Post not found'}</p>
            <button
              onClick={() => navigate('/posts')}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ← Back to Posts
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ==================== HEADER ==================== */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/posts')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity text-teal-100 hover:text-white"
          >
            <FaArrowLeft /> Back to Posts
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{post.title}</h1>
          {/* ✅ Display subject name from subjectId */}
          <p className="text-teal-100 text-lg">
            📖 {getSubjectName(post.subjectId || post.subject?.id)}
          </p>
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ==================== MAIN CONTENT ==================== */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ✅ Post Image */}
            {post.imageUrl && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* ✅ Description */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📝 Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {post.description}
              </p>
            </div>

            {/* ✅ Post Details */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ℹ️ Post Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Subject */}
                <div className="flex items-start gap-3">
                  <FaBook className="text-[#03ccba] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Subject</p>
                    <p className="text-lg font-bold text-gray-900">
                      {/* ✅ Use getSubjectName helper */}
                      {getSubjectName(post.subjectId || post.subject?.id)}
                    </p>
                  </div>
                </div>

                {/* Fee */}
                {post.fee && (
                  <div className="flex items-start gap-3">
                    <FaDollarSign className="text-[#03ccba] text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Fee</p>
                      <p className="text-lg font-bold text-[#03ccba]">
                        {typeof post.fee === 'number' 
                          ? `${post.fee.toLocaleString()} VNĐ/hour`
                          : post.fee
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {post.location && (
                  <div className="flex items-start gap-3">
                    <span className="text-[#03ccba] text-xl mt-1 flex-shrink-0">📍</span>
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Location</p>
                      <p className="text-lg font-bold text-gray-900">{post.location}</p>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-start gap-3">
                  <span className="text-[#03ccba] text-xl mt-1 flex-shrink-0">🎯</span>
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">Status</p>
                    <p className={`text-lg font-bold ${
                      post.status === 'OPEN' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {post.status === 'OPEN' ? '🟢 Open' : '🔴 Closed'}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                {post.createdAt && (
                  <div className="flex items-start gap-3">
                    <FaCalendar className="text-[#03ccba] text-xl mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-600 text-sm font-semibold">Posted</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Date(post.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ==================== REVIEW SECTION ==================== */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Review</h2>

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
                      {review.stars}/5 sao
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
                  <p className="text-gray-600 text-lg mb-4">
                    😊 No review yet for this post
                  </p>
                  <p className="text-gray-500 text-sm">
                    Complete a tutoring session to leave a review
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ==================== SIDEBAR ==================== */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>

              {/* Buttons Section */}
              <div className="space-y-3">
                {/* Student - Waiting for bids */}
                {user && user.role === 'USER' && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-blue-800 text-sm font-semibold">
                      ⏳ Waiting for tutor bids...
                    </p>
                  </div>
                )}

                {/* Tutor - Submit Bid Button */}
                {user && user.role === 'TUTOR' && post?.status === 'OPEN' && (
                  <button
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
                  >
                    <FaCheckCircle size={18} />
                    💰 Submit Bid
                  </button>
                )}

                {/* Not logged in */}
                {!user && (
                  <button
                    onClick={() => navigate('/login-role')}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg transition-all font-bold"
                  >
                    🔐 Login to Bid
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== REVIEW FORM MODAL ==================== */}
      {showReviewForm && (
        <ReviewFormModal
          isOpen={showReviewForm}
          postId={postId}
          onClose={() => setShowReviewForm(false)}
          onSuccess={() => {
            setShowReviewForm(false);
            fetchReview(); // Reload review
          }}
          existingReview={review}
        />
      )}
    </div>
  );
}
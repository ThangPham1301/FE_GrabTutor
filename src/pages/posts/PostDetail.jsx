import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaArrowLeft, FaStar, FaUser, FaCalendar, FaBook, FaDollarSign } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import postApi from '../../api/postApi';
import reviewApi from '../../api/reviewApi';
import ReviewForm from '../../components/ReviewForm';
import TutorBidModal from '../../components/TutorBidModal';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ States
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [review, setReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);

  // ✅ Fetch post detail - NO AUTH REQUIRED
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

  // ✅ Handlers
  const handleBidSubmit = async (bidData) => {
    try {
      await postApi.tutorBid({
        postId: parseInt(postId),
        proposedPrice: bidData.price,
        questionLevel: bidData.level,
        description: bidData.description
      });
      alert('✅ Bid submitted successfully!');
      setShowBidModal(false);
    } catch (err) {
      alert('❌ Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReviewSuccess = () => {
    fetchReview();
    setShowReviewForm(false);
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#03ccba]"></div>
        </div>
      </div>
    );
  }

  // ✅ Error State
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

  // ✅ Main Content
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ✅ Header */}
      <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/posts')}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity text-teal-100 hover:text-white"
          >
            <FaArrowLeft /> Back to Posts
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{post.title}</h1>
          <p className="text-teal-100 text-lg">{post.subject?.name || 'General'}</p>
        </div>
      </div>

      {/* ✅ Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ✅ Main Content - col span 2 */}
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
                      {post.subject?.name || 'Not specified'}
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

            {/* ✅ Review Section */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">⭐ Review</h2>
                {user && user.role === 'USER' && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-[#03ccba] text-white rounded-lg hover:bg-[#02b5a5] transition-colors font-semibold"
                  >
                    {review ? '✏️ Edit Review' : '✍️ Write Review'}
                  </button>
                )}
              </div>

              {review ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          size={20}
                          className={i < review.stars ? 'text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">{review.stars}/5</span>
                  </div>
                  {review.description && (
                    <p className="text-gray-700">{review.description}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 italic">No review yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* ✅ Sidebar - Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>

              {/* ✅ Tutor Bid Button */}
              {user && user.role === 'TUTOR' && (
                <button
                  onClick={() => setShowBidModal(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                >
                  🤝 Submit Bid
                </button>
              )}

              {/* ✅ Student Waiting Message */}
              {user && user.role === 'USER' && (
                <div className="p-4 bg-blue-50 rounded-lg text-center border-l-4 border-blue-400">
                  <p className="text-sm text-blue-700 font-semibold">
                    Waiting for tutor bids...
                  </p>
                </div>
              )}

              {/* ✅ Login Prompt */}
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 bg-[#03ccba] text-white rounded-lg font-bold hover:bg-[#02b5a5] transition-colors"
                >
                  🔐 Login to Bid
                </button>
              )}

              {/* ✅ Report Button */}
              <button
                onClick={() => navigate(`/posts/${postId}/report`)}
                className="w-full px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                🚩 Report Post
              </button>

              {/* ✅ Status Badge */}
              <div className="pt-4 border-t">
                <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm ${
                  post.status === 'OPEN'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {post.status === 'OPEN' ? '✅ Open for Bids' : '❌ Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          postId={postId}
          onClose={() => setShowReviewForm(false)}
          onSuccess={handleReviewSuccess}
          existingReview={review}
        />
      )}

      {/* ✅ Bid Modal */}
      <TutorBidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        onSuccess={() => {
          setShowBidModal(false);
          fetchTutorBids?.();
        }}
        post={post}
      />
    </div>
  );
}
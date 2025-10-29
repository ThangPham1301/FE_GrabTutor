import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFlag, FaArrowLeft, FaCalendar, FaStar, FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUser, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import postApi from '../../api/postApi';
import reviewApi from '../../api/reviewApi';
import ReviewForm from '../../components/ReviewForm';
import Navbar from '../../components/Navbar';

export default function PostDetail() {
  const navigate = useNavigate();
  const { id: postId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReview, setLoadingReview] = useState(false);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isOwnerOfPost, setIsOwnerOfPost] = useState(false);

  useEffect(() => {
    console.log('=== PostDetail useEffect ===');
    console.log('postId:', postId);
    console.log('user:', user);
    
    fetchPostDetail();
    // Fetch review cho tất cả user
    if (user) {
      fetchReview();
      checkIsPostOwner();  // ← Thêm kiểm tra owner
    }
  }, [postId, user]);

  const fetchPostDetail = async () => {
    try {
      console.log('=== fetchPostDetail START ===');
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', !!token);
      
      setLoading(true);
      const response = await postApi.getPostById(postId);
      let postData = response.data?.data || response.data;
      
      console.log('=== fetchPostDetail SUCCESS ===');
      console.log('Post data:', postData);
      
      setPost(postData);
      setError(null);
    } catch (err) {
      console.error('=== fetchPostDetail ERROR ===');
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.response?.data?.message);
      setError(err.response?.data?.message || 'Unable to load post');
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async () => {
    try {
      setLoadingReview(true);
      const response = await reviewApi.getReviewByPostId(postId);
      console.log('=== fetchReview DEBUG ===');
      console.log('Response received:', response);
      
      if (response && typeof response === 'object' && response.id) {
        console.log('✅ Valid review object, setting review');
        setReview(response);
      } else {
        console.log('❌ Not a valid review object, setting null');
        setReview(null);
      }
    } catch (err) {
      console.log('❌ Error fetching review:', err.message);
      setReview(null);
    } finally {
      setLoadingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!review?.id) return;
    
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        console.log('Deleting review with ID:', review.id);
        await reviewApi.deleteReview(review.id);
        alert('Review deleted successfully!');
        setReview(null);
      } catch (err) {
        alert('Error deleting review!');
        console.error('Error:', err);
      }
    }
  };

  const handleReviewSuccess = () => {
    console.log('Review submitted successfully, refetching...');
    fetchReview();
    setShowReviewForm(false);
  };

  // ✅ Kiểm tra xem post này có trong danh sách "my posts" không
  const checkIsPostOwner = async () => {
    try {
      console.log('=== checkIsPostOwner START ===');
      const response = await postApi.getMyPosts(0, 100);  // Lấy 100 posts đầu
      
      let myPosts = [];
      if (response.data?.data?.items) {
        myPosts = response.data.data.items;
      } else if (response.data?.items) {
        myPosts = response.data.items;
      } else if (Array.isArray(response.data)) {
        myPosts = response.data;
      }
      
      console.log('My posts:', myPosts);
      console.log('Looking for postId:', postId);
      
      const foundPost = myPosts.find(p => p.id === postId);
      const isOwner = !!foundPost;
      
      console.log('Found post:', foundPost);
      console.log('Is owner:', isOwner);
      
      setIsOwnerOfPost(isOwner);
    } catch (err) {
      console.error('checkIsPostOwner error:', err);
      setIsOwnerOfPost(false);
    }
  };

  // Thay `isOwner` bằng `isOwnerOfPost` ở dưới
  const isOwner = isOwnerOfPost;

  // ✅ Kiểm tra xem review có phải của user hiện tại hay không
  const isMyReview = () => {
    if (!user || !review) return false;
    return review.userId === user.userId;
  };

  const isReviewOwner = isMyReview();

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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate('/posts')}
            className="flex items-center gap-2 px-4 py-2 mb-6 text-[#03ccba] hover:bg-gray-100 rounded-lg transition-colors font-semibold"
          >
            <FaArrowLeft /> Back to Posts
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <p className="text-red-500 text-xl mb-4">{error || 'Post not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/posts')}
          className="flex items-center gap-2 px-4 py-2 mb-8 text-[#03ccba] hover:bg-white rounded-lg transition-all font-semibold"
        >
          <FaArrowLeft size={18} /> Back to Browse
        </button>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Post Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Post Image */}
            {post.imageUrl && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Post Title & Meta */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b-2 border-gray-200">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-xs text-gray-600 font-semibold">Subject</p>
                  <p className="text-lg font-bold text-gray-900">{post.subject?.name || 'N/A'}</p>
                </div>

                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-xs text-gray-600 font-semibold">Created</p>
                  <p className="text-sm font-bold text-gray-900">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-400">
                  <p className="text-xs text-gray-600 font-semibold">Updated</p>
                  <p className="text-sm font-bold text-gray-900">
                    {post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-400">
                  <p className="text-xs text-gray-600 font-semibold">ID</p>
                  <p className="text-sm font-bold text-gray-900">#{post.id}</p>
                </div>
              </div>
            </div>

            {/* Post Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {post.description}
              </p>
            </div>

            {/* Review Section */}
            {user && (
              <div className="bg-gradient-to-r from-[#03ccba] to-[#02b5a5] rounded-2xl shadow-lg p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">⭐ Post Review</h3>
                
                {loadingReview ? (
                  <p className="text-teal-100">Loading review...</p>
                ) : isOwner ? (
                  <>
                    {/* Owner can review their own post */}
                    {review ? (
                      <div className="space-y-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                  key={star}
                                  size={24}
                                  className={star <= review.stars ? 'text-yellow-300' : 'text-white opacity-30'}
                                />
                              ))}
                            </div>
                            <span className="font-bold text-xl">{review.stars}/5 Stars</span>
                          </div>
                          
                          {review.description && (
                            <p className="text-teal-50 italic mb-4">
                              "{review.description}"
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowReviewForm(true)}
                            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold flex items-center justify-center gap-2 transition-colors"
                          >
                            <FaEdit /> Edit Review
                          </button>
                          <button
                            onClick={handleDeleteReview}
                            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold flex items-center justify-center gap-2 transition-colors"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-teal-100">Share your feedback about this post</p>
                        <button
                          onClick={() => setShowReviewForm(true)}
                          className="w-full px-6 py-3 bg-white text-[#03ccba] rounded-lg hover:shadow-lg font-bold transition-all"
                        >
                          ✏️ Write Review
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 bg-white bg-opacity-20 border-l-4 border-white rounded-lg">
                    <p className="text-teal-100">
                      ℹ️ Only post creators can review their own posts
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar (1 col) */}
          <div className="space-y-6">
            
            {/* Contact Card */}
            {post.user && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-20">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaUser className="text-[#03ccba]" /> Contact Info
                </h3>

                {/* User Profile */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#03ccba] to-[#02b5a5] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {post.user.fullName?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{post.user.fullName || 'N/A'}</p>
                      <p className="text-xs text-gray-600">{post.user.role || 'User'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  {/* Email */}
                  {post.user.email && (
                    <div className="flex items-start gap-3">
                      <FaEnvelope className="text-[#03ccba] mt-1 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Email</p>
                        <a href={`mailto:${post.user.email}`} className="text-sm text-[#03ccba] hover:underline font-semibold">
                          {post.user.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {post.user.phoneNumber && (
                    <div className="flex items-start gap-3">
                      <FaPhone className="text-[#03ccba] mt-1 flex-shrink-0" size={18} />
                      <div>
                        <p className="text-xs text-gray-600 font-semibold">Phone</p>
                        <a href={`tel:${post.user.phoneNumber}`} className="text-sm text-[#03ccba] hover:underline font-semibold">
                          {post.user.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <button
                    onClick={() => window.location.href = `mailto:${post.user.email}`}
                    className="w-full px-4 py-3 bg-gradient-to-r from-[#03ccba] to-[#02b5a5] text-white rounded-lg hover:shadow-lg font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <FaEnvelope size={16} /> Send Message
                  </button>
                </div>
              </div>
            )}

            {/* Action Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/posts')}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-bold transition-colors"
                >
                  Browse More
                </button>
                <button
                  onClick={() => navigate(`/posts/${postId}/report`)}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <FaFlag size={16} /> Report Post
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-blue-600" /> Post Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-bold text-green-600">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Visibility</span>
                  <span className="font-bold text-[#03ccba]">Public</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal - CHỈ CHO CHỦ POST */}
      {showReviewForm && isOwner && (
        <ReviewForm
          postId={postId}
          existingReview={review}
          onClose={() => setShowReviewForm(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}